from sqlalchemy.orm import Session
from .database import Base, engine, SessionLocal
from . import models
import json
import os

def run_seed():
	Base.metadata.create_all(bind=engine)
	db: Session = SessionLocal()
	try:
		if db.query(models.Jeweler).count() == 0:
			jewelers = [
				{"name": "Aurora Gems", "country": "USA", "logo_url": None, "description": "Fine modern jewelry."},
				{"name": "Rajasthan Royals Jewels", "country": "India", "logo_url": None, "description": "Traditional handcrafted designs."},
				{"name": "Kyoto Goldsmiths", "country": "Japan", "logo_url": None, "description": "Minimalist luxury pieces."},
			]
			objs = []
			for j in jewelers:
				objs.append(models.Jeweler(**j))
			db.add_all(objs)
			db.commit()

		# Reset products to match requested catalog exactly
		# This will clear previous seed data and create a curated list:
		db.query(models.Product).delete()
		db.commit()

		# Images should be placed under /assets/jewellery with these names
		necklace_imgs = [
			"necklace1.png", "necklace2.png", "necklace3.png", "necklace4.png",
		]
		ring_imgs = [
			"ring1.png", "ring2.png", "ring3.png",
		]
		bracelet_imgs = [
			"bracelet1.png", "bracelet2.png", "bracelet3.png",
		]
		nosepin_imgs = [
			"nosepin1.png", "nosepin2.png", "nosepin3.png",
		]

		def mk_item(name: str, category: str, img: str, price_inr: float, jeweler_id: int):
			return {
				"name": name,
				"category": category,
				"price": price_inr,
				"currency": "INR",
				"thumbnail_url": f"/static/jewellery/{img}",
				"image_url": f"/static/jewellery/{img}",
				"model_overlay_url": f"/static/jewellery/{img}",
				# Only metal option retained
				"options": json.dumps({
					"metal": ["Gold", "Silver", "Platinum"],
				}),
				"jeweler_id": jeweler_id,
			}

		items = []
		jid_count = max(db.query(models.Jeweler).count(), 1)
		# Curated names
		necklace_names = ["Aarohi Choker", "Nitya Cascade", "Shakti Collar", "Meera Regal"]
		ring_names = ["Serenity Band", "Astra Halo", "Nirvana Twist"]
		bracelet_names = ["Celeste Tennis", "Luna Link", "Aurora Cuff"]
		nosepin_names = ["Diya Stud", "Kajal Spark", "Noor Drop"]

		# 4 Necklaces
		for i, img in enumerate(necklace_imgs):
			name = necklace_names[i] if i < len(necklace_names) else f"Necklace {i+1}"
			items.append(mk_item(name, "Necklace", img, 4999.0 + i * 1500, (i % jid_count) + 1))
		# 3 Rings
		for i, img in enumerate(ring_imgs):
			name = ring_names[i] if i < len(ring_names) else f"Ring {i+1}"
			items.append(mk_item(name, "Ring", img, 2999.0 + i * 1200, (i % jid_count) + 1))
		# 3 Bracelets
		for i, img in enumerate(bracelet_imgs):
			name = bracelet_names[i] if i < len(bracelet_names) else f"Bracelet {i+1}"
			items.append(mk_item(name, "Bracelet", img, 3999.0 + i * 1800, (i % jid_count) + 1))
		# 3 Nose Pins
		for i, img in enumerate(nosepin_imgs):
			name = nosepin_names[i] if i < len(nosepin_names) else f"Nose Pin {i+1}"
			items.append(mk_item(name, "Nose Pin", img, 1499.0 + i * 600, (i % jid_count) + 1))

		if items:
			objs = [models.Product(**p) for p in items]
			db.add_all(objs)
			db.commit()
	finally:
		db.close()

if __name__ == "__main__":
	run_seed()

