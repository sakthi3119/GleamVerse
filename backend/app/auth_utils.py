from datetime import datetime, timedelta, timezone
from typing import Optional
from passlib.context import CryptContext
import jwt
from fastapi import HTTPException, status

SECRET_KEY = "change-this-secret-in-prod"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
	return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
	return pwd_context.hash(password)

def create_access_token(subject: str, expires_delta: Optional[timedelta] = None) -> str:
	expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
	to_encode = {"sub": subject, "exp": expire}
	encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
	return encoded_jwt

def decode_access_token(token: str) -> str:
	try:
		payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
		username = payload.get("sub")
		if not username:
			raise ValueError("Invalid token")
		return username
	except Exception:
		raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

