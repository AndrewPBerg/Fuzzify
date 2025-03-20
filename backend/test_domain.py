from sqlmodel import SQLModel, Field, create_engine, Session, select
from models import Domain, User 
from uuid import uuid4

DATABASE_URL = "mysql+mysqlconnector://user:password@db:3306/dnstwist_db"
engine = create_engine(DATABASE_URL, echo=True)


with Session(engine) as session:
    # Fetch an existing user_id from the user table
    existing_user = session.exec(select(User)).first()
    
    if existing_user:
        domain = Domain(
            domain_name="example.com",
            user_id=existing_user.user_id,  
            ip_address="192.168.1.1",
            server="ns1.example.com",
            mail_server="mail.example.com"
        )
        session.add(domain)
        session.commit()
        print(f"✅ Domain inserted for user {existing_user.user_id}")
    else:
        print("❌ No existing user found. Cannot insert domain.")