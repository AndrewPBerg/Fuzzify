
from sqlmodel import Session, create_engine, select, SQLModel
from models import User, Domain, Permutation, PhishingDomain
from uuid import uuid4
from datetime import datetime, timezone
import subprocess
import json
import pprint
import logging
import idna

logging.getLogger('sqlalchemy').setLevel(logging.CRITICAL)

# PYTHONPATH=. python3 backend/test_scan.py


# Change this to your working connection string
DATABASE_URL = "mysql+mysqlconnector://user:password@db:3306/dnstwist_db"
engine = create_engine(DATABASE_URL, echo=False)
SQLModel.metadata.create_all(engine)

def decode_domain(domain):
    try:
        return idna.decode(domain)
    except Exception:
        return domain  # fallback if decoding fails

def seed_user_and_domain(session, user_name="testuser", domain_name="github.com"):
    # Create user
    user = session.exec(select(User).where(User.user_name == user_name)).first()
    if not user:
        user = User(user_id=str(uuid4()), user_name=user_name)
        session.add(user)
        session.commit()
        session.refresh(user)

    # Create domain
    domain = session.exec(select(Domain).where(Domain.domain_name == domain_name)).first()
    if not domain:
        domain = Domain(
            domain_name=domain_name,
            user_id=user.user_id,
            ip_address="142.250.190.14",  # Example IP for google.com
            server="gws",  # Google Web Server
            mail_server="aspmx.l.google.com"
        )
        session.add(domain)
        session.commit()
    return user, domain

def run_dnstwist(domain_name):
    print(f"🔍 Running dnstwist for domain: {domain_name}")
    result = subprocess.run(
    [
        'dnstwist',
        '--lsh', 'tlsh',
        '--mx',
        '--banner',
        '--format', 'json',
        domain_name
    ],
    stdout=subprocess.PIPE,
    stderr=subprocess.PIPE,
    text=True
)


    """try:
        data = json.loads(result.stdout)
        for entry in data:
            decoded = decode_domain(entry.get("domain", ""))
            fuzzer = entry.get("fuzzer", "unknown")
            #print(f"🔎 {decoded} (fuzzer: {fuzzer})")   
    except Exception as e:
        print("Failed to parse dnstwist output:", e)
        print("Raw output:\n", result.stdout)"""
    

    if result.returncode != 0:
        print(f"❌ Error running dnstwist: {result.stderr}")
        return []

    try:
        return json.loads(result.stdout)
    except json.JSONDecodeError:
        print("❌ Failed to parse JSON from dnstwist output.")
        return []

def process_results(session, domain, data, threshold):
    phishing_hits = []
    for entry in data:
        permutation_name = entry.get("domain")
        similarity = entry.get("fuzzy_hash_similarity")
        # pprint.pprint(entry)

        if not permutation_name:
            continue

        # Add permutation if missing
        permutation = session.exec(
            select(Permutation).where(Permutation.permutation_name == permutation_name)
        ).first()
 
        if not permutation:
    # 🛠 Extract data early
            mail_server = None
            ip_address = None

            if isinstance(entry.get("dns_mx"), list) and entry["dns_mx"]:
                mail_server = entry["dns_mx"][0]
            elif isinstance(entry.get("dns_mx"), str):
                mail_server = entry["dns_mx"]

            if isinstance(entry.get("dns_a"), list) and entry["dns_a"]:
                ip_address = entry["dns_a"][0]
            elif isinstance(entry.get("dns_aaaa"), list) and entry["dns_aaaa"]:
                ip_address = entry["dns_aaaa"][0]

    # Now insert
            permutation = Permutation(
                permutation_name=permutation_name,
                domain_name=domain.domain_name,
                server=entry.get("banner_http") or entry.get("http_server"),
                mail_server=mail_server,
                ip_address=ip_address
            )
            session.add(permutation)
            session.commit()
            session.refresh(permutation)

        else:
    # 🛠 M ove the same logic up here too
            mail_server = None
            ip_address = None

            if isinstance(entry.get("dns_mx"), list) and entry["dns_mx"]:
                mail_server = entry["dns_mx"][0]
            elif isinstance(entry.get("dns_mx"), str):
                mail_server = entry["dns_mx"]

            if isinstance(entry.get("dns_a"), list) and entry["dns_a"]:
                ip_address = entry["dns_a"][0]
            elif isinstance(entry.get("dns_aaaa"), list) and entry["dns_aaaa"]:
                ip_address = entry["dns_aaaa"][0]

    # Update if any values are missing
            updated = False
            if not permutation.server and (entry.get("banner_http") or entry.get("http_server")):
                permutation.server = entry.get("banner_http") or entry.get("http_server")
                updated = True
            if not permutation.mail_server and mail_server:
                permutation.mail_server = mail_server
                updated = True
            if not permutation.ip_address and ip_address:
                permutation.ip_address = ip_address
                updated = True

            if updated:
                session.add(permutation)
                session.commit()
                session.refresh(permutation)

        # Check if it's a phishing hit
        if similarity is not None and similarity >= threshold:
            hit = PhishingDomain(
                domain_name=domain.domain_name,
                permutation_name=permutation_name,
                url=entry.get("url"),
                similarity_score=similarity,
                method="lsh",
                created_at=datetime.now(timezone.utc)
            )
            session.add(hit)
            phishing_hits.append(hit)

    domain.last_scan = datetime.now(timezone.utc)
    domain.total_scans += 1
    session.add(domain)
    session.commit()

    return phishing_hits

# === RUN IT ALL ===
if __name__ == "__main__":
    domain_name = "github.com"
    threshold = 40

    with Session(engine) as session:
        user, domain = seed_user_and_domain(session)
        data = run_dnstwist(domain_name)
        hits = process_results(session, domain, data, threshold)

        print("\n✅ DONE. Phishing Hits:")
        for hit in hits:
            print(f" - {hit.permutation_name} ({hit.similarity_score}%) → {hit.url}")


