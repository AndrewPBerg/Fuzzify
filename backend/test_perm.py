
import subprocess
import json
from sqlalchemy import text
from sqlmodel import select, Session, create_engine
from models import Permutation, Domain, User


DATABASE_URL = "mysql+mysqlconnector://user:password@db:3306/dnstwist_db"
engine = create_engine(DATABASE_URL, echo=True)


def generate_and_store_permutations(domain):
    try:
        # Run dnstwist
        result = subprocess.run(
            ["python", "-m", "dnstwist", "--format", "json", domain],
            capture_output=True,
            text=True,
            check=True
        )
        permutations = json.loads(result.stdout)
    except Exception as e:
        print(f"❌ Error running dnstwist: {e}")
        return

    with Session(engine) as session:
        print("✅ Connected to:", engine.url)

         # Check if a user exists
        user = session.exec(select(User)).first()
        if not user:
            print("❌ No user found. Please create a user before running this function.")
            return
        else:
            print(f"✅ Using existing user: {user.user_id}")

        # Ensure the domain exists, insert if not
        domain_obj = session.get(Domain, domain)
        if not domain_obj:
            domain_obj = Domain(domain_name=domain, user_id=user.user_id)
            session.add(domain_obj)
            session.commit()
            print(f" Added domain: {domain}")

        # Insert permutations
        for entry in permutations:
            perm = Permutation(
                permutation_name=entry['domain'],
                domain_name=domain,
                server=entry.get('http'),
                mail_server=entry.get('mx'),
                risk=None,
                ip_address=', '.join(entry.get('dns_a', [])) if isinstance(entry.get('dns_a'), list) else entry.get('dns_a')
            )
            session.add(perm)

        session.commit()
        print(f"✅ Stored {len(permutations)} permutations for {domain}")

if __name__ == "__main__":
    generate_and_store_permutations("example.com")