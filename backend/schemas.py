from pydantic import BaseModel
from datetime import date
from typing import Optional

# For creating a habit
class HabitCreate(BaseModel):
    name: str
    frequency: str = "daily"  # Default
    category: str = "general"
    start_date: date

    class Config:
        from_attributes = True  # Allows ORM models to convert to this

# For reading a habit (response)
class HabitResponse(BaseModel):
    id: int
    name: str
    frequency: str
    category: str
    start_date: date

    class Config:
        from_attributes = True

# For adding progress
class ProgressCreate(BaseModel):
    habit_id: int
    completed: int = 1  # Default to completed
    notes: Optional[str] = None

    class Config:
        from_attributes = True

# For reading progress
class ProgressResponse(BaseModel):
    id: int
    habit_id: int
    date: date
    completed: int
    notes: Optional[str]

    class Config:
        from_attributes = True

class HabitWithStatsResponse(BaseModel):
    id: int
    name: str
    frequency: str
    category: str
    start_date: date
    current_streak: int
    success_rate: float
    completed_today: bool

    class Config:
        from_attributes = True
