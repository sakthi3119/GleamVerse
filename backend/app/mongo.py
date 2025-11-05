from pymongo import MongoClient
from .config import MONGODB_URI, MONGODB_DB

client = MongoClient(MONGODB_URI)
db = client[MONGODB_DB]

def users_col():
	return db["users"]

def products_col():
	return db["products"]

def jewelers_col():
	return db["jewelers"]

