from pathlib import Path
import pickle
from flask import Flask, jsonify, request
from flask_cors import CORS

ROOT_DIR = Path(__file__).resolve().parents[1]
MODEL_DIR = ROOT_DIR / "fake-news-backend"

app = Flask(__name__)
CORS(app)

with open(MODEL_DIR / "fake_news_model.pkl", "rb") as model_file:
    model = pickle.load(model_file)

with open(MODEL_DIR / "vectorizer.pkl", "rb") as vectorizer_file:
    vectorizer = pickle.load(vectorizer_file)


@app.route("/")
def home():
    return "Fake News Detector API is running"


@app.route("/health")
def health():
    return jsonify({"status": "ok"})


@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json(silent=True) or {}
        news_text = data.get("text", "")

        if not news_text.strip():
            return jsonify({"error": "No text provided"}), 400

        text_vector = vectorizer.transform([news_text])
        prediction = model.predict(text_vector)[0]
        confidence = model.decision_function(text_vector)[0]

        result = "Fake News" if prediction == 0 else "Real News"

        return jsonify(
            {
                "prediction": result,
                "confidence": round(abs(float(confidence)), 2),
            }
        )
    except Exception as error:
        return jsonify({"error": str(error)}), 500
