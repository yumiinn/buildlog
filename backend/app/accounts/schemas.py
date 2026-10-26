import re

from pydantic import BaseModel, ConfigDict, EmailStr, field_validator


NICKNAME_PATTERN = re.compile(r"^[가-힣A-Za-z0-9_]{2,20}$")


def validate_nickname(value: str) -> str:
    nickname = value.strip()
    if not NICKNAME_PATTERN.fullmatch(nickname):
        raise ValueError("닉네임은 2~20자의 한글, 영문, 숫자, 밑줄만 사용할 수 있습니다.")
    return nickname


class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    nickname: str

    @field_validator("email", mode="before")
    @classmethod
    def strip_email(cls, value: object) -> object:
        return value.strip() if isinstance(value, str) else value

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        if not 8 <= len(value) <= 64:
            raise ValueError("비밀번호는 8~64자로 입력해 주세요.")
        return value

    @field_validator("nickname")
    @classmethod
    def check_nickname(cls, value: str) -> str:
        return validate_nickname(value)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str

    @field_validator("email", mode="before")
    @classmethod
    def strip_email(cls, value: object) -> object:
        return value.strip() if isinstance(value, str) else value


class NicknameUpdateRequest(BaseModel):
    nickname: str

    @field_validator("nickname")
    @classmethod
    def check_nickname(cls, value: str) -> str:
        return validate_nickname(value)


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: EmailStr
    nickname: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
