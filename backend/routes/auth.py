from flask import Blueprint, request, jsonify
from models.user import User
from utils.helpers import hash_password

auth = Blueprint('auth', __name__)


@auth.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    # Check if user already exists
    existing_user = User.objects(username=username).first()
    if existing_user:
        return jsonify({"error": "Username already exists"}), 400

    # Hash the password and create a new user
    password_hash = hash_password(password)
    new_user = User(username=username, email=email,
                    password_hash=password_hash)
    new_user.save()

    return jsonify({"message": "User registered successfully"}), 201
