from flask import Flask, request, jsonify, send_from_directory
import pandas as pd
import mplfinance as mpf
import os
import logging
from flask_cors import CORS
import matplotlib
import uuid
import shutil
matplotlib.use('Agg')

app = Flask(__name__)
CORS(app)
logging.basicConfig(level=logging.DEBUG)


@app.route('/generate-candlestick', methods=['POST'])
def generate_candlestick():
    logging.info("Received a request to /generate-candlestick")

    try:
        # Extract JSON data from the request
        data = request.json['data']
        ticker = request.json['ticker']
        logging.debug(f"Data received: {data}")
        logging.debug(f"Ticker: {ticker}")

        # Define the column names for the DataFrame
        columns = ['mts', 'open', 'close', 'high', 'low', 'volume']

        df = pd.DataFrame(data, columns=columns)

        df['date'] = pd.to_datetime(df['mts'], unit='ms')
        df.set_index('date', inplace=True)
        logging.debug({df.head})
        # Here, we'll use the '1h' resample since the data from Bitfinex is on an hourly basis.
        # We can use the CLOSE prices for this example
        unique_filename = f"{uuid.uuid4()}.png"
        filepath = os.path.join("backend/temp_images", unique_filename)

        mpf.plot(df,
                 type='candle',
                 volume=True,
                 style='yahoo',
                 figscale=1.25,
                 width_adjuster_version='v0',
                 title=f'{ticker} chart',  # Use the ticker as the title
                 savefig=filepath)
        logging.debug(filepath)
        return jsonify({"image_url": f"/backend/temp_images/{unique_filename}"})

    except Exception as e:
        logging.error(f"An error occurred: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route('/backend/temp_images/<filename>', methods=['GET'])
def serve_image(filename):
    """Serves an image from the temp_images directory."""
    return send_from_directory("temp_images", filename)


@app.route('/delete-temp-images', methods=['DELETE'])
def delete_temp_images():
    try:
        logging.debug('received request to delete data')
        # Remove the directory and its contents
        shutil.rmtree('backend/temp_images')
        os.makedirs('backend/temp_images')   # Recreate the directory
        return jsonify({"message": "Temporary images deleted successfully."}), 200
    except Exception as e:
        logging.error(
            f"An error occurred while deleting temporary images: {str(e)}")
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
