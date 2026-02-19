from flask_sqlalchemy import SQLAlchemy

# Shared db instance — imported by main.py (init_app) and all models
db = SQLAlchemy()
