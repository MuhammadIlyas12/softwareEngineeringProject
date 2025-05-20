Media Search Backend

A Flask backend for searching open-license media and managing contacts.

Setup





Install dependencies: pip install -r requirements.txt



Set environment variables in .env:





OPENVERS_CLIENT_ID



OPENVERS_CLIENT_SECRET



JWT_SECRET_KEY



Run: python main.py



Or use Docker: docker build -t backend . && docker run -p 5000:5000 backend

API Endpoints





POST /register: Register a user.



POST /login: Login and get JWT.



GET /contacts: List contacts.



POST /create_contact: Create contact.



PATCH /update_contact/<id>: Update contact.



DELETE /delete_contact/<id>: Delete contact.



GET /search_images?q=<query>&page=<page>&license=<license>&tags=<tags>: Search images.



GET /search_audio?q=<query>&page=<page>&license=<license>: Search audio.



GET /search_history: Get search history.



POST /search_history: Save search.



DELETE /search_history/<id>: Delete search.

Testing





Run locally: pytest -v --cov=. tests/



Run in Docker: docker build -f Dockerfile.test .



Coverage report: pytest --cov-report=html