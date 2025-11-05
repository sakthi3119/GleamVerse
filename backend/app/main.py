from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from .routers import auth, products

app = FastAPI(title="GleamVerse API", version="1.0.0")

app.add_middleware(
	CORSMiddleware,
	allow_origins=[
		"http://localhost:5500",
		"http://127.0.0.1:5500",
	],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(products.router, prefix="/products", tags=["products"])

# Serve jewellery assets for demo (backend/assets/jewellery)
project_root = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
assets_dir = os.path.join(project_root, "backend", "assets")
static_jewellery_path = os.path.join(assets_dir, "jewellery")
if os.path.isdir(static_jewellery_path):
	app.mount("/static/jewellery", StaticFiles(directory=static_jewellery_path), name="jewellery")

@app.get("/")
def root():
	return {"status": "ok", "service": "gleamverse"}

