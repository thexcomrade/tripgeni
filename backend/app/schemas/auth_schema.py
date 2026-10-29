from datetime import datetime

from pydantic import BaseModel
from pydantic import ConfigDict
from pydantic import EmailStr
from pydantic import Field


class RegisterRequest(BaseModel):
    full_name: str = Field(min_length=2, max_length=150)

    email: EmailStr

    password: str = Field(min_length=8, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr

    password: str = Field(min_length=8, max_length=128)


class TokenResponse(BaseModel):
    access_token: str

    token_type: str = "Bearer"


class LoginResponse(BaseModel):
    message: str

    access_token: str

    token_type: str = "Bearer"


class RegisterResponse(BaseModel):
    message: str

    user_id: str

    email: EmailStr


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetConfirmRequest(BaseModel):
    token: str

    new_password: str = Field(min_length=8, max_length=128)


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(min_length=8, max_length=128)

    new_password: str = Field(min_length=8, max_length=128)

    verification_code: str = Field(min_length=6, max_length=6)


class SendPasswordOtpResponse(BaseModel):
    message: str

    email: str


class EmailVerificationRequest(BaseModel):
    token: str


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class RefreshTokenResponse(BaseModel):
    access_token: str

    token_type: str = "Bearer"


class UpdateProfileRequest(BaseModel):
    full_name: str | None = None
    username: str | None = None
    bio: str | None = None
    date_of_birth: str | None = None
    base_location: str | None = None
    country: str | None = None
    travel_preferences: str | None = None


class CurrentUserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str

    full_name: str

    username: str = "traveler"

    email: EmailStr

    bio: str | None = None

    country: str | None = None

    date_of_birth: str | None = None

    base_location: str | None = None

    travel_preferences: str | None = None

    is_active: bool

    is_verified: bool

    eco_travel_score: int

    total_trips: int

    created_at: datetime


class LogoutResponse(BaseModel):
    message: str


class AuthenticationStatusResponse(BaseModel):
    authenticated: bool

    user_id: str | None = None

    email: str | None = None
