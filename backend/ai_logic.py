from typing import List, Dict
from sqlalchemy.orm import Session
from datetime import date, timedelta
from models import Habit, Progress

# =========================
# HABIT SUGGESTIONS
# =========================

SUGGESTIONS_DB = {
    "health": [
        "Drink 8 glasses of water",
        "Walk 10,000 steps",
        "Meditate 10 minutes",
        "Stretch for 5 minutes",
        "Sleep before 11 PM"
    ],
    "work": [
        "Plan tomorrow’s tasks",
        "Deep work for 45 minutes",
        "Review priorities",
        "Clean workspace",
        "Send follow-up emails"
    ],
    "learning": [
        "Read 20 pages",
        "Practice a new skill",
        "Watch a tutorial",
        "Write learning notes",
        "Revise yesterday’s topic"
    ],
    "general": [
        "Journal gratitude",
        "Call a friend",
        "Declutter space",
        "Listen to a podcast",
        "Reflect on the day"
    ]
}


def get_habit_suggestions(
    db: Session,
    target_category: str = None,
    num_suggestions: int = 3
) -> List[Dict]:

    user_habits = db.query(Habit).all()
    existing = {h.name.lower() for h in user_habits}

    if target_category and target_category in SUGGESTIONS_DB:
        pool = SUGGESTIONS_DB[target_category]
        category = target_category
    else:
        pool = SUGGESTIONS_DB["general"]
        category = "general"

    suggestions = []
    for habit in pool:
        if habit.lower() not in existing:
            suggestions.append({
                "name": habit,
                "category": category
            })
        if len(suggestions) == num_suggestions:
            break

    return suggestions


# =========================
# MOOD & MOTIVATION LOGIC
# =========================

# ✅ THIS WAS MISSING / OUT OF SCOPE BEFORE
MOOD_RULES = {
    "positive": ["great", "awesome", "energized", "happy", "motivated"],
    "negative": ["tired", "sad", "frustrated", "exhausted", "down"],
    "neutral": ["okay", "fine", "meh"]
}

QUOTES_DB = {
    "high_streak": [
        "You're on fire! Keep the momentum going 🚀"
    ],
    "positive_mood": [
        "That positive energy is your superpower ✨"
    ],
    "negative_mood": [
        "Even tough days build strong habits. Be kind to yourself ❤️"
    ],
    "neutral_mood": [
        "Consistency beats intensity. Just keep showing up."
    ],
    "general": [
        "Small habits create big change."
    ]
}


def calculate_streak(db: Session, habit_id: int) -> int:
    today = date.today()
    streak = 0
    current = today

    while True:
        entry = db.query(Progress).filter(
            Progress.habit_id == habit_id,
            Progress.date == current,
            Progress.completed == 1
        ).first()

        if entry:
            streak += 1
            current -= timedelta(days=1)
        else:
            break

    return streak


def analyze_mood(notes: str) -> str:
    if not notes:
        return "neutral"

    notes = notes.lower()
    for mood, keywords in MOOD_RULES.items():
        if any(word in notes for word in keywords):
            return mood

    return "neutral"


def get_motivational_quote(db: Session, habit_id: int) -> Dict:
    streak = calculate_streak(db, habit_id)

    recent = db.query(Progress).filter(
        Progress.habit_id == habit_id
    ).order_by(Progress.date.desc()).limit(3).all()

    mood = "neutral"
    for p in recent:
        if p.notes:
            mood = analyze_mood(p.notes)
            break

    if streak >= 5:
        theme = "high_streak"
    elif mood == "positive":
        theme = "positive_mood"
    elif mood == "negative":
        theme = "negative_mood"
    else:
        theme = "neutral_mood"

    quote = QUOTES_DB.get(theme, QUOTES_DB["general"])[0]

    return {
        "quote": quote,
        "theme": theme,
        "context": f"Streak: {streak} days | Mood: {mood}"
    }
