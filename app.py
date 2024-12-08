from flask import Flask, request, jsonify, session
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from google.cloud import firestore
import tensorflow as tf
import os
from flask_cors import CORS
from dotenv import load_dotenv
import numpy as np
import yfinance as yf
import locale
from flasgger import Swagger

# Load .env
load_dotenv()

# Load TensorFlow model
model = tf.keras.models.load_model('./model/my_model.h5')

# Get input shape
print("Expected input shape:", model.input_shape)

# Set locale untuk Indonesia
locale.setlocale(locale.LC_ALL, 'id_ID.UTF-8')

# Fungsi untuk memformat angka ke format Rupiah
def format_rupiah(value):
    return f"Rp {locale.format_string('%.2f', value, grouping=True)}"

# Get environment variables
project_id = os.getenv("PROJECT_ID")
credentials_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
database_id = os.getenv("DATABASE_ID")
secret_key = os.getenv("SECRET_KEY")

if not project_id or not credentials_path:
    raise EnvironmentError("PROJECT_ID atau GOOGLE_CREDENTIALS tidak ditemukan di .env")

# Inisialisasi Flask
app = Flask(__name__)
app.secret_key = secret_key

CORS(app)

app.config['JWT_SECRET_KEY'] = secret_key
jwt = JWTManager(app)

# Inisialisasi Firestore
db = firestore.Client.from_service_account_json(
    credentials_path,
    project=project_id,
    database=database_id
)

# Konfigurasi Swagger
swagger_config = {
    "headers": [],
    "specs": [
        {
            "endpoint": 'apispec_1',
            "route": '/apispec_1.json',
            "rule_filter": lambda rule: True,
            "model_filter": lambda tag: True,
        }
    ],
    "static_url_path": "/flasgger_static",
    "swagger_ui": True,
    "specs_route": "/apidocs/"
}

app.config['SWAGGER'] = {
    'title': 'Stock Prediction API',
    'uiversion': 3
}

swagger = Swagger(app, config=swagger_config)

# Fungsi untuk mengambil data historis saham
def get_historical_prices(symbol, days=20):
    try:
        stock_data = yf.Ticker(symbol)
        hist = stock_data.history(period="1mo")
        close_prices = hist['Close'].tail(days).tolist()

        if len(close_prices) < days:
            raise ValueError(f"Data tidak cukup, hanya tersedia {len(close_prices)} hari.")
        
        return close_prices
    except Exception as e:
        raise ValueError(f"Gagal mengambil data historis untuk {symbol}: {e}")

@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return jsonify({'error': 'Invalid input. Please provide "email" and "password".'}), 400

        doc_ref = db.collection('users').document(email)
        doc = doc_ref.get()

        if not doc.exists:
            print(f"User not found: {email}")
            return jsonify({'error': 'User not found'}), 404

        user_data = doc.to_dict()
        if not check_password_hash(user_data['password'], password):
            print("Password mismatch")
            return jsonify({'error': 'Invalid password'}), 401

        session['user_email'] = email
        access_token = create_access_token(identity=email)
        return jsonify({"message": "login successful", 'access_token': access_token, 'email': email}), 200

    except Exception as e:
        print(f"Error during login: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return jsonify({'error': 'Invalid input. Please provide "email" and "password".'}), 400

        doc_ref = db.collection('users').document(email)
        doc = doc_ref.get()

        if doc.exists:
            return jsonify({'error': 'User already exists'}), 409

        hashed_password = generate_password_hash(password)

        # Tambahkan log untuk debugging
        print(f"Saving user: {email}")
        
        doc_ref.set({
            'email': email,
            'password': hashed_password
        })

        return jsonify({'message': 'User registered successfully', 'email': email}), 201

    except Exception as e:
        print(f"Error during registration: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/predictStock', methods=['POST'])
def predict_stock():
    """
    Prediksi harga saham untuk 30 hari ke depan.
    ---
    tags:
      - Prediction
    parameters:
      - name: symbol
        in: body
        type: string
        required: true
        description: Symbol saham (misalnya "AAPL", "GOOG")
    responses:
      200:
        description: Prediksi berhasil
      400:
        description: Input tidak valid
      500:
        description: Terjadi kesalahan
    """
    try:
        # Ambil input dari body request
        data = request.get_json()
        symbol = data.get('symbol')

        # Validasi input
        if not symbol:
            return jsonify({'error': 'Invalid input. Please provide "symbol".'}), 400

        # Ambil data historis harga penutupan
        historical_close_prices = get_historical_prices(symbol)

        # Normalisasi data
        mean = np.mean(historical_close_prices)
        std_dev = np.std(historical_close_prices)
        data_normalized = (historical_close_prices - mean) / std_dev

        # Iteratif prediksi untuk 30 hari ke depan
        predictions = []
        last_price = historical_close_prices[-1]
        for day in range(30):
            # Siapkan input untuk model (ambil 20 data terakhir)
            data_reshaped = np.array(data_normalized[-20:]).reshape(1, 20, 1)

            # Prediksi
            predicted = model.predict(data_reshaped).flatten()[0]

            # Denormalisasi hasil prediksi
            denormalized_prediction = predicted * std_dev + mean

            # Hitung perubahan harga
            change = denormalized_prediction - last_price
            trend = "up" if change > 0 else "down" if change < 0 else "unchanged"

            # Tambahkan ke hasil prediksi
            predictions.append({
                "day": day + 1,
                "predicted_price": float(denormalized_prediction),
                "change": float(change),
                "trend": trend
            })

            # Update data
            last_price = denormalized_prediction
            data_normalized = np.append(data_normalized, predicted)

        # Format hasil prediksi
        formatted_predictions = [
            {
                "day": pred["day"],
                "predicted_price": format_rupiah(pred["predicted_price"]),
                "change": format_rupiah(pred["change"]),
                "trend": pred["trend"]
            }
            for pred in predictions
        ]

       
        prediction_doc = {
            "symbol": symbol,
            "predictions": predictions,  
            "createdAt": firestore.SERVER_TIMESTAMP,
        }
        db.collection('stockPredictions').add(prediction_doc)

        return jsonify(formatted_predictions), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/getModules', methods=['GET'])
def get_modules():
    """
    Mendapatkan daftar modul pendidikan dari Firestore.
    ---
    tags:
      - Modules
    responses:
      200:
        description: Berhasil mendapatkan daftar modul
        schema:
          type: array
          items:
            type: object
            properties:
              id:
                type: string
                description: ID dari modul
              title:
                type: string
                description: Judul modul
              content:
                type: string
                description: Konten modul
      404:
        description: Modul tidak ditemukan
      500:
        description: Terjadi kesalahan
    """
    try:
        doc_ref = db.collection('educationModules')
        docs = doc_ref.get()

        if not docs:
            return jsonify({'error': 'Modules not found'}), 404

        modules = [doc.to_dict() for doc in docs]

        return jsonify(modules), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """
    Logout pengguna dengan menghapus sesi.
    ---
    tags:
      - Authentication
    responses:
      200:
        description: Logout berhasil
    """
    try:
        session.pop('user_email', None)
        return jsonify({"message": "Logout successful"}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
@app.route('/protected', methods=['GET'])
@jwt_required()
def protected_route():
    """
    Contoh route yang hanya dapat diakses oleh pengguna dengan token yang valid.
    ---
    tags:
      - Protected
    responses:
      200:
        description: Akses berhasil
      401:
        description: Token tidak valid atau tidak diberikan
    """
    try:
        # Ambil informasi pengguna dari token JWT
        current_user = get_jwt_identity()
        return jsonify({"message": f"Welcome, {current_user}. This is a protected route."}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port)
