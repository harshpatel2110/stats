from flask import Flask, request, jsonify, send_from_directory
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configuration
SAVE_DIR = r"C:\DATA WEB STATS - Copy"
os.makedirs(SAVE_DIR, exist_ok=True)

# Fixed filenames
CSV_FILE = os.path.join(SAVE_DIR, 'stats.csv')
JSON_FILE = os.path.join(SAVE_DIR, 'stats.json')

@app.route('/save', methods=['POST'])
def save_data():
    try:
        data = request.get_json()
        if not data or 'csvData' not in data or 'jsonData' not in data:
            return jsonify({'success': False, 'error': 'Invalid data format'}), 400

        # Save CSV (overwrite existing)
        with open(CSV_FILE, 'w', encoding='utf-8-sig') as f:
            f.write(data['csvData'])

        # Save JSON (overwrite existing)
        with open(JSON_FILE, 'w', encoding='utf-8') as f:
            f.write(data['jsonData'])

        return jsonify({
            'success': True,
            'message': 'Files updated successfully',
            'csvPath': CSV_FILE,
            'jsonPath': JSON_FILE
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'attemptedPath': SAVE_DIR
        }), 500

@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('.', path)

if __name__ == '__main__':
    # Run on your laptop's IP (192.168.1.7) and port 1115
    app.run(host='192.168.1.7', port=1115, debug=True)