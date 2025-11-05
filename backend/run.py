import uvicorn
from app.database import Base, engine
from app.seed import run_seed
from sqlalchemy import text
from sqlalchemy.engine import Connection

def main():
	Base.metadata.create_all(bind=engine)
	# Ensure new columns exist for users table if DB already created
	with engine.begin() as conn:  # type: Connection
		cols = {row[1] for row in conn.execute(text("PRAGMA table_info(users)"))}
		def add(col, type_):
			if col not in cols:
				conn.execute(text(f"ALTER TABLE users ADD COLUMN {col} {type_}"))
		add("address_line1", "VARCHAR(255)")
		add("address_line2", "VARCHAR(255)")
		add("city", "VARCHAR(64)")
		add("state", "VARCHAR(64)")
		add("postal_code", "VARCHAR(32)")
	run_seed()
	uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=False)

if __name__ == "__main__":
	main()

