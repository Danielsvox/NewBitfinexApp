
from flask import Blueprint, send_from_directory
import logging

images = Blueprint('images', __name__)

logging.basicConfig(level=logging.DEBUG)


@images.route('/backend/logos/<filename>', methods=['GET'])
def serve_logo(filename):
    """Serves an image from the temp_images directory."""
    try:
        # Try to serve the file using the original filename format
        return send_from_directory("logos", filename)
    except:
        # If the original filename format doesn't exist, serve using the fallback filename format
        # Split by "-" and get the word before "logo"

        base_name = filename.split("-")[-2].upper()
        if base_name == 'BORG':
            base_name = 'CHSB'
        fallback_filename = f"{base_name}.png"
        logging.debug(f'filename: {fallback_filename}')
        # Check if fallback file exists

        return send_from_directory("logos", fallback_filename)
