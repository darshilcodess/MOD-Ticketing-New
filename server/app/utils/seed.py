"""
Seed script - populates the database with realistic dummy data.

Usage (via Docker):
    docker compose exec backend python app/utils/seed.py

Safeguards:
    - Checks if dummy data already exists before inserting anything.
    - Skips individual entities that already exist (idempotent).
    - Creates all teams, users (across all roles), and sample tickets.
"""

import sys
import logging
from app.core.database import SessionLocal
from app.models.user import User, UserRole
from app.models.team import Team
from app.models.ticket import Ticket, TicketStatus, TicketPriority
from app.core.security import get_password_hash

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

# ─── Seed Data ────────────────────────────────────────────────────────────────

TEAMS = [
    {"name": "Electrical",   "description": "Electrical maintenance and repairs"},
    {"name": "Plumbing",     "description": "Plumbing and water systems"},
    {"name": "HVAC",         "description": "Heating, ventilation and air conditioning"},
    {"name": "IT Support",   "description": "IT infrastructure and helpdesk"},
    {"name": "Civil Works",  "description": "Civil and structural maintenance"},
]

USERS = [
    # G1 / Administrators
    {"email": "g1.admin@example.com",   "password": "admin123",  "full_name": "Alice Admin",       "role": UserRole.G1,    "team": None},
    {"email": "g1.ops@example.com",     "password": "ops123",    "full_name": "Bob Operations",    "role": UserRole.G1,    "team": None},
    # Admin role
    {"email": "superadmin@example.com", "password": "super123",  "full_name": "Super Admin",       "role": UserRole.ADMIN, "team": None},
    # Unit users (raise tickets)
    {"email": "unit.alpha@example.com", "password": "unit123",   "full_name": "Carol Alpha",       "role": UserRole.UNIT,  "team": None},
    {"email": "unit.beta@example.com",  "password": "unit123",   "full_name": "David Beta",        "role": UserRole.UNIT,  "team": None},
    {"email": "unit.gamma@example.com", "password": "unit123",   "full_name": "Eve Gamma",         "role": UserRole.UNIT,  "team": None},
    {"email": "unit.delta@example.com", "password": "unit123",   "full_name": "Frank Delta",       "role": UserRole.UNIT,  "team": None},
    # Team workers
    {"email": "elec.worker1@example.com",  "password": "work123", "full_name": "George Watt",      "role": UserRole.TEAM, "team": "Electrical"},
    {"email": "elec.worker2@example.com",  "password": "work123", "full_name": "Hannah Volt",      "role": UserRole.TEAM, "team": "Electrical"},
    {"email": "plumb.worker1@example.com", "password": "work123", "full_name": "Ian Pipe",         "role": UserRole.TEAM, "team": "Plumbing"},
    {"email": "plumb.worker2@example.com", "password": "work123", "full_name": "Jane Flow",        "role": UserRole.TEAM, "team": "Plumbing"},
    {"email": "hvac.worker1@example.com",  "password": "work123", "full_name": "Kevin Cool",       "role": UserRole.TEAM, "team": "HVAC"},
    {"email": "it.worker1@example.com",    "password": "work123", "full_name": "Laura Code",       "role": UserRole.TEAM, "team": "IT Support"},
    {"email": "civil.worker1@example.com", "password": "work123", "full_name": "Mike Build",       "role": UserRole.TEAM, "team": "Civil Works"},
]

TICKETS = [
    # Electrical tickets
    {"title": "Power outage in Block A",           "description": "Complete power failure noticed in Block A, floor 2. Multiple sockets dead.",
     "priority": TicketPriority.HIGH,    "status": TicketStatus.OPEN,      "creator_email": "unit.alpha@example.com",  "team": None},
    {"title": "Faulty circuit breaker - Lab 3",    "description": "Circuit breaker trips every time lab equipment is powered on.",
     "priority": TicketPriority.HIGH,    "status": TicketStatus.ALLOCATED, "creator_email": "unit.beta@example.com",   "team": "Electrical"},
    {"title": "Flickering lights in corridor B",   "description": "Lights flicker intermittently in the east corridor B.",
     "priority": TicketPriority.LOW,     "status": TicketStatus.RESOLVED,  "creator_email": "unit.alpha@example.com",  "team": "Electrical"},
    # Plumbing tickets
    {"title": "Water leak under kitchen sink",     "description": "Slow drip under canteen kitchen sink, possible pipe joint failure.",
     "priority": TicketPriority.MEDIUM,  "status": TicketStatus.OPEN,      "creator_email": "unit.gamma@example.com",  "team": None},
    {"title": "Blocked drain in Washroom 2",       "description": "Drain completely blocked, water backing up.",
     "priority": TicketPriority.HIGH,    "status": TicketStatus.ALLOCATED, "creator_email": "unit.delta@example.com",  "team": "Plumbing"},
    {"title": "No hot water in shower block",      "description": "Hot water system not functioning since morning.",
     "priority": TicketPriority.MEDIUM,  "status": TicketStatus.CLOSED,    "creator_email": "unit.beta@example.com",   "team": "Plumbing"},
    # HVAC tickets
    {"title": "AC not cooling in Server Room",     "description": "Server room temperature rising. AC unit running but not cooling.",
     "priority": TicketPriority.HIGH,    "status": TicketStatus.ALLOCATED, "creator_email": "unit.alpha@example.com",  "team": "HVAC"},
    {"title": "Ventilation noise - Floor 3",       "description": "Loud rattling noise from HVAC vents on floor 3.",
     "priority": TicketPriority.LOW,     "status": TicketStatus.OPEN,      "creator_email": "unit.gamma@example.com",  "team": None},
    # IT tickets
    {"title": "Network switch failure - Wing C",   "description": "Network switch in Wing C has failed, 15 machines offline.",
     "priority": TicketPriority.HIGH,    "status": TicketStatus.RESOLVED,  "creator_email": "unit.delta@example.com",  "team": "IT Support"},
    {"title": "Printer offline - Admin block",     "description": "HP LaserJet shows offline status despite being powered on.",
     "priority": TicketPriority.LOW,     "status": TicketStatus.OPEN,      "creator_email": "unit.beta@example.com",   "team": None},
    # Civil tickets
    {"title": "Ceiling crack in Meeting Room 1",   "description": "Visible crack appearing in the ceiling, potentially structural.",
     "priority": TicketPriority.MEDIUM,  "status": TicketStatus.ALLOCATED, "creator_email": "unit.alpha@example.com",  "team": "Civil Works"},
    {"title": "Broken door handle - Gate 2",       "description": "Entry door handle broken, security risk.",
     "priority": TicketPriority.MEDIUM,  "status": TicketStatus.CLOSED,    "creator_email": "unit.gamma@example.com",  "team": "Civil Works"},
]


# ─── Validation ───────────────────────────────────────────────────────────────

def has_existing_data(db) -> bool:
    """Return True if the database already contains dummy seed data."""
    user_count = db.query(User).count()
    team_count = db.query(Team).count()
    ticket_count = db.query(Ticket).count()

    if user_count > 0 or team_count > 0 or ticket_count > 0:
        logger.info(
            f"⚠️  Existing data detected: {user_count} users, "
            f"{team_count} teams, {ticket_count} tickets."
        )
        return True
    return False


# ─── Seed Function ────────────────────────────────────────────────────────────

def seed_db(force: bool = False):
    db = SessionLocal()
    try:
        # ── Guard: skip if data already exists ───────────────────────────────
        if has_existing_data(db) and not force:
            logger.info("✅ Database already seeded. Use --force to re-seed.")
            return

        if force:
            logger.info("🔄 --force flag set: skipping existing records (not deleting).")

        # ── Teams ─────────────────────────────────────────────────────────────
        team_map: dict[str, Team] = {}
        for t in TEAMS:
            existing = db.query(Team).filter(Team.name == t["name"]).first()
            if not existing:
                obj = Team(name=t["name"], description=t["description"])
                db.add(obj)
                db.flush()
                team_map[t["name"]] = obj
                logger.info(f"  ➕ Team: {t['name']}")
            else:
                team_map[t["name"]] = existing
                logger.info(f"  ⏭️  Team already exists: {t['name']}")
        db.commit()

        # ── Users ─────────────────────────────────────────────────────────────
        user_map: dict[str, User] = {}
        for u in USERS:
            existing = db.query(User).filter(User.email == u["email"]).first()
            if not existing:
                team_obj = team_map.get(u["team"]) if u["team"] else None
                obj = User(
                    email=u["email"],
                    hashed_password=get_password_hash(u["password"]),
                    full_name=u["full_name"],
                    role=u["role"],
                    team_id=team_obj.id if team_obj else None,
                    is_active=True,
                )
                db.add(obj)
                db.flush()
                user_map[u["email"]] = obj
                logger.info(f"  ➕ User: {u['email']}  [{u['role'].value}]")
            else:
                user_map[u["email"]] = existing
                logger.info(f"  ⏭️  User already exists: {u['email']}")
        db.commit()

        # ── Tickets ───────────────────────────────────────────────────────────
        for tk in TICKETS:
            existing = db.query(Ticket).filter(Ticket.title == tk["title"]).first()
            if not existing:
                creator = user_map.get(tk["creator_email"])
                assigned_team = team_map.get(tk["team"]) if tk["team"] else None
                obj = Ticket(
                    title=tk["title"],
                    description=tk["description"],
                    priority=tk["priority"],
                    status=tk["status"],
                    created_by_id=creator.id if creator else None,
                    assigned_team_id=assigned_team.id if assigned_team else None,
                )
                db.add(obj)
                logger.info(f"  ➕ Ticket: {tk['title'][:50]}")
            else:
                logger.info(f"  ⏭️  Ticket already exists: {tk['title'][:50]}")
        db.commit()

        logger.info("\n✅ Database seeded successfully!")
        logger.info(f"   Teams: {len(TEAMS)} | Users: {len(USERS)} | Tickets: {len(TICKETS)}")

    except Exception as e:
        import traceback
        db.rollback()
        logger.error(f"❌ Seed failed: {e}")
        traceback.print_exc()
        sys.exit(1)
    finally:
        db.close()


# ─── Entry Point ──────────────────────────────────────────────────────────────

if __name__ == "__main__":
    force = "--force" in sys.argv
    seed_db(force=force)
