import logging

from flask import Blueprint, request, jsonify
from bfxapi import Client, PUB_REST_HOST

from models.user_keys import UserKeys

deposit = Blueprint('deposit', __name__)
log     = logging.getLogger(__name__)

# ── Method display names ──────────────────────────────────────────────────────
# Maps the Bitfinex internal method name → a human-readable label and network tag.
METHOD_META = {
    'BITCOIN':         {'label': 'Bitcoin',          'network': 'BTC'},
    'LIGHTNING':       {'label': 'Bitcoin Lightning', 'network': 'LN'},
    'LITECOIN':        {'label': 'Litecoin',          'network': 'LTC'},
    'ETHEREUM':        {'label': 'Ethereum',          'network': 'ERC-20'},
    'ETHEREUMC':       {'label': 'Ethereum Classic',  'network': 'ETC'},
    'TETHERUSE':       {'label': 'Tether',            'network': 'ERC-20'},
    'TETHERUSX':       {'label': 'Tether',            'network': 'TRC-20'},
    'TETHERUSDTSOL':   {'label': 'Tether',            'network': 'Solana'},
    'TETHERUSDTAVAX':  {'label': 'Tether',            'network': 'Avalanche'},
    'TETHERUSDTTON':   {'label': 'Tether',            'network': 'TON'},
    'RIPPLE':          {'label': 'Ripple',            'network': 'XRP'},
    'EOS':             {'label': 'EOS',               'network': 'EOS'},
    'XLM':             {'label': 'Stellar',           'network': 'XLM'},
    'SOL':             {'label': 'Solana',            'network': 'SOL'},
    'ADA':             {'label': 'Cardano',           'network': 'ADA'},
    'DOT':             {'label': 'Polkadot',          'network': 'DOT'},
    'TRX':             {'label': 'TRON',              'network': 'TRC-20'},
    'DOGE':            {'label': 'Dogecoin',          'network': 'DOGE'},
    'AVAX':            {'label': 'Avalanche',         'network': 'AVAX'},
    'NEAR':            {'label': 'NEAR Protocol',     'network': 'NEAR'},
    'TON':             {'label': 'TON',               'network': 'TON'},
    'LINK':            {'label': 'Chainlink',         'network': 'ERC-20'},
    'SHIB':            {'label': 'Shiba Inu',         'network': 'ERC-20'},
    'PEPE':            {'label': 'Pepe',              'network': 'ERC-20'},
    'ARB':             {'label': 'Arbitrum',          'network': 'ARB'},
    'MKR':             {'label': 'Maker',             'network': 'ERC-20'},
    'AAVE':            {'label': 'Aave',              'network': 'ERC-20'},
    'UNI':             {'label': 'Uniswap',           'network': 'ERC-20'},
    'POL':             {'label': 'Polygon',           'network': 'POL'},
    'SUI':             {'label': 'Sui',               'network': 'SUI'},
    'APT':             {'label': 'Aptos',             'network': 'APT'},
    'XMR':             {'label': 'Monero',            'network': 'XMR'},
    'BCH':             {'label': 'Bitcoin Cash',      'network': 'BCH'},
    'BCHN':            {'label': 'Bitcoin Cash',      'network': 'BCH'},
    'ZEC':             {'label': 'Zcash',             'network': 'ZEC'},
    'XTZ':             {'label': 'Tezos',             'network': 'XTZ'},
}

# Bitfinex currency → list of method names that can deposit it.
# Built from the pub:map:tx:method endpoint (currency is the value, method is the key).
# We keep a static snapshot for the most common currencies to avoid a live API
# call on every request; the /deposit/methods route fetches live data when available.
CURRENCY_TO_METHODS = {
    'BTC':  ['BITCOIN'],
    'LTC':  ['LITECOIN'],
    'ETH':  ['ETHEREUM'],
    'ETC':  ['ETHEREUMC'],
    'XMR':  ['MONERO'],
    'IOT':  ['IOTA'],
    'XRP':  ['RIPPLE'],
    'DSH':  ['DASH'],
    'EOS':  ['EOS'],
    'NEO':  ['NEO'],
    'UST':  ['TETHERUSE', 'TETHERUSX', 'TETHERUSDTSOL', 'TETHERUSDTAVAX', 'TETHERUSDTTON'],
    'TRX':  ['TRX'],
    'XLM':  ['XLM'],
    'XTZ':  ['XTZ'],
    'DOT':  ['DOT'],
    'ADA':  ['ADA'],
    'LINK': ['LINK'],
    'AVAX': ['AVAX'],
    'SOL':  ['SOL'],
    'NEAR': ['NEAR'],
    'DOGE': ['DOGE'],
    'SHIB': ['SHIB'],
    'PEPE': ['PEPE'],
    'ARB':  ['ARB'],
    'MKR':  ['MKR'],
    'AAVE': ['AAVE'],
    'UNI':  ['UNI'],
    'ZEC':  ['ZCASH'],
    'SUI':  ['SUI'],
    'APT':  ['APT'],
    'TON':  ['TON'],
    'XMR':  ['MONERO'],
}

# Currencies that require a tag / memo alongside the address (pool_address field)
MEMO_CURRENCIES = {'XRP', 'XLM', 'EOS', 'IOT', 'TON'}


def _fetch_live_methods(currency: str):
    """
    Try to fetch available deposit methods for `currency` from the live Bitfinex
    pub:map:tx:method endpoint.  Returns a list of method name strings, or None
    on failure (caller should fall back to CURRENCY_TO_METHODS).
    """
    try:
        pub  = Client(rest_host=PUB_REST_HOST)
        data = pub.rest.public.conf('pub:map:tx:method')
        if not data:
            return None
        # data is a list of [method_name, [currency, ...]] pairs
        methods = []
        for entry in data:
            method_name, currencies = entry[0], entry[1]
            if currency.upper() in [c.upper() for c in currencies]:
                methods.append(method_name.upper())
        return methods if methods else None
    except Exception as e:
        log.warning('Live method fetch failed for %s: %s', currency, e)
        return None


# ── GET /deposit/methods ──────────────────────────────────────────────────────
@deposit.route('/deposit/methods', methods=['GET'])
def get_methods():
    """
    Return the available deposit methods for a given currency.
    Query param: currency (e.g. BTC, ETH, UST)
    """
    currency = request.args.get('currency', '').strip().upper()
    if not currency:
        return jsonify({'error': 'currency is required'}), 400

    # Try live data first; fall back to static map
    methods = _fetch_live_methods(currency) or CURRENCY_TO_METHODS.get(currency, [])

    if not methods:
        return jsonify({'error': f'No deposit methods found for {currency}'}), 404

    result = []
    for m in methods:
        meta = METHOD_META.get(m, {})
        result.append({
            'method':   m,
            'label':    meta.get('label', m.title()),
            'network':  meta.get('network', ''),
            'has_memo': currency in MEMO_CURRENCIES,
        })

    return jsonify({'currency': currency, 'methods': result}), 200


# ── GET /deposit/address ──────────────────────────────────────────────────────
@deposit.route('/deposit/address', methods=['GET'])
def get_address():
    """
    Retrieve (or generate) a deposit address for the authenticated user.

    Query params:
        user_id    – frontend UUID
        currency   – Bitfinex currency code (e.g. BTC, ETH, UST)
        method     – deposit method name (e.g. BITCOIN, TETHERUSE)
        wallet     – wallet type: exchange (default), margin, funding
        op_renew   – 1 to force-generate a new address (default 0)
    """
    user_id   = request.args.get('user_id', '').strip()
    currency  = request.args.get('currency', '').strip().upper()
    method    = request.args.get('method',   '').strip().upper()
    wallet    = request.args.get('wallet',   'exchange').strip().lower()
    op_renew  = request.args.get('op_renew', '0').strip() == '1'

    if not all([user_id, currency, method]):
        return jsonify({'error': 'user_id, currency and method are required'}), 400

    if wallet not in ('exchange', 'margin', 'funding'):
        return jsonify({'error': 'wallet must be exchange, margin or funding'}), 400

    record = UserKeys.query.filter_by(user_id=user_id).first()
    if not record:
        return jsonify({'error': 'No API keys found. Please connect your Bitfinex account first.'}), 404

    try:
        bfx    = Client(api_key=record.api_key, api_secret=record.api_secret)
        result = bfx.rest.auth.get_deposit_address(
            wallet=wallet,
            method=method.lower(),   # bfxapi expects lowercase e.g. "bitcoin"
            op_renew=op_renew,
        )

        # Notification[DepositAddress] — the inner object lives in .data
        if result.status and result.status.upper() == 'ERROR':
            return jsonify({'error': f'Bitfinex error: {result.text}'}), 502

        addr_obj     = result.data
        address      = getattr(addr_obj, 'address',      None)
        pool_address = getattr(addr_obj, 'pool_address', None)  # memo / tag for XRP, XLM…

        if not address:
            log.error('Empty deposit address — full notification: %s', result)
            return jsonify({'error': 'Bitfinex returned an empty address. The API key may lack withdrawal permissions, or the method is unavailable for this account.'}), 502

        meta = METHOD_META.get(method, {})

        return jsonify({
            'currency':     currency,
            'method':       method,
            'label':        meta.get('label', method.title()),
            'network':      meta.get('network', ''),
            'wallet':       wallet,
            'address':      address,
            'pool_address': pool_address,   # None unless memo/tag is required
            'has_memo':     bool(pool_address),
        }), 200

    except Exception as e:
        log.exception('Deposit address fetch failed for user %s', user_id)
        return jsonify({'error': f'Failed to get deposit address: {str(e)}'}), 500
