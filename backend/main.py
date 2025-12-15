from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date, timedelta
from typing import List, Dict, Any, Optional

from database import get_db
from models import Habit, Progress
from schemas import HabitCreate, HabitResponse, ProgressCreate, ProgressResponse
from ai_logic import get_habit_suggestions, get_motivational_quote
from analytics import get_completion_trend, get_category_progress, get_overall_success_rate, get_longest_streak
from pydantic import BaseModel

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Habit Hero API", description="Track your habits!")

# CORS — allow frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to your Vercel URL later if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# For AI suggestions request
class SuggestionRequest(BaseModel):
    target_category: Optional[str] = None
    num_suggestions: int = 3


# ============ DEMO DATA SEED (Safe — only if empty) ============
@app.post("/seed-demo-data", response_model=None)
def seed_demo_data(db: Session = Depends(get_db)):
    # Do NOT delete data — only seed if empty
    if db.query(Habit).count() > 0:
        return {"message": "Data already exists — skipping seed"}

    habits_data = [
        {"name": "Morning Run", "category": "health", "start_date": date(2025, 11, 1)},
        {"name": "Read 30 pages", "category": "learning", "start_date": date(2025, 11, 15)},
        {"name": "Meditate 10 mins", "category": "health", "start_date": date(2025, 11, 20)},
        {"name": "Code 1 hour", "category": "work", "start_date": date(2025, 12, 1)},
        {"name": "Drink 8 glasses water", "category": "health", "start_date": date(2025, 12, 5)},
        {"name": "Journal gratitude", "category": "general", "start_date": date(2025, 12, 1)},
    ]

    habits = []
    for h in habits_data:
        habit = Habit(
            name=h["name"],
            frequency="daily",
            category=h["category"],
            start_date=h["start_date"],
        )
        db.add(habit)
        habits.append(habit)

    db.commit()

    today = date(2025, 12, 15)  # Current date

    for habit in habits:
        current = habit.start_date
        day_index = 0
        while current <= today:
            # Varied completion logic
            if habit.category == "health":
                completed = day_index % 4 != 3
            elif habit.category == "learning":
                completed = current.weekday() < 5 and day_index % 3 != 2
            elif habit.category == "work":
                completed = day_index % 5 != 4
            else:
                completed = day_index % 6 != 5

            notes = ""
            if completed and day_index % 7 == 0:
                notes = "Felt awesome!" if habit.category == "health" else "Great focus!"
            elif not completed:
                notes = "Tired today" if random.random() > 0.5 else "Busy day"

            if completed or notes:
                db.add(
                    Progress(
                        habit_id=habit.id,
                        date=current,
                        completed=1 if completed else 0,
                        notes=notes,
                    )
                )

            current += timedelta(days=1)
            day_index += 1

    db.commit()
    return {"message": "Demo data loaded successfully! Refresh your app."}


# ============ CORE ENDPOINTS ============
@app.post("/habits/", response_model=HabitResponse)
def create_habit(habit: HabitCreate, db: Session = Depends(get_db)):
    db_habit = Habit(**habit.dict())
    db.add(db_habit)
    db.commit()
    db.refresh(db_habit)
    return db_habit

@app.get("/habits/", response_model=List[HabitResponse])
def read_habits(db: Session = Depends(get_db)):
    return db.query(Habit).all()

@app.post("/progress/", response_model=ProgressResponse)
def create_progress(progress: ProgressCreate, db: Session = Depends(get_db)):
    if not db.query(Habit).filter(Habit.id == progress.habit_id).first():
        raise HTTPException(status_code=404, detail="Habit not found")

    existing = db.query(Progress).filter(
        Progress.habit_id == progress.habit_id,
        Progress.date == date.today()
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Progress for today already logged")

    db_progress = Progress(**progress.dict(), date=date.today())
    db.add(db_progress)
    db.commit()
    db.refresh(db_progress)
    return db_progress

@app.get("/progress/{habit_id}", response_model=List[ProgressResponse])
def read_progress(habit_id: int, db: Session = Depends(get_db)):
    progress = db.query(Progress).filter(Progress.habit_id == habit_id).all()
    if not progress:
        raise HTTPException(status_code=404, detail="No progress found")
    return progress

@app.post("/ai/suggest-habits")
def suggest_habits(request: SuggestionRequest, db: Session = Depends(get_db)):
    suggestions = get_habit_suggestions(db, request.target_category, request.num_suggestions)
    return {"suggestions": suggestions}

@app.get("/ai/motivation/{habit_id}")
def get_motivation(habit_id: int, db: Session = Depends(get_db)):
    habit = db.query(Habit).filter(Habit.id == habit_id).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    motivation = get_motivational_quote(db, habit_id)
    return {"habit": habit.name, "motivation": motivation}

@app.get("/analytics/dashboard")
def get_dashboard_analytics(db: Session = Depends(get_db)):
    return {
        "completion_trend": get_completion_trend(db),
        "category_progress": get_category_progress(db),
        "overall_success_rate": round(get_overall_success_rate(db), 2),
        "longest_streak": get_longest_streak(db),
    }

@app.get("/")
def read_root():
    return {"message": "Habit Hero Backend is running! Database ready."}