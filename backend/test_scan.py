
from sqlmodel import Session, create_engine, select, SQLModel
from models import User, Domain, Permutation, PhishingDomain, ImagePhishingDomain
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
    user = session.exec(select(User).where(User.username == user_name)).first()
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

def run_dnstwist(domain_name, mode="lsh"):
    print(f"🔍 Running dnstwist ({mode}) for domain: {domain_name}")
    if mode == "phash":
        command = [
            'dnstwist',
            '--phash',
            '--phash-url', f'https://{domain_name}',
            '--mx',
            '--banner',
            '--format', 'json',
            domain_name
        ]
    elif mode == "lsh":
        command = [
            'dnstwist',
            '--lsh', 'tlsh',
            '--mx',
            '--banner',
            '--format', 'json',
            domain_name
        ]
    else:
        raise ValueError(f"Unsupported mode: {mode}")
   
    result = subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

    if result.returncode != 0:
        print(f"❌ Error running dnstwist: {result.stderr}")
        return []

    try:
        data = json.loads(result.stdout)
        print("\n📦 First 20 dnstwist entries:\n")
        for i, entry in enumerate(data):
            if i >= 20:
                break
            pprint.pprint(entry)
            print("-" * 50)
        return data
    except json.JSONDecodeError:
        print("❌ Failed to parse JSON from dnstwist output.")
        return []
    

def extract_ip_and_mail(entry):
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

    return mail_server, ip_address

def process_results(session, domain, data, threshold, mode="lsh"):
    hits = []
    for entry in data:
        permutation_name = entry.get("domain")
        similarity = entry.get("fuzzy_hash_similarity") if mode == "lsh" else entry.get("phash")
        if not permutation_name:
            continue

        mail_server, ip_address = extract_ip_and_mail(entry)
        server = entry.get("banner_http") or entry.get("http_server")

        permutation = session.exec(select(Permutation).where(Permutation.permutation_name == permutation_name)).first()

        if not permutation:
            permutation = Permutation(
                permutation_name=permutation_name,
                domain_name=domain.domain_name,
                server=server,
                mail_server=mail_server,
                ip_address=ip_address,
                mx_spy=entry.get("mx_spy")
            )
            session.add(permutation)
            session.commit()
            session.refresh(permutation)
        else:
            updated = False
            if not permutation.server and server:
                permutation.server = server
                updated = True
            if not permutation.mail_server and mail_server:
                permutation.mail_server = mail_server
                updated = True
            if not permutation.ip_address and ip_address:
                permutation.ip_address = ip_address
                updated = True
            if not permutation.mx_spy and entry.get("mx_spy") is not None:
                permutation.mx_spy = entry["mx_spy"]
                updated = True
            if updated:
                session.add(permutation)
                session.commit()

        if similarity is not None and similarity >= threshold:
            shared_fields = {
                "domain_name": domain.domain_name,
                "permutation_name": permutation_name,
                "url": entry.get("url"),
                "similarity_score": similarity,
                "method": mode,
                "created_at": datetime.now(timezone.utc),
                "server": server,
                "mail_server": mail_server,
                "ip_address": ip_address
            }

            if mode == "lsh":
                hit = PhishingDomain(**shared_fields)
            else:
                hit = ImagePhishingDomain(**shared_fields)

            session.add(hit)
            hits.append(hit)

    session.commit()
    return hits

# === RUN IT ALL ===
if __name__ == "__main__":
    domain_name = "github.com"
    lsh_threshold = 40
    phash_threshold = 60

    with Session(engine) as session:
        user, domain = seed_user_and_domain(session)

        # Phase 1: LSH
        lsh_data = run_dnstwist(domain_name, mode="lsh")
        lsh_hits = process_results(session, domain, lsh_data, lsh_threshold, mode="lsh")

        # Phase 2: pHash
        phash_data = run_dnstwist(domain_name, mode="phash")
        phash_hits = process_results(session, domain, phash_data, phash_threshold, mode="phash")

        print("\n✅ DONE. LSH Phishing Hits:")
        for hit in lsh_hits:
            print(f" - {hit.permutation_name} ({hit.similarity_score}%) → {hit.url}")

        print("\n🖼️ DONE. pHash Image Phishing Hits:")
        for hit in phash_hits:
            print(f" - {hit.permutation_name} ({hit.similarity_score}%) → {hit.url}")



