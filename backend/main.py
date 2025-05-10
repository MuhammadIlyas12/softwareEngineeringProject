import logging
from flask import request, jsonify
from flask_jwt_extended import JWTManager, create_access_token
from config import app, db
from models import Contact, User, SearchHistory
from OpenverseAPIClient import OpenverseClient
from werkzeug.security import check_password_hash
from email_validator import validate_email, EmailNotValidError
from dotenv import load_dotenv
import os
from flask_cors import CORS
from datetime import timedelta

# Setup logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

logger.debug("Starting application")

CORS(app, supports_credentials=True, origins=["http://localhost:5173"])

load_dotenv()

app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'super-secret-key')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=7)
jwt = JWTManager(app)

logger.debug("JWT_SECRET_KEY: %s", app.config['JWT_SECRET_KEY'])

@jwt.invalid_token_loader
def invalid_token_callback(error):
    logger.error("Invalid token: %s", error)
    return jsonify({"message": "Invalid or missing token"}), 401

@app.route("/register", methods=["POST"])
def register():
    logger.debug("Register endpoint called")
    username = request.json.get("username")
    password = request.json.get("password")
    email = request.json.get("email")
    if not username or not password or not email:
        return jsonify({"message": "Missing fields"}), 400
    try:
        validate_email(email)
    except EmailNotValidError:
        return jsonify({"message": "Invalid email"}), 400
    if User.query.filter_by(username=username).first() or User.query.filter_by(email=email).first():
        return jsonify({"message": "User already exists"}), 400
    user = User(username=username, email=email)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    return jsonify({"message": "User registered"}), 201

@app.route("/login", methods=["POST"])
def login():
    logger.debug("Login endpoint called")
    username = request.json.get("username")
    password = request.json.get("password")
    user = User.query.filter_by(username=username).first()
    if not user or not user.check_password(password):
        return jsonify({"message": "Invalid credentials"}), 401
    token = create_access_token(identity=user.id)
    return jsonify({"token": token,'user':username}), 200

@app.route("/register_openverse", methods=["POST"])
def register_openverse():
    logger.debug("Register Openverse endpoint called")
    name = request.json.get("name")
    description = request.json.get("description")
    email = request.json.get("email")
    if not name or not description or not email:
        return jsonify({"message": "Missing fields"}), 400
    try:
        validate_email(email)
    except EmailNotValidError:
        return jsonify({"message": "Invalid email"}), 400
    ov_client = OpenverseClient()
    try:
        result = ov_client.register(name, description, email)
        return jsonify({
            "message": "Application registered. Store client_id and client_secret in .env and verify email.",
            "data": result
        }), 201
    except Exception as e:
        logger.error("Openverse registration failed: %s", e)
        return jsonify({"error": str(e)}), 400

@app.route("/get_openverse_token", methods=["POST"])
def get_openverse_token():
    logger.debug("Get Openverse token endpoint called")
    ov_client = OpenverseClient()
    try:
        result = ov_client.get_token()
        return jsonify({
            "message": "Access token fetched. Update OPENVERS_ACCESS_TOKEN in .env if needed.",
            "data": result
        }), 200
    except Exception as e:
        logger.error("Openverse token fetch failed: %s", e)
        return jsonify({"error": str(e)}), 400

@app.route("/contacts", methods=["GET"])
def get_contacts():
    logger.debug("Get contacts endpoint called")
    contacts = Contact.query.all()
    json_contacts = list(map(lambda x: x.to_json(), contacts))
    return jsonify({"contacts": json_contacts})

@app.route("/create_contact", methods=["POST"])
def create_contact():
    logger.debug("Create contact endpoint called")
    first_name = request.json.get("firstName")
    last_name = request.json.get("lastName")
    email = request.json.get("email")
    if not first_name or not last_name or not email:
        return jsonify({"message": "Missing fields"}), 400
    try:
        validate_email(email)
    except EmailNotValidError:
        return jsonify({"message": "Invalid email"}), 400
    new_contact = Contact(first_name=first_name, last_name=last_name, email=email)
    try:
        db.session.add(new_contact)
        db.session.commit()
    except Exception as e:
        logger.error("Create contact failed: %s", e)
        return jsonify({"message": str(e)}), 400
    return jsonify({"message": "User created!"}), 201

@app.route("/update_contact/<int:user_id>", methods=["PATCH"])
def update_contact(user_id):
    logger.debug("Update contact endpoint called for user_id: %s", user_id)
    contact = Contact.query.get(user_id)
    if not contact:
        return jsonify({"message": "User not found"}), 404
    data = request.json
    contact.first_name = data.get("firstName", contact.first_name)
    contact.last_name = data.get("lastName", contact.last_name)
    email = data.get("email", contact.email)
    try:
        validate_email(email)
    except EmailNotValidError:
        return jsonify({"message": "Invalid email"}), 400
    contact.email = email
    db.session.commit()
    return jsonify({"message": "User updated"}), 200

@app.route("/delete_contact/<int:user_id>", methods=["DELETE"])
def delete_contact(user_id):
    logger.debug("Delete contact endpoint called for user_id: %s", user_id)
    contact = Contact.query.get(user_id)
    if not contact:
        return jsonify({"message": "User not found"}), 404
    db.session.delete(contact)
    db.session.commit()
    return jsonify({"message": "User deleted"}), 200

@app.route("/search_history", methods=["GET"])
def get_search_history():
    logger.debug("Get search history endpoint called")
    username = request.args.get("username")
    if not username:
        return jsonify({"message": "Username required"}), 400
    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({"message": "User not found"}), 404
    searches = SearchHistory.query.filter_by(user_id=user.id).all()
    return jsonify({"history": [s.to_json() for s in searches]})

@app.route("/search_history", methods=["POST"])
def save_search():
    logger.debug("Save search endpoint called")
    username = request.json.get("username")
    query = request.json.get("query")
    if not username or not query:
        return jsonify({"message": "Username and query required"}), 400

    # Find user in the database
    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({"message": "User not found"}), 404

    # Check if the user has more than 10 saved searches
    search_count = SearchHistory.query.filter_by(user_id=user.id).count()
    if search_count >= 10:
        # Delete the oldest search (assuming we store search time)
        try:
            oldest_search = (
                SearchHistory.query.filter_by(user_id=user.id)
                .order_by(SearchHistory.timestamp)
                .first()
            )
            if oldest_search:  # Ensure there is a valid search to delete
                db.session.delete(oldest_search)
                db.session.commit()
                logger.debug("Deleted oldest search")
            else:
                logger.debug("No searches to delete")
        except Exception as e:
            db.session.rollback()  # Rollback the transaction in case of an error
            logger.error(f"Error deleting oldest search: {e}")
            return jsonify({"message": "Failed to delete the oldest search"}), 500

    # Save new search
    try:
        search = SearchHistory(user_id=user.id, query=query)
        db.session.add(search)
        db.session.commit()
        logger.debug("New search saved")
        return jsonify({"message": "Search saved"}), 201
    except Exception as e:
        db.session.rollback()  # Rollback the transaction in case of an error
        logger.error(f"Error saving search: {e}")
        return jsonify({"message": "Failed to save search"}), 500



@app.route("/search_history/<int:search_id>", methods=["DELETE"])
def delete_search(search_id):
    logger.debug("Delete search endpoint called for search_id: %s", search_id)
    username = request.args.get("username")
    if not username:
        return jsonify({"message": "Username required"}), 400
    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({"message": "User not found"}), 404
    search = SearchHistory.query.filter_by(id=search_id, user_id=user.id).first()
    if not search:
        return jsonify({"message": "Search not found"}), 404
    db.session.delete(search)
    db.session.commit()
    return jsonify({"message": "Search deleted"}), 200

ov_client = OpenverseClient()

@app.route("/search_images", methods=["GET"])
def search_images():
    logger.debug("Search images endpoint called")
    query = request.args.get("q")
    if not query:
        return jsonify({"error": "Search query is required"}), 400
    page = request.args.get("page", 1, type=int)
    page_size = request.args.get("page_size", 20, type=int)
    license_type = request.args.get("license")
    creator = request.args.get("creator")
    tags = request.args.get("tags")
    if tags:
        tags = tags.split(",")
    try:
        results = ov_client.search_images(
            query=query,
            page=page,
            page_size=page_size,
            license_type=license_type,
            creator=creator,
            tags=tags
        )
        return jsonify(results)
    except Exception as e:
        logger.error("Search images failed: %s", e)
        return jsonify({"error": str(e)}), 400

@app.route("/search_audio", methods=["GET"])
def search_audio():
    logger.debug("Search audio endpoint called")
    query = request.args.get("q")
    if not query:
        return jsonify({"error": "Search query is required"}), 400
    page = request.args.get("page", 1, type=int)
    page_size = request.args.get("page_size", 20, type=int)
    license_type = request.args.get("license")
    try:
        results = ov_client.search_audio(
            query=query,
            page=page,
            page_size=page_size,
            license_type=license_type
        )
        return jsonify(results)
    except Exception as e:
        logger.error("Search audio failed: %s", e)
        return jsonify({"error": str(e)}), 400

@app.route("/audio_detail/<string:identifier>", methods=["GET"])
def audio_detail(identifier):
    logger.debug("Audio detail endpoint called for identifier: %s", identifier)
    try:
        result = ov_client.get_audio_detail(identifier)
        return jsonify(result)
    except Exception as e:
        logger.error("Audio detail failed: %s", e)
        return jsonify({"error": str(e)}), 400

@app.route("/image_detail/<string:identifier>", methods=["GET"])
def image_detail(identifier):
    logger.debug("Image detail endpoint called for identifier: %s", identifier)
    try:
        result = ov_client.get_image_detail(identifier)
        return jsonify(result)
    except Exception as e:
        logger.error("Image detail failed: %s", e)
        return jsonify({"error": str(e)}), 400

@app.route("/audio_stats", methods=["GET"])
def audio_stats():
    logger.debug("Audio stats endpoint called")
    try:
        result = ov_client.get_audio_stats()
        return jsonify(result)
    except Exception as e:
        logger.error("Audio stats failed: %s", e)
        return jsonify({"error": str(e)}), 400

@app.route("/image_stats", methods=["GET"])
def image_stats():
    logger.debug("Image stats endpoint called")
    try:
        result = ov_client.get_image_stats()
        return jsonify(result)
    except Exception as e:
        logger.error("Image stats failed: %s", e)
        return jsonify({"error": str(e)}), 400

@app.route("/rate_limit", methods=["GET"])
def rate_limit():
    logger.debug("Rate limit endpoint called")
    try:
        result = ov_client.get_rate_limit()
        return jsonify(result)
    except Exception as e:
        logger.error("Rate limit failed: %s", e)
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    logger.debug("Creating database tables")
    with app.app_context():
        db.create_all()
    logger.debug("Starting Flask server")
    app.run(host="0.0.0.0", port=5000, debug=True)