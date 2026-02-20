import logging
from flask import Blueprint, request, jsonify
from bfxapi import Client

from extensions import db
from models.user_keys import UserKeys

auth = Blueprint('auth', __name__)
log  = logging.getLogger(__name__)


def _validate_keys(api_key: str, api_secret: str) -> bool:
    """Returns True when the key pair can authenticate against Bitfinex."""
    try:
        bfx = Client(api_key=api_key, api_secret=api_secret)
        bfx.rest.auth.get_user_info()
        return True
    except Exception as e:
        log.warning('Key validation failed: %s', e)
        return False


# ── POST /auth/keys ───────────────────────────────────────────────────────────
@auth.route('/auth/keys', methods=['POST'])
def save_keys():
    data       = request.get_json(force=True)
    user_id    = data.get('user_id', '').strip()
    api_key    = data.get('api_key', '').strip()
    api_secret = data.get('api_secret', '').strip()

    if not all([user_id, api_key, api_secret]):
        return jsonify({'error': 'user_id, api_key and api_secret are required'}), 400

    if not _validate_keys(api_key, api_secret):
        return jsonify({'error': 'Invalid API keys — Bitfinex rejected the credentials'}), 401

    existing = UserKeys.query.filter_by(user_id=user_id).first()
    if existing:
        existing.api_key    = api_key
        existing.api_secret = api_secret
    else:
        db.session.add(UserKeys(user_id=user_id, api_key=api_key, api_secret=api_secret))

    db.session.commit()
    return jsonify({'message': 'API keys saved successfully'}), 200


# ── DELETE /auth/keys ─────────────────────────────────────────────────────────
@auth.route('/auth/keys', methods=['DELETE'])
def delete_keys():
    data    = request.get_json(force=True)
    user_id = data.get('user_id', '').strip()

    if not user_id:
        return jsonify({'error': 'user_id is required'}), 400

    deleted = UserKeys.query.filter_by(user_id=user_id).delete()
    db.session.commit()

    if deleted:
        return jsonify({'message': 'API keys removed'}), 200
    return jsonify({'error': 'No keys found for this user'}), 404


# ── GET /auth/status ──────────────────────────────────────────────────────────
@auth.route('/auth/status', methods=['GET'])
def get_status():
    user_id = request.args.get('user_id', '').strip()

    if not user_id:
        return jsonify({'error': 'user_id is required'}), 400

    record = UserKeys.query.filter_by(user_id=user_id).first()
    if record:
        return jsonify({'connected': True, 'since': record.created_at.isoformat()}), 200
    return jsonify({'connected': False}), 200
