from sqlalchemy import Column, Integer, String, Float, ForeignKey, Text
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
	__tablename__ = "users"
	id = Column(Integer, primary_key=True, index=True)
	username = Column(String(64), unique=True, index=True, nullable=False)
	password_hash = Column(String(255), nullable=False)
	full_name = Column(String(128), nullable=True)
	country = Column(String(64), nullable=True)
	address_line1 = Column(String(255), nullable=True)
	address_line2 = Column(String(255), nullable=True)
	city = Column(String(64), nullable=True)
	state = Column(String(64), nullable=True)
	postal_code = Column(String(32), nullable=True)

class Jeweler(Base):
	__tablename__ = "jewelers"
	id = Column(Integer, primary_key=True, index=True)
	name = Column(String(128), nullable=False)
	country = Column(String(64), nullable=False)
	logo_url = Column(String(512), nullable=True)
	description = Column(Text, nullable=True)
	products = relationship("Product", back_populates="jeweler")

class Product(Base):
	__tablename__ = "products"
	id = Column(Integer, primary_key=True, index=True)
	name = Column(String(128), nullable=False)
	category = Column(String(64), nullable=False)
	price = Column(Float, nullable=False)
	currency = Column(String(8), default="USD")
	thumbnail_url = Column(String(512), nullable=True)
	image_url = Column(String(512), nullable=True)
	model_overlay_url = Column(String(512), nullable=True)
	options = Column(Text, nullable=True)  # JSON string for sizes/metals
	jeweler_id = Column(Integer, ForeignKey("jewelers.id"))
	jeweler = relationship("Jeweler", back_populates="products")

