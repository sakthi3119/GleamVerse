import os

CLERK_PUBLISHABLE_KEY = os.getenv("CLERK_PUBLISHABLE_KEY", "")
CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY", "")
CLERK_ISSUER = os.getenv("CLERK_ISSUER", "")
CLERK_JWKS_URL = os.getenv("CLERK_JWKS_URL", (CLERK_ISSUER.rstrip('/') + "/.well-known/jwks.json") if CLERK_ISSUER else "")

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
MONGODB_DB = os.getenv("MONGODB_DB", "gleamverse")

