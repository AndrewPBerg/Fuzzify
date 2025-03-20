from sqlmodel import Session, create_engine
from sqlalchemy import text 

DATABASE_URL = "mysql+mysqlconnector://user:password@db:3306/dnstwist_db"
engine = create_engine(DATABASE_URL)

with Session(engine) as session:
    print("Connected to:", engine.url)
    session.execute(text("INSERT INTO permutation (permutation_name, domain_name) VALUES ('test-insert.com', 'example.com');"))
    session.commit()