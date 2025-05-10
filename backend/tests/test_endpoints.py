import json
import pytest

def test_get_contacts(client, sample_contacts):
    response = client.get('/contacts')
    data = json.loads(response.data)
    assert response.status_code == 200
    assert len(data['contacts']) == 3
    assert data['contacts'][0]['firstName'] == 'John'

def test_create_contact(client):
    new_contact = {
        "firstName": "Test",
        "lastName": "User",
        "email": "test@example.com"
    }
    response = client.post('/create_contact', 
                         data=json.dumps(new_contact),
                         content_type='application/json')
    assert response.status_code == 201
    get_response = client.get('/contacts')
    data = json.loads(get_response.data)
    emails = [contact['email'] for contact in data['contacts']]
    assert "test@example.com" in emails

def test_update_contact(client, sample_contacts):
    response = client.get('/contacts')
    data = json.loads(response.data)
    contact_id = data['contacts'][0]['id']
    updated_contact = {
        "firstName": "UpdatedName",
        "lastName": "UpdatedLastName",
        "email": "updated@example.com"
    }
    response = client.patch(f'/update_contact/{contact_id}',
                          data=json.dumps(updated_contact),
                          content_type='application/json')
    assert response.status_code == 200
    get_response = client.get('/contacts')
    data = json.loads(get_response.data)
    for contact in data['contacts']:
        if contact['id'] == contact_id:
            assert contact['firstName'] == "UpdatedName"
            assert contact['email'] == "updated@example.com"

def test_delete_contact(client, sample_contacts):
    response = client.get('/contacts')
    data = json.loads(response.data)
    contact_id = data['contacts'][0]['id']
    initial_count = len(data['contacts'])
    response = client.delete(f'/delete_contact/{contact_id}')
    assert response.status_code == 200
    get_response = client.get('/contacts')
    data = json.loads(get_response.data)
    assert len(data['contacts']) == initial_count - 1

def test_search_images(client, monkeypatch):
    from OpenverseAPIClient import OpenverseClient
    mock_results = {
        "results": [
            {"title": "Test Image", "url": "http://example.com/image.jpg"}
        ]
    }
    def mock_search_images(*args, **kwargs):
        return mock_results
    monkeypatch.setattr(OpenverseClient, "search_images", mock_search_images)
    response = client.get('/search_images?q=test')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data == mock_results

def test_register(client):
    user = {
        "username": "testuser",
        "password": "testpass",
        "email": "testuser@example.com"
    }
    response = client.post('/register',
                         data=json.dumps(user),
                         content_type='application/json')
    assert response.status_code == 201
    assert json.loads(response.data)["message"] == "User registered"

def test_login(client):
    user = {
        "username": "testuser",
        "password": "testpass",
        "email": "testuser@example.com"
    }
    client.post('/register', data=json.dumps(user), content_type='application/json')
    response = client.post('/login',
                         data=json.dumps({"username": "testuser", "password": "testpass"}),
                         content_type='application/json')
    assert response.status_code == 200
    assert "token" in json.loads(response.data)

def test_search_history(client):
    user = {
        "username": "testuser",
        "password": "testpass",
        "email": "testuser@example.com"
    }
    client.post('/register', data=json.dumps(user), content_type='application/json')
    login_response = client.post('/login',
                               data=json.dumps({"username": "testuser", "password": "testpass"}),
                               content_type='application/json')
    token = json.loads(login_response.data)["token"]
    
    response = client.post('/search_history',
                         data=json.dumps({"query": "nature"}),
                         content_type='application/json',
                         headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 201
    get_response = client.get('/search_history', headers={"Authorization": f"Bearer {token}"})
    data = json.loads(get_response.data)
    assert any(s["query"] == "nature" for s in data["history"])