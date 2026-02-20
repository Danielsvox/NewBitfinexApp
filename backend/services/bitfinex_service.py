# here we will interact with the Bitfinex API
from bfxapi import Client, PUB_REST_HOST
from utils.helpers import TradingPairSlicer


def fetch_tickers_data():
    bfx = Client(rest_host=PUB_REST_HOST)

    # bfxapi v4: get_t_tickers only accepts `symbols`, no filter_usd param
    tickers = bfx.rest.public.get_t_tickers(symbols='ALL')

    # bfxapi v4: get_verbose_names() is gone; use the conf endpoint instead.
    # Returns [[symbol, label], ...] e.g. [["BTC", "Bitcoin"], ...]
    try:
        verbose_data = bfx.rest.public.conf("pub:map:currency:label")
        verbose_name_mapping = {entry[0]: entry[1] for entry in verbose_data}
    except Exception:
        verbose_name_mapping = {}

    # Collect both USD and UST (USDT) spot pairs per base currency.
    # UST is how Bitfinex internally represents USDT (e.g. tBTCUST).
    by_base = {}   # base -> {'USD': (symbol, ticker_data), 'USDT': (symbol, ticker_data)}

    for ticker_name, ticker_data in tickers.items():
        base, quote = TradingPairSlicer(ticker_name[1:])
        if quote == 'USD':
            by_base.setdefault(base, {})['USD'] = (ticker_name, ticker_data)
        elif quote == 'UST':
            by_base.setdefault(base, {})['USDT'] = (ticker_name, ticker_data)

    modified_tickers = {}

    for base, pairs in by_base.items():
        verb_name = verbose_name_mapping.get(base, base)

        # Prefer the USD pair for the primary display price; fall back to USDT.
        if 'USD' in pairs:
            ticker_name, ticker_data = pairs['USD']
            primary_quote = 'USD'
        else:
            ticker_name, ticker_data = pairs['USDT']
            primary_quote = 'USDT'

        # availableQuotes tells the frontend which quote currencies can be used
        # when placing a trade for this asset.
        available_quotes = tuple(sorted(pairs.keys()))  # e.g. ('USD',) or ('USD','USDT')

        modified_key = (ticker_name, base, primary_quote, verb_name, available_quotes)
        modified_tickers[modified_key] = ticker_data

    return modified_tickers
