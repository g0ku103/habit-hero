from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base  # Import our models

# SQLite database file (created in backend folder)
SQLALCHEMY_DATABASE_URL = "sqlite:///./habit_hero.db"

# Create engine (handles connection)
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# Create session factory (like a "cursor" for queries)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependency to get DB session in FastAPI (we'll use this later)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Create all tables from models
Base.metadata.create_all(bind=engine)