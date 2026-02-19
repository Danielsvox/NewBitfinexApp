import logging
from typing import Optional
from flask import Blueprint, request, jsonify
from bfxapi import Client, PUB_REST_HOST

from models.user_keys import UserKeys

wallet = Blueprint('wallet', __name__)
log    = logging.getLogger(__name__)

# Currencies treated as 1 USD each
USD_PEGS = {'USD', 'USDT', 'USDC', 'USDT0', 'UST', 'TUSD', 'DAI', 'EURT', 'BUSD', 'LUSD'}


def _usd_price(pub_client, currency: str) -> Optional[float]:
    """Return the USD price of `currency`, or None if unavailable."""
    if currency in USD_PEGS:
        return 1.0
    # Try tCURRENCYUSD, then tCURRENCYUST, then tCURRENCYUSDT
    for quote in ('USD', 'UST', 'USDT'):
        try:
            ticker = pub_client.rest.public.get_t_ticker(f't{currency}{quote}')
            return float(ticker.last_price)
        except Exception:
            continue
    return None


def _get_wallet_data(api_key: str, api_secret: str) -> dict:
    auth_client = Client(api_key=api_key, api_secret=api_secret)
    pub_client  = Client(rest_host=PUB_REST_HOST)

    raw_wallets = auth_client.rest.auth.get_wallets()

    wallets_out = []
    total_usd   = 0.0

    for w in raw_wallets:
        if w.balance <= 0:
            continue

        price     = _usd_price(pub_client, w.currency)
        usd_value = round(w.balance * price, 2) if price is not None else None

        if usd_value is not None:
            total_usd += usd_value

        wallets_out.append({
            'wallet_type':       w.wallet_type,
            'currency':          w.currency,
            'balance':           round(w.balance, 8),
            'available_balance': round(w.available_balance or 0, 8),
            'usd_value':         usd_value,
        })

    # Sort: exchange wallets first, then by USD value descending
    wallets_out.sort(key=lambda x: (x['wallet_type'] != 'exchange', -(x['usd_value'] or 0)))

    return {
        'wallets':   wallets_out,
        'total_usd': round(total_usd, 2),
    }


# ── GET /wallet/balances ──────────────────────────────────────────────────────
@wallet.route('/wallet/balances', methods=['GET'])
def get_balances():
    user_id = request.args.get('user_id', '').strip()

    if not user_id:
        return jsonify({'error': 'user_id is required'}), 400

    record = UserKeys.query.filter_by(user_id=user_id).first()
    if not record:
        return jsonify({'error': 'No API keys found for this user. Please connect your Bitfinex account first.'}), 404

    try:
        data = _get_wallet_data(record.api_key, record.api_secret)
        return jsonify(data), 200
    except Exception as e:
        log.exception('Error fetching wallet for user %s', user_id)
        return jsonify({'error': f'Failed to fetch wallet: {str(e)}'}), 500
