from typing import List, Dict, Tuple
from sqlalchemy.orm import Session
from datetime import date, timedelta
from models import Habit, Progress

def get_completion_trend(db: Session, days_back: int = 30) -> List[Dict]:
    """
    Line chart data: Habits completed per day (last N days).
    """
    end_date = date.today()
    start_date = end_date - timedelta(days=days_back)
    
    trend = []
    current_date = start_date
    while current_date <= end_date:
        daily_completions = db.query(Progress).filter(
            Progress.date == current_date,
            Progress.completed == 1
        ).count()
        trend.append({
            "date": current_date.isoformat(),
            "completions": daily_completions
        })
        current_date += timedelta(days=1)
    
    return trend

def get_category_progress(db: Session) -> Dict[str, float]:
    """
    Bar chart data: Success rate % per category.
    """
    categories = db.query(Habit.category).distinct().all()
    cat_progress = {}
    
    for cat_tuple in categories:
        category = cat_tuple[0]
        total_entries = db.query(Progress).join(Habit).filter(
            Habit.category == category
        ).count()
        completed_entries = db.query(Progress).join(Habit).filter(
            Habit.category == category,
            Progress.completed == 1
        ).count()
        
        success_rate = (completed_entries / total_entries * 100) if total_entries > 0 else 0
        cat_progress[category] = round(success_rate, 2)
    
    return cat_progress

def get_overall_success_rate(db: Session) -> float:
    """
    Overall %: Completed entries / total entries.
    """
    total_entries = db.query(Progress).count()
    completed_entries = db.query(Progress).filter(Progress.completed == 1).count()
    
    return (completed_entries / total_entries * 100) if total_entries > 0 else 0

def get_longest_streak(db: Session) -> int:
    """
    Overall longest streak across all habits (max per-habit streak).
    Uses calculate_streak from ai_logic (reuse!).
    """
    from ai_logic import calculate_streak  # Reuse existing logic
    habits = db.query(Habit).all()
    max_streak = 0
    
    for habit in habits:
        streak = calculate_streak(db, habit.id)
        if streak > max_streak:
            max_streak = streak
    
    return max_streak
