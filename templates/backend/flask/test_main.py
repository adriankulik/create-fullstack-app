import pytest
from main import app

@pytest.fixture
def client():
    with app.test_client() as client:
        yield client


def test_multiply_number(client):
    response = client.post("/api/multiply", json={"number": 5})
    assert response.status_code == 200
    assert response.get_json() == {"result": 10.0}

def test_multiply_number_invalid(client):
    response = client.post("/api/multiply", json={"number": "not a number"})
    assert response.status_code == 400
