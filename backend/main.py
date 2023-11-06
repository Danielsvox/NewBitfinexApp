import logging
from flask import Flask
from flask_cors import CORS
from routes.bitfinex import bitfinex
from routes.images import images
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
# from flask_mongoengine import MongoEngine
# Constants
SERVER_HOST = '0.0.0.0'
SERVER_PORT = 5000


# Configuration
app = Flask(__name__)
'''
app.config['MONGODB_SETTINGS'] = {
    'db': 'your_db_name',
    'host': 'localhost',
    'port': 27017
}'''
app.register_blueprint(bitfinex)
app.register_blueprint(images)
CORS(app)
logging.basicConfig(level=logging.DEBUG)


if __name__ == '__main__':
    app.run(debug=True, host=SERVER_HOST, port=SERVER_PORT)
