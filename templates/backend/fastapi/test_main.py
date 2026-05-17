from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_multiply_number():
    response = client.post("/api/multiply", json={"number": 5})
    assert response.status_code == 200
    assert response.json() == {"result": 10.0}

def test_multiply_number_negative():
    response = client.post("/api/multiply", json={"number": -3.5})
    assert response.status_code == 200
    assert response.json() == {"result": -7.0}
