from sqlalchemy import Column, Integer, String, Date, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import date

Base = declarative_base()

class Habit(Base):
    __tablename__ = "habits"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)  # e.g., "Run 5km"
    frequency = Column(String, default="daily")  # "daily", "weekly", etc.
    category = Column(String, default="general")  # "health", "work", "learning"
    start_date = Column(Date)  # When the habit starts

    # Relationship: One habit has many progress entries
    progress_entries = relationship("Progress", back_populates="habit")

class Progress(Base):
    __tablename__ = "progress"

    id = Column(Integer, primary_key=True, index=True)
    habit_id = Column(Integer, ForeignKey("habits.id"))
    date = Column(Date, default=date.today)  # Date of the entry
    completed = Column(Integer, default=0)  # 1 if completed, 0 if not
    notes = Column(Text, nullable=True)  # Optional notes/mood

    # Relationship: Back to the habit
    habit = relationship("Habit", back_populates="progress_entries")