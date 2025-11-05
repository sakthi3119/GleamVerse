from fastapi import Depends, Header, HTTPException, status
from typing import Optional
from jwt import PyJWKClient, decode as jwt_decode
from .config import CLERK_ISSUER, CLERK_JWKS_URL

_jwks_client = PyJWKClient(CLERK_JWKS_URL) if CLERK_JWKS_URL else None

def require_clerk_user(authorization: Optional[str] = Header(default=None)) -> str:
	if not CLERK_ISSUER or not _jwks_client:
		raise HTTPException(status_code=500, detail="Clerk not configured")
	if not authorization or not authorization.lower().startswith("bearer "):
		raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing bearer token")
	token = authorization.split(" ", 1)[1]
	signing_key = _jwks_client.get_signing_key_from_jwt(token)
	claims = jwt_decode(
		token,
		signing_key.key,
		algorithms=["RS256"],
		audience=None,
		options={"verify_aud": False, "verify_iss": True},
		issuer=CLERK_ISSUER,
	)
	user_id = claims.get("sub")
	if not user_id:
		raise HTTPException(status_code=401, detail="Invalid token")
	return user_id

