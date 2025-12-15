import random  # Add at top imports
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date, timedelta
from typing import List, Dict, Any, Optional

from database import get_db
from models import Habit, Progress
from schemas import (
    HabitCreate,
    HabitResponse,
    HabitWithStatsResponse,   # ✅ ADD THIS
    ProgressCreate,
    ProgressResponse
)
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
@app.post("/seed-demo-data")
def seed_demo_data(db: Session = Depends(get_db)):
    # Prevent duplicate demo seeding
    if db.query(Habit).count() >= 10:
        return {"message": "Sufficient data already exists"}

    random.seed(42)

    habits_data = [
        {"name": "Morning Run", "category": "health"},
        {"name": "Meditate 10 Minutes", "category": "health"},
        {"name": "Drink 8 Glasses of Water", "category": "health"},
        {"name": "Stretching / Mobility", "category": "health"},

        {"name": "Read 30 Pages", "category": "learning"},
        {"name": "Practice Coding", "category": "learning"},
        {"name": "Watch Educational Video", "category": "learning"},

        {"name": "Deep Work Session", "category": "work"},
        {"name": "Review Daily Tasks", "category": "work"},
        {"name": "Plan Tomorrow", "category": "work"},

        {"name": "Journal Gratitude", "category": "general"},
        {"name": "Call or Text a Friend", "category": "general"},
    ]

    today = date.today()
    end_date = today - timedelta(days=1)  # ❗ yesterday only

    habits = []

    # Create habits
    for h in habits_data:
        start_date = end_date - timedelta(days=random.randint(30, 60))

        habit = Habit(
            name=h["name"],
            frequency="daily",
            category=h["category"],
            start_date=start_date,
        )
        db.add(habit)
        habits.append(habit)

    db.commit()

    # Category realism
    category_base_rate = {
        "health": 0.82,
        "learning": 0.74,
        "work": 0.78,
        "general": 0.70,
    }

    motivational_notes = [
        "Felt great!",
        "Very productive",
        "Good focus today",
        "Energy was high",
        "Happy with progress",
    ]

    struggle_notes = [
        "Busy day",
        "Low energy",
        "Missed due to work",
        "Not feeling well",
        "Will try tomorrow",
    ]

    # Create past progress
    for habit in habits:
        current = habit.start_date
        base_rate = category_base_rate[habit.category]

        while current <= end_date:
            completed = random.random() < base_rate

            notes = ""
            if completed and random.random() < 0.25:
                notes = random.choice(motivational_notes)
            elif not completed and random.random() < 0.20:
                notes = random.choice(struggle_notes)

            # Save only meaningful entries
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

    db.commit()

    return {
        "message": "Demo data seeded: 12 habits with 30–60 days of realistic past progress"
    }

from analytics import get_heatmap_data

@app.get("/analytics/heatmap")
def heatmap(db: Session = Depends(get_db)):
    return get_heatmap_data(db)



# ============ CORE ENDPOINTS ============
@app.post("/habits/", response_model=HabitResponse)
def create_habit(habit: HabitCreate, db: Session = Depends(get_db)):
    # ✅ Prevent duplicates (case-insensitive)
    existing = db.query(Habit).filter(
        Habit.name.ilike(habit.name),
        Habit.category.ilike(habit.category)
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Habit already exists in this category"
        )

    db_habit = Habit(**habit.dict())
    db.add(db_habit)
    db.commit()
    db.refresh(db_habit)
    return db_habit


from ai_logic import calculate_streak
from datetime import date

from fastapi import Query
from datetime import date
from ai_logic import calculate_streak

@app.get("/habits/", response_model=List[HabitWithStatsResponse])
def read_habits(
    selected_date: date = Query(default=date.today()),
    db: Session = Depends(get_db)
):
    habits = db.query(Habit).all()
    response = []

    for habit in habits:
        total = db.query(Progress).filter(
            Progress.habit_id == habit.id
        ).count()

        completed = db.query(Progress).filter(
            Progress.habit_id == habit.id,
            Progress.completed == 1
        ).count()

        success_rate = round((completed / total) * 100, 2) if total > 0 else 0

        completed_on_date = db.query(Progress).filter(
            Progress.habit_id == habit.id,
            Progress.date == selected_date,
            Progress.completed == 1
        ).first() is not None

        response.append({
            "id": habit.id,
            "name": habit.name,
            "frequency": habit.frequency,
            "category": habit.category,
            "start_date": habit.start_date,
            "current_streak": calculate_streak(db, habit.id),
            "success_rate": success_rate,
            "completed_today": completed_on_date   # ← dynamic now
        })

    return response


@app.get("/progress/by-date/{habit_id}")
def get_progress_by_date(
    habit_id: int,
    target_date: date,
    db: Session = Depends(get_db)
):
    progress = db.query(Progress).filter(
        Progress.habit_id == habit_id,
        Progress.date == target_date
    ).first()

    return {
        "habit_id": habit_id,
        "date": target_date,
        "completed": progress.completed if progress else 0,
        "notes": progress.notes if progress else ""
    }

@app.put("/progress/")
def update_progress(
    habit_id: int,
    target_date: date,
    completed: int = 1,
    notes: str = "",
    db: Session = Depends(get_db)
):
    entry = db.query(Progress).filter(
        Progress.habit_id == habit_id,
        Progress.date == target_date
    ).first()

    if entry:
        entry.completed = completed
        entry.notes = notes
    else:
        db.add(Progress(
            habit_id=habit_id,
            date=target_date,
            completed=completed,
            notes=notes
        ))

    db.commit()
    return {"message": "Progress updated"}


@app.post("/progress/", response_model=ProgressResponse)
def create_progress(progress: ProgressCreate, db: Session = Depends(get_db)):
    habit = db.query(Habit).filter(Habit.id == progress.habit_id).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")

    today = date.today()

    # ❗ Block future-dated progress
    existing = db.query(Progress).filter(
        Progress.habit_id == progress.habit_id,
        Progress.date == today
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Progress already logged for today"
        )

    db_progress = Progress(
        habit_id=progress.habit_id,
        completed=progress.completed,
        notes=progress.notes,
        date=today
    )

    db.add(db_progress)
    db.commit()
    db.refresh(db_progress)
    return db_progress

@app.delete("/habits/{habit_id}")
def delete_habit(habit_id: int, db: Session = Depends(get_db)):
    habit = db.query(Habit).filter(Habit.id == habit_id).first()

    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")

    # Delete related progress first
    db.query(Progress).filter(
        Progress.habit_id == habit_id
    ).delete()

    db.delete(habit)
    db.commit()

    return {"message": "Habit deleted successfully"}



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
    return get_motivational_quote(db, habit_id)

@app.get("/analytics/dashboard")
def get_dashboard_analytics(db: Session = Depends(get_db)):
    return {
        "completion_trend": get_completion_trend(db),
        "category_progress": get_category_progress(db),
        "overall_success_rate": round(get_overall_success_rate(db), 2),
        "longest_streak": get_longest_streak(db),
    }

@app.get("/analytics/heatmap/{habit_id}")
def habit_heatmap(habit_id: int, db: Session = Depends(get_db)):
    data = db.query(Progress).filter(
        Progress.habit_id == habit_id
    ).all()

    return {
        p.date.isoformat(): p.completed for p in data
    }



@app.get("/")
def read_root():
    return {"message": "Habit Hero Backend is running! Database ready."}