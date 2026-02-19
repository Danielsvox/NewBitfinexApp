import logging
from typing import Optional

from flask import Blueprint, request, jsonify
from bfxapi import Client, PUB_REST_HOST

from models.user_keys import UserKeys

trade = Blueprint('trade', __name__)
log   = logging.getLogger(__name__)

# Bitfinex internally represents USDT as "UST"
# USD  pairs:  tBTCUSD
# USDT pairs:  tBTCUST
QUOTE_TO_BFX = {'USD': 'USD', 'USDT': 'UST'}


def _get_current_price(symbol: str) -> Optional[float]:
    """Fetch the latest traded price for a t-prefixed Bitfinex symbol."""
    try:
        pub    = Client(rest_host=PUB_REST_HOST)
        ticker = pub.rest.public.get_t_ticker(symbol)
        return float(ticker.last_price)
    except Exception as e:
        log.warning('Price fetch failed for %s: %s', symbol, e)
        return None


# ── GET /trade/price ──────────────────────────────────────────────────────────
@trade.route('/trade/price', methods=['GET'])
def get_price():
    """
    Return the current market price for a symbol.
    Query params: symbol (e.g. BTCUSD), quote_currency (USD | USDT, default USD)
    """
    base          = request.args.get('symbol', '').strip().upper()
    quote_display = request.args.get('quote_currency', 'USD').strip().upper()

    if quote_display not in QUOTE_TO_BFX:
        return jsonify({'error': 'quote_currency must be USD or USDT'}), 400

    bfx_quote  = QUOTE_TO_BFX[quote_display]
    bfx_symbol = f't{base}{bfx_quote}'

    price = _get_current_price(bfx_symbol)
    if price is None:
        return jsonify({'error': f'Could not fetch price for {bfx_symbol}'}), 502

    return jsonify({'symbol': bfx_symbol, 'price': price, 'quote_currency': quote_display}), 200


# ── POST /trade/order ─────────────────────────────────────────────────────────
@trade.route('/trade/order', methods=['POST'])
def submit_order():
    """
    Submit a market order on behalf of the authenticated user.

    Body (JSON):
        user_id        – the frontend UUID
        symbol         – base currency only, e.g. "BTC" (NOT "BTCUSD")
        side           – "buy" or "sell"
        amount_usd     – positive amount in the quote currency
        quote_currency – "USD" (default) or "USDT"
    """
    data          = request.get_json(force=True)
    user_id       = data.get('user_id', '').strip()
    base          = data.get('symbol', '').strip().upper()   # e.g. "BTC"
    side          = data.get('side',   '').strip().lower()   # "buy" | "sell"
    amount_usd    = data.get('amount_usd')
    quote_display = data.get('quote_currency', 'USD').strip().upper()  # "USD" | "USDT"

    # ── Validation ────────────────────────────────────────────────────────────
    if not all([user_id, base, side]):
        return jsonify({'error': 'user_id, symbol and side are required'}), 400

    if side not in ('buy', 'sell'):
        return jsonify({'error': 'side must be "buy" or "sell"'}), 400

    if quote_display not in QUOTE_TO_BFX:
        return jsonify({'error': 'quote_currency must be USD or USDT'}), 400

    try:
        amount_usd = float(amount_usd)
        if amount_usd <= 0:
            return jsonify({'error': 'amount_usd must be greater than zero'}), 400
    except (TypeError, ValueError):
        return jsonify({'error': 'amount_usd must be a positive number'}), 400

    # ── Look up credentials ───────────────────────────────────────────────────
    record = UserKeys.query.filter_by(user_id=user_id).first()
    if not record:
        return jsonify({'error': 'No API keys found. Please connect your Bitfinex account first.'}), 404

    # ── Build Bitfinex symbol ─────────────────────────────────────────────────
    bfx_quote  = QUOTE_TO_BFX[quote_display]   # 'USD' or 'UST'
    bfx_symbol = f't{base}{bfx_quote}'          # e.g. 'tBTCUSD' or 'tBTCUST'

    # ── Fetch current price ───────────────────────────────────────────────────
    price = _get_current_price(bfx_symbol)
    if price is None:
        return jsonify({'error': f'Could not fetch current price for {bfx_symbol}'}), 502

    # ── Calculate base-currency amount ────────────────────────────────────────
    # Bitfinex: positive amount → buy, negative amount → sell
    base_amount = round(amount_usd / price, 8)
    if side == 'sell':
        base_amount = -base_amount

    # ── Pre-flight balance check ──────────────────────────────────────────────
    try:
        check_client = Client(api_key=record.api_key, api_secret=record.api_secret)
        wallets      = check_client.rest.auth.get_wallets()

        exchange_balances = {
            w.currency.upper(): w.available_balance or 0.0
            for w in wallets
            if w.wallet_type == 'exchange'
        }

        if side == 'buy':
            if quote_display == 'USDT':
                # Only count the USDT (UST) balance
                available = exchange_balances.get('UST', 0.0)
                quote_name = 'USDT'
            else:
                # Count all USD-pegged currencies for a USD order
                USD_PEGS = ['USD', 'USDT', 'USDC', 'UST', 'TUSD', 'DAI']
                available  = sum(exchange_balances.get(c, 0.0) for c in USD_PEGS)
                quote_name = 'USD'

            if available < amount_usd:
                return jsonify({
                    'error': (
                        f'Insufficient {quote_name} balance. '
                        f'You need {amount_usd:,.2f} {quote_name} '
                        f'but only have {available:,.2f} {quote_name} '
                        f'available in your exchange wallet.'
                    )
                }), 422

        else:  # sell — need enough of the base asset
            available_base = exchange_balances.get(base, 0.0)
            required_base  = abs(base_amount)
            if available_base < required_base:
                return jsonify({
                    'error': (
                        f'Insufficient {base} balance. '
                        f'You need {required_base:.8f} {base} '
                        f'(≈ {amount_usd:,.2f} {quote_display}) but only have '
                        f'{available_base:.8f} {base} available.'
                    )
                }), 422

    except Exception as e:
        log.warning('Balance pre-check failed for user %s: %s', user_id, e)
        # Non-fatal — let Bitfinex surface the rejection if balance is actually low.

    # ── Submit the order ──────────────────────────────────────────────────────
    try:
        bfx    = Client(api_key=record.api_key, api_secret=record.api_secret)
        result = bfx.rest.auth.submit_order(
            type='MARKET',
            symbol=bfx_symbol,
            amount=base_amount,
            price=None,    # ignored for MARKET orders, but required by bfxapi v4
        )

        # Notification[Order] — the inner Order lives in .data
        if result.status and result.status.upper() == 'ERROR':
            return jsonify({'error': f'Bitfinex rejected the order: {result.text}'}), 422

        order = result.data

        return jsonify({
            'success':         True,
            'order_id':        getattr(order, 'id',     None),
            'symbol':          bfx_symbol,
            'side':            side,
            'amount_usd':      amount_usd,
            'quote_currency':  quote_display,
            'base_amount':     abs(base_amount),
            'price_at_order':  price,
            'status':          getattr(order, 'status', 'EXECUTED'),
        }), 200

    except Exception as e:
        log.exception('Order submission failed for user %s', user_id)
        return jsonify({'error': f'Order failed: {str(e)}'}), 500
