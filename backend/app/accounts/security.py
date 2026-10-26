import os
import secrets
from datetime import datetime, timedelta, timezone

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import InvalidTokenError
from pwdlib import PasswordHash
from sqlalchemy.orm import Session

from app.accounts.models import User
from app.database import get_db


password_hash = PasswordHash.recommended()
token_scheme = HTTPBearer(auto_error=False)
app_secret_key = os.getenv("APP_SECRET_KEY") or secrets.token_urlsafe(32)
token_algorithm = "HS256"
token_lifetime = timedelta(hours=8)


def hash_password(password: str) -> str:
    return password_hash.hash(password)


def verify_password(password: str, encoded_password: str) -> bool:
    return password_hash.verify(password, encoded_password)


def create_access_token(user_id: int) -> str:
    expires_at = datetime.now(timezone.utc) + token_lifetime
    return jwt.encode(
        {"sub": str(user_id), "exp": expires_at},
        app_secret_key,
        algorithm=token_algorithm,
    )


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(token_scheme),
    db: Session = Depends(get_db),
) -> User:
    unauthorized = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="로그인이 필요합니다.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if credentials is None:
        raise unauthorized

    try:
        payload = jwt.decode(
            credentials.credentials,
            app_secret_key,
            algorithms=[token_algorithm],
        )
        user_id = int(payload["sub"])
    except (InvalidTokenError, KeyError, TypeError, ValueError):
        raise unauthorized

    user = db.get(User, user_id)
    if user is None:
        raise unauthorized
    return user
