from datetime import datetime
from extensions import db


class UserKeys(db.Model):
    """Maps a frontend-generated UUID to a pair of Bitfinex API keys.

    Security note: keys are stored in plaintext in the local SQLite file.
    For a multi-user / production deployment, encrypt them with a KMS or
    at minimum with Fernet symmetric encryption before writing to the DB.
    """
    __tablename__ = 'user_keys'

    id         = db.Column(db.Integer, primary_key=True)
    user_id    = db.Column(db.String(36), unique=True, nullable=False, index=True)
    api_key    = db.Column(db.String(256), nullable=False)
    api_secret = db.Column(db.String(256), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'user_id':    self.user_id,
            'created_at': self.created_at.isoformat(),
        }
