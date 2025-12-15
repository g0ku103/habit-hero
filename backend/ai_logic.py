from typing import List, Dict
from sqlalchemy.orm import Session
from datetime import date, timedelta
from models import Habit, Progress

# Rule-based suggestions: Category -> List of habit ideas
SUGGESTIONS_DB = {
    "health": [
        "Drink 8 glasses of water",
        "Walk 10,000 steps",
        "Eat a vegetable-rich meal",
        "Meditate 10 minutes",
        "Stretch for 5 minutes"
    ],
    "work": [
        "Complete one priority task",
        "Take a 5-min break hourly",
        "Review emails for 15 mins",
        "Plan tomorrow's to-dos",
        "Network with one contact"
    ],
    "learning": [
        "Read 20 pages of a book",
        "Watch a 10-min tutorial",
        "Practice a new skill 15 mins",
        "Summarize what you learned",
        "Teach someone a concept"
    ],
    "general": [
        "Journal 3 gratitudes",
        "Declutter one drawer",
        "Call a friend",
        "Listen to a podcast",
        "Try a new recipe"
    ]
}

def get_habit_suggestions(db: Session, target_category: str = None, num_suggestions: int = 3) -> List[Dict]:
    """
    Rule-based AI: Suggest habits based on target category or user's existing habits.
    Rules:
    1. If target_category given, suggest from that pool.
    2. Else, infer dominant category from user's habits and suggest complementary.
    3. Avoid duplicates: Don't suggest if user already has similar habit.
    """
    suggestions = []

    if target_category and target_category in SUGGESTIONS_DB:
        # Direct suggestion from category
        pool = SUGGESTIONS_DB[target_category]
    else:
        # Infer from existing habits
        user_habits = db.query(Habit).all()
        if not user_habits:
            # No habits? Suggest general
            pool = SUGGESTIONS_DB["general"]
        else:
            # Find dominant category (most habits)
            category_counts = {}
            for habit in user_habits:
                cat = habit.category
                category_counts[cat] = category_counts.get(cat, 0) + 1
            
            if not category_counts:
                pool = SUGGESTIONS_DB["general"]
            else:
                dominant_cat = max(category_counts, key=category_counts.get)
                # Suggest from same or complementary (e.g., health -> more health)
                pool = SUGGESTIONS_DB.get(dominant_cat, SUGGESTIONS_DB["general"])

    # Filter out existing habits (simple name match)
    existing_names = {h.name.lower() for h in user_habits}
    available = [s for s in pool if s.lower() not in existing_names]

    # Pick top N (or all if less)
    suggestions = [{"name": s, "category": target_category or "inferred"} for s in available[:num_suggestions]]

    return suggestions

# Mood keywords and corresponding quote themes
MOOD_RULES = {
    "positive": ["great", "awesome", "energized", "happy", "motivated"],
    "negative": ["tired", "sad", "frustrated", "exhausted", "down"],
    "neutral": ["okay", "fine", "meh"]
}

# Quote pools by theme
QUOTES_DB = {
    "high_streak": [
        "You're on fire! This streak is building unbreakable habits. 🚀",
        "Legendary consistency—keep owning those days! 💪",
        "5+ days strong? You're transforming your life, one step at a time."
    ],
    "low_streak": [
        "Every day is a fresh start. You've got this—restart stronger! 🌅",
        "One step forward is progress. Build from here. 📈",
        "Streaks come and go; your commitment stays. Let's go again!"
    ],
    "positive_mood": [
        "Ride that wave! Your energy is contagious—keep shining. ✨",
        "Awesome vibes detected. Channel this into even bigger wins!",
        "Feeling great? That's the habit magic working. More of that!"
    ],
    "negative_mood": [
        "It's okay to feel off—tomorrow's a new chance to rise. You've overcome before. ❤️",
        "Tough days build champions. Rest, recharge, and crush tomorrow.",
        "You're stronger than this moment. Small wins add up—start gentle."
    ],
    "neutral_mood": [
        "Steady as she goes. Consistency turns 'okay' into extraordinary. 🛤️",
        "Neutral today? That's room to grow. What's one small win?",
        "Keep showing up—that's the real power. Momentum builds quietly."
    ],
    "general": [
        "Habits shape destiny. You're the architect—design boldly! 🏗️",
        "Progress, not perfection. Celebrate the effort. 🎉",
        "One habit at a time: You're closer than you think."
    ]
}

def calculate_streak(db: Session, habit_id: int) -> int:
    """
    Calculate current streak: Consecutive completed days up to today.
    """
    today = date.today()
    streak = 0
    current_date = today

    while True:
        progress = db.query(Progress).filter(
            Progress.habit_id == habit_id,
            Progress.date == current_date,
            Progress.completed == 1
        ).first()

        if progress:
            streak += 1
            current_date -= timedelta(days=1)
        else:
            break

    return streak

def analyze_mood(notes: str) -> str:
    """
    Simple rule-based mood detection from notes (keyword match).
    """
    if not notes:
        return "neutral"
    notes_lower = notes.lower()
    for mood, keywords in MOOD_RULES.items():
        if any(kw in notes_lower for kw in keywords):
            return mood
    return "neutral"

def get_motivational_quote(db: Session, habit_id: int) -> Dict:
    """
    Rule-based AI: Generate quote based on streak + recent mood.
    Rules:
    1. Streak >5: High-streak quote.
    2. Streak 1-5: Low-streak or general.
    3. Check last 3 notes for mood: Positive/negative/neutral overrides.
    4. Fallback: General.
    """
    streak = calculate_streak(db, habit_id)

    # Get recent progress (last 3 entries) for mood
    recent_progress = db.query(Progress).filter(
        Progress.habit_id == habit_id
    ).order_by(Progress.date.desc()).limit(3).all()

    mood = "neutral"
    for prog in recent_progress:
        if prog.notes:
            detected_mood = analyze_mood(prog.notes)
            if detected_mood != "neutral":
                mood = detected_mood
                break

    # Apply rules
    if streak > 5:
        theme = "high_streak"
    elif mood == "positive":
        theme = "positive_mood"
    elif mood == "negative":
        theme = "negative_mood"
    elif mood == "neutral":
        theme = "neutral_mood"
    else:
        theme = "low_streak" if streak > 0 else "general"

    quote = QUOTES_DB.get(theme, QUOTES_DB["general"])[0]  # Pick first for simplicity
    context = f"Streak: {streak} days | Mood: {mood}"

    return {
        "quote": quote,
        "theme": theme,
        "context": context,
        "rule_applied": f"Based on streak={streak} and mood={mood}"
    }