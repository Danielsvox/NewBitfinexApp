import logging
import os
from flask import Flask
from flask_cors import CORS
from flask_login import LoginManager
from dotenv import load_dotenv

# Load .env from the same directory as this file — before anything else
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

from extensions import db
from routes.bitfinex import bitfinex
from routes.images import images
from routes.auth import auth
from routes.wallet import wallet
from routes.trade import trade
from routes.deposit import deposit

# ── Configuration ─────────────────────────────────────────────────────────────
SERVER_HOST = '0.0.0.0'
SERVER_PORT = int(os.environ.get('PORT', 8000))

app = Flask(__name__)

# SQLite database stored next to main.py
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(BASE_DIR, 'bfxapp.db')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-change-in-production')
app.config['DEBUG'] = os.environ.get('FLASK_ENV', 'development') == 'development'

# ── Extensions ────────────────────────────────────────────────────────────────
db.init_app(app)
CORS(app)

login_manager = LoginManager(app)

# ── Blueprints ────────────────────────────────────────────────────────────────
app.register_blueprint(bitfinex)
app.register_blueprint(images)
app.register_blueprint(auth)
app.register_blueprint(wallet)
app.register_blueprint(trade)
app.register_blueprint(deposit)

# ── Bootstrap ─────────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.DEBUG)

with app.app_context():
    db.create_all()
    logging.info('Database tables created / verified.')

# ── Run ───────────────────────────────────────────────────────────────────────
if __name__ == '__main__':
    app.run(debug=True, host=SERVER_HOST, port=SERVER_PORT)
