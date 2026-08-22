import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2

app = Flask(__name__)
CORS(app)

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/appdb")

def save_calculation(number: float, result: float):
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO calculations (input_number, result) VALUES (%s, %s)",
        (number, result)
    )
    conn.commit()
    cursor.close()
    conn.close()

@app.route("/api/multiply", methods=["POST"])
def multiply_number():
    data = request.get_json()
    if not data or "number" not in data:
        return jsonify({"error": "Missing number"}), 400
    
    try:
        number = float(data["number"])
        result = number * 2
        try:
            save_calculation(number, result)
        except psycopg2.Error as e:
            print(f"Error saving to db: {e}")
        return jsonify({"result": result})
    except ValueError:
        return jsonify({"error": "Invalid number"}), 400

if __name__ == "__main__":
    app.run(port=8000)
