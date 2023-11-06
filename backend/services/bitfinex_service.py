# here we will interact with the Bitfinex API
from bfxapi import Client, PUB_REST_HOST
from utils.helpers import TradingPairSlicer


def fetch_tickers_data():
    bfx = Client(rest_host=PUB_REST_HOST)
    tickers = bfx.rest.public.get_t_tickers(symbols='ALL', filter_usd=True)
    verboseNames = bfx.rest.public.get_verbose_names()

    verbose_name_mapping = {
        entry.symbol: entry.verbName for entry in verboseNames}

    modified_tickers = {}
    for ticker_name, ticker_data in tickers.items():
        base, quote = TradingPairSlicer(ticker_name[1:])
        verb_name = verbose_name_mapping.get(base, base)
        modified_key = [ticker_name, base, quote, verb_name]
        modified_tickers[tuple(modified_key)] = ticker_data

    return modified_tickers
