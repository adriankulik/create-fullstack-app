from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/api/multiply", methods=["POST"])
def multiply_number():
    data = request.get_json()
    if not data or "number" not in data:
        return jsonify({"error": "Missing number"}), 400
    
    try:
        number = float(data["number"])
        return jsonify({"result": number * 2})
    except ValueError:
        return jsonify({"error": "Invalid number"}), 400

@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({"status": "ok"})

if __name__ == "__main__":
    app.run(port=8000)
