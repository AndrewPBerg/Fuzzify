from sqlmodel import Session, select
from backend.models import User, Domain, Permutation
from backend.app import engine
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def seed_test_data():
    with Session(engine) as session:
        # 1. Create a user
        user = User(user_name="test_user")
        session.add(user)
        session.commit()
        session.refresh(user)
        logger.info("👤 User seeded")

        # 2. Create a domain linked to user
        domain = Domain(domain_name="test.com", user_id=user.user_id, total_scans=0)
        session.add(domain)
        session.commit()
        session.refresh(domain)
        logger.info("🌐 Domain seeded")

        # 3. Add 5 permutations for testing
        permutations = [
            "g00gle-secure-login.com",
            "secure-goggle-login.com",
            "googl3-login.net",
            "login-google-security.org",
            "go0gle-authenticate.io"
        ]

        for perm_name in permutations:
            perm = Permutation(
                permutation_name=perm_name,
                domain_name=domain.domain_name,  # FK link
                server=None,
                mail_server=None,
                ip_address=None,
                risk=None,
                content_risk=None,
                content_score=None
            )
            session.add(perm)

        session.commit()
        logger.info("🧪 5 test permutations seeded successfully")

if __name__ == "__main__":
    seed_test_data()

