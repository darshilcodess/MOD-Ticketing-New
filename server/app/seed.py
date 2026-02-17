from app.core.database import SessionLocal, engine, Base
from app.models.user import User, UserRole
from app.models.team import Team
from app.models.ticket import Ticket
from app.core.security import get_password_hash
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Create Teams
        electrical = db.query(Team).filter(Team.name == "Electrical").first()
        if not electrical:
            electrical = Team(name="Electrical", description="Electrical maintenance")
            db.add(electrical)
            db.commit()
            db.refresh(electrical)
            logger.info("Created Electrical Team")

        # Create Users
        # 1. Admin/G1
        admin = db.query(User).filter(User.email == "admin@example.com").first()
        if not admin:
            admin = User(
                email="admin@example.com",
                hashed_password=get_password_hash("admin123"),
                full_name="Admin G1",
                role=UserRole.G1,
                is_active=True
            )
            db.add(admin)
            logger.info("Created Admin User")

        # 2. Unit User
        unit = db.query(User).filter(User.email == "unit@example.com").first()
        if not unit:
            unit = User(
                email="unit@example.com",
                hashed_password=get_password_hash("unit123"),
                full_name="Unit User",
                role=UserRole.UNIT,
                is_active=True
            )
            db.add(unit)
            logger.info("Created Unit User")

        # 3. Team Member
        worker = db.query(User).filter(User.email == "worker@example.com").first()
        if not worker:
            worker = User(
                email="worker@example.com",
                hashed_password=get_password_hash("worker123"),
                full_name="Electrical Worker",
                role=UserRole.TEAM,
                team_id=electrical.id,
                is_active=True
            )
            db.add(worker)
            logger.info("Created Team Worker")
        
        db.commit()
        logger.info("Database initialized successfully")

    except Exception as e:
        import traceback
        traceback.print_exc()
        logger.error(f"Error seeding database: {e}")

        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
