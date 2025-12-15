from sqlalchemy.orm import Session
from database import get_db, engine
from models import Habit, Progress
from datetime import date

# Get a session
db = next(get_db())

# Add a sample habit
new_habit = Habit(
    name="Drink Water",
    frequency="daily",
    category="health",
    start_date=date(2025, 12, 13)  # Today's date
)
db.add(new_habit)
db.commit()
print(f"Added habit: {new_habit.name} (ID: {new_habit.id})")

# Add a progress entry
new_progress = Progress(
    habit_id=new_habit.id,
    completed=1,
    notes="Felt hydrated!"
)
db.add(new_progress)
db.commit()
print(f"Added progress for {new_progress.date}")

# Query to check
habits = db.query(Habit).all()
print("All habits:", [(h.name, h.category) for h in habits])

db.close()