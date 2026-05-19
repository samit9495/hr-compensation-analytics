from fastapi import status
from fastapi.testclient import TestClient


class TestCreateEmployeeAPI:
    def test_post_employees_returns_201_with_persisted_row(self, client: TestClient) -> None:
        payload = {
            "full_name": "Jane Doe",
            "job_title": "Engineer",
            "country": "IN",
            "salary": "50000.00",
        }
        response = client.post("/employees", json=payload)

        assert response.status_code == status.HTTP_201_CREATED
        body = response.json()
        assert body["id"] > 0
        assert body["full_name"] == "Jane Doe"
        assert body["country"] == "IN"
        assert body["salary"] == "50000.00"
