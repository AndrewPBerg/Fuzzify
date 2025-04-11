import requests
import json
import dnstwist
import time
import subprocess
import os
from models import Permutation, User, Domain
from sqlmodel import SQLModel,Session, create_engine, select
from dotenv import load_dotenv
import sys
# Load environment variables
load_dotenv()


# Database connection
DB_URL = "mysql+mysqlconnector://user:password@localhost:3307/dnstwist_db"
engine = create_engine(DB_URL)


try: 
    with engine.begin() as conn:
        SQLModel.metadata.drop_all(conn)
except Exception as e:
    print(f"Error dropping tables: {e}")
    raise
# Initialize all tables
SQLModel.metadata.create_all(engine)

print(f"Database URL: {DB_URL}")
# data = dnstwist.run(domain='domain.name', registered=True, format='null')
# print(data)

max_threads = os.cpu_count() - 1 if os.cpu_count() is not None else None
print(f"Max threads: {max_threads}")

# add "test user"
username = "test user"
user_id = None
with Session(engine) as session:
    existing_user = session.exec(select(User).where(User.username == username)).first()
    
    if existing_user:
        print("User already exists")
        user_id = existing_user.user_id
    else:
        new_user = User(username=username)
        session.add(new_user)
        session.commit()
        session.refresh(new_user)
        user_id = new_user.user_id
        print(f"Created new user with ID: {user_id}")

# add "google.com" as a domain for the test user
domain_name = "google.com"

with Session(engine) as session:
    # Check if domain already exists for this user
    existing_domain = session.exec(
        select(Domain).where(
            (Domain.domain_name == domain_name) & 
            (Domain.user_id == user_id)
        )
    ).first()
    
    if existing_domain:
        print("Domain already exists")
    else:
        new_domain = Domain(domain_name=domain_name, user_id=user_id, total_scans=0)
        session.add(new_domain)
        session.commit()
        session.refresh(new_domain)
        print(f"Created new domain: {domain_name} for user ID: {user_id}")

# sys.exit(0)
root_domain = 'google.com'

command = [
    'dnstwist', 
    '--lsh', 'tlsh',
    '--phash', 
    '--threads', str(max_threads),
    '--mx', 
    '--banner', 
    '--registered',
    '--format', 'json',
    f'https://{root_domain}'
]

try:
    result = subprocess.run(command, capture_output=True, text=True, check=True)
    obj = json.loads(result.stdout)
    
    # use db session
    with Session(engine) as session:
        for permutation in obj:
            
            if (permutation.get('tlsh') and permutation.get('phash')) is None:
                continue
            if (permutation.get('dns_a') is None) or (permutation.get('dns_a') == "!ServFail"):
                continue
            else:
                # max scores of tlsh and phash
                risk = max(permutation.get('tlsh', 0), permutation.get('phash', 0))
                
                # classify risk levels
                if risk == 0:
                    risk_level = "Unknown"
                elif risk <= 25:
                    risk_level = "low"
                elif risk <= 50:
                    risk_level = "medium"
                else:
                    risk_level = "high"
                    
                perm = Permutation(
                    permutation_name=permutation['domain'],
                    domain_name=root_domain,
                    fuzzer=permutation.get('fuzzer', ''),
                    server=permutation.get('banner_http'),
                    mail_server=permutation.get('dns_mx', [None])[0] if permutation.get('dns_mx') else None,
                    ip_address=permutation.get('dns_a', [None])[0] if permutation.get('dns_a') else None,
                    mx_spy=permutation.get('mx_spy'),
                    tlsh=permutation.get('tlsh'),
                    phash=permutation.get('phash'),
                    risk=risk,
                    risk_level=risk_level
                )
            # Add to session
            session.add(perm)
                    
        # Commit all changes
        session.commit()
    
except subprocess.CalledProcessError as e:
    print(f"Error occurred: {e.stderr}")
except Exception as e:
    print(f"Database error occurred: {str(e)}")
