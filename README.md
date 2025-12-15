🧠 Overview

Habit Hero is a full-stack habit tracking web application designed to help users build consistency, track progress, and stay motivated.
It provides habit management, performance analytics, AI-assisted suggestions, mood-based motivational feedback, and visual insights like heatmaps and charts.

The project demonstrates clean frontend design, structured backend APIs, and thoughtful feature integration using modern technologies.

🚀 Features
✅ Core Features

Create, view, and delete habits

Daily habit completion tracking

Streak calculation & success rate

Date-based habit editing (past/future)

Duplicate habit prevention

Category-based organization

📊 Analytics Dashboard

Overall success rate

Longest streak tracking

Category-wise performance

Completion trend (Line chart)

Success rate comparison (Bar chart)

GitHub-style activity heatmap

🤖 AI Features

AI-generated habit suggestions

Mood detection from user notes

Personalized motivational quotes based on detected mood

📝 Notes & Mood Tracking

Optional notes while marking habits

Mood inferred from notes (rule-based NLP)

Motivation adapts to emotional context

🎨 UI / UX

Clean, modern, responsive UI

Disabled actions for completed habits

Visual state changes (completed, pending)

Minimal, aesthetic card-based layout

🛠️ Tech Stack
Frontend

React.js

Chart.js

React Toastify

CSS (inline styling)

Backend

FastAPI

SQLAlchemy

SQLite (local development)

Rule-based NLP (mood detection)

AI / Logic

Keyword-based mood analysis

Rule-based motivational quote selection

AI habit suggestion logic

Project Structure

habit-hero/
│
├── backend/

│   ├── main.py

│   ├── ai_logic.py

│   ├── models.py

│   ├── schemas.py

│   └── database.py
│
|
|
|
├── frontend/

│   ├── src/

│   │   ├── components/

│   │   │   ├── HabitList.jsx

│   │   │   ├── HabitForm.jsx

│   │   │   ├── HabitHeatmap.jsx

│   │   │   └── Dashboard.jsx

│   │   ├── api.js

│   │   └── App.js

│

└── README.md

Backend Setup

cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload

Backend Runs at: 
http://127.0.0.1:8000

Frontend Setup

cd frontend
npm install
npm start

Frontend runs at: 
http://localhost:3000

🔌 API Endpoints (Summary)
Habits

GET /habits/?selected_date=YYYY-MM-DD

POST /habits/

DELETE /habits/{habit_id}

Progress

POST /progress/

Analytics

GET /analytics/dashboard

GET /analytics/heatmap

AI

POST /ai/suggest-habits

GET /ai/motivation/{habit_id}

🧠 AI Logic Explained
Mood Detection

User notes are analyzed using predefined keyword rules to detect moods such as:

Happy

Tired

Stressed

Motivated

Neutral

Motivation Engine

Based on detected mood:

Encouraging quotes for tired/stressed users

Reinforcement quotes for positive moods

Neutral motivation when no notes are provided

This approach avoids heavy ML dependencies while remaining explainable and efficient.

📈 Heatmap Logic

Shows daily habit completion count

Color intensity represents activity level

Inspired by GitHub contribution heatmap

Helps visualize long-term consistency

👤 Author

Gokul S Babu
Full Stack / AI Enthusiast
Project built as part of a technical hiring assignment.
