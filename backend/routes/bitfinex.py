from flask import Blueprint, jsonify
from utils.helpers import transform_data
from services.bitfinex_service import fetch_tickers_data

bitfinex = Blueprint('bitfinex', __name__)


@bitfinex.route('/get-tickers', methods=['GET'])
def get_tickers():
    tickers_data = fetch_tickers_data()  # This function is from bitfinex_service.py
    if not tickers_data:
        return jsonify({"error": "No tickers data available"}), 400
    data = transform_data(tickers_data)
    return jsonify(data)
