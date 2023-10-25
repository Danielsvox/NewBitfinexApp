import os
import logging
import uuid
import shutil
from typing import List
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import pandas as pd
import mplfinance as mpf
import matplotlib
from bfxapi import Client, PUB_REST_HOST
from bfxapi.types import TradingPairTicker

# Constants
SERVER_HOST = '0.0.0.0'
SERVER_PORT = 5000
modified_tickers = {}

# Configuration
app = Flask(__name__)
CORS(app)
logging.basicConfig(level=logging.DEBUG)
matplotlib.use('Agg')


def TradingPairSlicer(string: str) -> List[str]:
    """Splits a trading pair string into its components ['BASE', 'QUOTE']."""
    if len(string) > 6:
        return string.split(':')
    else:
        p = 3
        return [string[z - p:z] for z in range(p, len(string) + p, p)]


def transform_data(tickers_dict):
    transformed_data = []
    for key_tuple, value in tickers_dict.items():
        ticker_data = {
            "ticker": key_tuple[0],
            "baseCurrency": key_tuple[1],
            "quoteCurrency": key_tuple[2],
            "verboseName": key_tuple[3],
            # Convert the dataclass instance to a dictionary
            "tickerData": vars(value)
        }
        transformed_data.append(ticker_data)
    return transformed_data


@app.route('/generate-candlestick', methods=['POST'])
def generate_candlestick():
    logging.info("Received a request to /generate-candlestick")

    try:
        # Extract JSON data from the request
        data = request.json['data']
        ticker = request.json['ticker']

        # Define the column names for the DataFrame
        columns = ['mts', 'open', 'close', 'high', 'low', 'volume']

        df = pd.DataFrame(data, columns=columns)
        df = df.sort_values(by='mts', ascending=True)
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


@app.route('/backend/logos/<filename>', methods=['GET'])
def serve_logo(filename):
    """Serves an image from the temp_images directory."""
    try:
        # Try to serve the file using the original filename format
        return send_from_directory("logos", filename)
    except:
        # If the original filename format doesn't exist, serve using the fallback filename format
        # Split by "-" and get the word before "logo"

        base_name = filename.split("-")[-2].upper()
        if base_name == 'BORG':
            base_name = 'CHSB'
        fallback_filename = f"{base_name}.png"
        logging.debug(f'filename: {fallback_filename}')
        # Check if fallback file exists

        return send_from_directory("logos", fallback_filename)


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


@app.route('/get-tickers', methods=['GET'])
def get_tickers():
    data = transform_data(modified_tickers)
    return jsonify(data)


def main():
    global modified_tickers
    bfx = Client(rest_host=PUB_REST_HOST)
    tickers = bfx.rest.public.get_t_tickers(symbols='ALL', filter_usd=True)
    verboseNames = bfx.rest.public.get_verbose_names()

    verbose_name_mapping = {
        entry.symbol: entry.verbName for entry in verboseNames}

    for ticker_name, ticker_data in tickers.items():
        base, quote = TradingPairSlicer(ticker_name[1:])
        verb_name = verbose_name_mapping.get(base, base)
        modified_key = [ticker_name, base, quote, verb_name]
        modified_tickers[tuple(modified_key)] = ticker_data

    app.run(debug=True, host=SERVER_HOST, port=SERVER_PORT)


if __name__ == '__main__':
    main()
