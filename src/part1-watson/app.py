"""
Course: Artificial Intelligence Technology
Institution: FIAP
Project: Cardiology Conversational Assistant
Author: Raphael Silva Lone
Student ID: RM561452

Description:
Flask backend for the Cardiology Conversational Assistant.
The application exposes HTTP endpoints that receive user messages,
forward them to IBM watsonx Assistant, and return the assistant
response to the client application.

This system is intended for educational purposes only and does not
provide medical diagnoses or replace professional medical evaluation.
"""

import uuid

from flask import Flask, jsonify, render_template, request, session
from flask_cors import CORS

from services.watson_service import create_session, send_message


app = Flask(__name__)

# Flask uses this key to sign session cookies.
# In production, the key should be stored as an environment variable.
app.secret_key = "cardiology-assistant-development-key"


# Allows the external frontend to communicate with the Flask API.
CORS(
    app,
    resources={
        r"/chat": {
            "origins": [
                "http://127.0.0.1:5500",
                "http://localhost:5500"
            ]
        },
        r"/health": {
            "origins": [
                "http://127.0.0.1:5500",
                "http://localhost:5500"
            ]
        }
    },
    supports_credentials=True
)


@app.route("/", methods=["GET"])
def home():
    """Render the original CardioIA web interface."""
    return render_template("index.html")


@app.route("/health", methods=["GET"])
def health():
    """Return the backend connection status."""
    return jsonify({
        "status": "ok",
        "source": "watson"
    })


@app.route("/chat", methods=["POST"])
def chat():
    """
    Receive a user message and forward it to IBM watsonx Assistant.

    The Watson session identifier is stored in the Flask session so
    multiple HTTP requests can belong to the same conversation.
    """

    data = request.get_json(silent=True) or {}
    message = data.get("message", "").strip()

    # Reject empty requests.
    if not message:
        return jsonify({
            "error": "A message is required."
        }), 400

    try:
        # Create an anonymous user identifier.
        if "user_id" not in session:
            session["user_id"] = str(uuid.uuid4())

        # Create a Watson session when necessary.
        if "watson_session_id" not in session:
            session["watson_session_id"] = create_session()

        # Send the message to Watson.
        response = send_message(
            session["watson_session_id"],
            message,
            session["user_id"]
        )

        return jsonify({
            "message": message,
            "response": response
        })

    except Exception as error:
        # Reset the Watson session after a communication error.
        session.pop("watson_session_id", None)

        print(f"Watson error: {error}")

        return jsonify({
            "error": "Unable to communicate with the assistant."
        }), 500


if __name__ == "__main__":
    # Debug mode is used only for local development.
    app.run(debug=True)