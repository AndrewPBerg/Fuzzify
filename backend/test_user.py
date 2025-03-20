from sqlmodel import SQLModel, Field, create_engine, Session
from models import User  
from uuid import uuid4

DATABASE_URL = "mysql+mysqlconnector://user:password@db:3306/dnstwist_db"
engine = create_engine(DATABASE_URL, echo=True)

# create tables if not already created
SQLModel.metadata.create_all(engine)

with Session(engine) as session:
    user = User(username="test_user")  
    session.add(user)
    session.commit()
    print(f"✅ User inserted with ID: {user.user_id} and username: {user.username}")
