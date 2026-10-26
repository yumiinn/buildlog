from sqlalchemy import select

from app.accounts.models import User
from app.accounts.security import verify_password
from app.database import SessionLocal


DEFAULT_PASSWORD = "a" * 12


def signup(client, email="user@example.com", password=DEFAULT_PASSWORD, nickname="사용자"):
    return client.post(
        "/api/auth/signup",
        json={"email": email, "password": password, "nickname": nickname},
    )


def login(client, email="user@example.com", password=DEFAULT_PASSWORD):
    return client.post("/api/auth/login", json={"email": email, "password": password})


def test_signup_trims_values_and_hashes_password(client):
    response = signup(client, email="  User@Example.com  ", nickname="  사용자_1  ")

    assert response.status_code == 201
    assert response.json()["email"] == "user@example.com"
    assert response.json()["nickname"] == "사용자_1"

    with SessionLocal() as db:
        user = db.scalar(select(User).where(User.email == "user@example.com"))
        assert user is not None
        assert user.password_hash != DEFAULT_PASSWORD
        assert verify_password(DEFAULT_PASSWORD, user.password_hash)


def test_signup_rejects_duplicate_email_and_nickname(client):
    assert signup(client).status_code == 201

    duplicate_email = signup(client, email="USER@example.com", nickname="다른사용자")
    duplicate_nickname = signup(client, email="other@example.com", nickname="사용자")

    assert duplicate_email.status_code == 409
    assert duplicate_email.json()["detail"] == "이미 사용 중인 이메일입니다."
    assert duplicate_nickname.status_code == 409
    assert duplicate_nickname.json()["detail"] == "이미 사용 중인 닉네임입니다."


def test_signup_validates_email_password_and_nickname_boundaries(client):
    assert signup(client, email="wrong", nickname="정상닉네임").status_code == 422
    assert signup(client, email="short@example.com", password="1234567", nickname="짧은비번").status_code == 422
    assert signup(client, email="long@example.com", password="a" * 65, nickname="긴비번").status_code == 422
    assert signup(client, email="nick1@example.com", nickname="가").status_code == 422
    assert signup(client, email="nick2@example.com", nickname="a" * 21).status_code == 422
    assert signup(client, email="nick3@example.com", nickname="사용자!").status_code == 422

    assert signup(client, email="min@example.com", password="a" * 8, nickname="가나").status_code == 201
    assert signup(client, email="max@example.com", password="b" * 64, nickname="a" * 20).status_code == 201


def test_login_returns_token_and_allows_current_user_access(client):
    signup(client)
    response = login(client)

    assert response.status_code == 200
    token = response.json()["access_token"]
    me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})

    assert me.status_code == 200
    assert me.json()["email"] == "user@example.com"
    assert me.json()["nickname"] == "사용자"


def test_login_rejects_wrong_credentials_and_protected_route_without_token(client):
    signup(client)

    wrong_password = login(client, password="b" * 12)
    no_token = client.get("/api/auth/me")

    assert wrong_password.status_code == 401
    assert wrong_password.json()["detail"] == "이메일 또는 비밀번호가 맞지 않습니다."
    assert no_token.status_code == 401


def test_user_can_change_only_own_nickname(client):
    signup(client)
    signup(client, email="other@example.com", nickname="다른사용자")
    token = login(client).json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    changed = client.patch(
        "/api/auth/me/nickname",
        headers=headers,
        json={"nickname": "  새닉네임_1  "},
    )
    duplicate = client.patch(
        "/api/auth/me/nickname",
        headers=headers,
        json={"nickname": "다른사용자"},
    )

    assert changed.status_code == 200
    assert changed.json()["nickname"] == "새닉네임_1"
    assert duplicate.status_code == 409
    assert client.get("/api/auth/me", headers=headers).json()["nickname"] == "새닉네임_1"


def test_user_data_survives_a_new_database_session(client):
    signup(client)

    with SessionLocal() as first_session:
        user_id = first_session.scalar(select(User.id).where(User.email == "user@example.com"))

    with SessionLocal() as second_session:
        saved_user = second_session.get(User, user_id)
        assert saved_user is not None
        assert saved_user.nickname == "사용자"
