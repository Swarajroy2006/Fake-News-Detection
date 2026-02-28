from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import os

app = Flask(__name__)
CORS(app)

# Load model and vectorizer
model = pickle.load(open("fake_news_model.pkl", "rb"))
vectorizer = pickle.load(open("vectorizer.pkl", "rb"))

@app.route("/")
def home():
    return "Fake News Detector API is running"

@app.route("/health")
def health():
    return jsonify({"status": "ok"})

@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()
        news_text = data.get("text", "")

        if news_text.strip() == "":
            return jsonify({"error": "No text provided"}), 400

        # Transform text
        text_vector = vectorizer.transform([news_text])

        # Prediction
        prediction = model.predict(text_vector)[0]
        confidence = model.decision_function(text_vector)[0]

        result = "Fake News" if prediction == 0 else "Real News"

        return jsonify({
            "prediction": result,
            "confidence": round(abs(float(confidence)), 2)
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)
