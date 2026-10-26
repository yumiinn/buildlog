from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.accounts.models import User
from app.accounts.schemas import (
    LoginRequest,
    LoginResponse,
    NicknameUpdateRequest,
    SignupRequest,
    UserResponse,
)
from app.accounts.security import (
    create_access_token,
    get_current_user,
    hash_password,
    verify_password,
)
from app.database import get_db


router = APIRouter(prefix="/api/auth", tags=["accounts"])


@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: SignupRequest, db: Session = Depends(get_db)) -> User:
    email = str(payload.email).lower()
    if db.scalar(select(User).where(User.email == email)):
        raise HTTPException(status_code=409, detail="이미 사용 중인 이메일입니다.")
    if db.scalar(select(User).where(User.nickname == payload.nickname)):
        raise HTTPException(status_code=409, detail="이미 사용 중인 닉네임입니다.")

    user = User(
        email=email,
        password_hash=hash_password(payload.password),
        nickname=payload.nickname,
    )
    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="이미 사용 중인 회원 정보입니다.")
    db.refresh(user)
    return user


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> LoginResponse:
    email = str(payload.email).lower()
    user = db.scalar(select(User).where(User.email == email))
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="이메일 또는 비밀번호가 맞지 않습니다.")

    return LoginResponse(access_token=create_access_token(user.id), user=user)


@router.get("/me", response_model=UserResponse)
def read_me(current_user: User = Depends(get_current_user)) -> User:
    return current_user


@router.patch("/me/nickname", response_model=UserResponse)
def update_nickname(
    payload: NicknameUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> User:
    nickname_owner = db.scalar(select(User).where(User.nickname == payload.nickname))
    if nickname_owner is not None and nickname_owner.id != current_user.id:
        raise HTTPException(status_code=409, detail="이미 사용 중인 닉네임입니다.")

    current_user.nickname = payload.nickname
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="이미 사용 중인 닉네임입니다.")
    db.refresh(current_user)
    return current_user
