from sqlmodel import SQLModel, create_engine, Session
from sqlalchemy import text

DATABASE_URL = "mysql+mysqlconnector://user:password@db:3306/dnstwist_db"
engine = create_engine(DATABASE_URL)

try:
    with Session(engine) as session:
        result = session.execute(text("SHOW TABLES;"))
        print("✅ Connected to the database! Tables:")
        for row in result:
            print(row)
except Exception as e:
    print(f"❌ Failed to connect: {e}")