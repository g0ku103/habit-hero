# 🧠 Habit Hero – Full Stack Habit Tracking Application

## 📌 Overview

**Habit Hero** is a full-stack habit tracking web application designed to help users build consistency, track progress, and stay motivated.  
It provides habit management, performance analytics, AI-assisted suggestions, mood-based motivational feedback, and visual insights such as heatmaps and charts.

This project demonstrates:
- Clean and responsive frontend design  
- Well-structured backend APIs  
- Thoughtful integration of analytics and AI-inspired logic using modern technologies  

---

## 🚀 Features

### ✅ Core Features
- Create, view, and delete habits  
- Daily habit completion tracking  
- Automatic streak calculation and success rate  
- Date-based habit editing (past & future)  
- Duplicate habit prevention  
- Category-based habit organization  

---

### 📊 Analytics Dashboard
- Overall success rate  
- Longest streak tracking  
- Category-wise performance analysis  
- Completion trend (Line Chart)  
- Success rate comparison (Bar Chart)  
- GitHub-style activity heatmap  

---

### 🤖 AI Features
- AI-generated habit suggestions  
- Mood detection from user notes  
- Personalized motivational quotes based on detected mood  

---

### 📝 Notes & Mood Tracking
- Optional notes while marking habits as completed  
- Mood inferred from notes using rule-based NLP  
- Motivation adapts dynamically to emotional context  

---

### 🎨 UI / UX
- Clean, modern, and responsive UI  
- Disabled actions for already completed habits  
- Visual state changes (completed vs pending)  
- Minimal, aesthetic card-based layout  

---

## 🛠️ Tech Stack

### Frontend
- React.js  
- Chart.js  
- React Toastify  
- CSS (inline styling)  

### Backend
- FastAPI  
- SQLAlchemy  
- SQLite (local development)  
- Rule-based NLP (mood detection)  

### AI / Logic
- Keyword-based mood analysis  
- Rule-based motivational quote selection  
- AI habit suggestion logic  

---


---

## ⚙️ Setup Instructions

### 1️⃣ Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload 

##Backend Run At : http://127.0.0.1:8000

---

Fronte End Setup

cd frontend
npm install
npm start

Frontend Runs at : http://localhost:3000

```

## API Endpoints (Summary)

### Habits
- GET /habits/?selected_date=YYYY-MM-DD
- POST /habits/
- DELETE /habits/{habit_id}

### Progress
- POST /progress/

### Analytics
- GET /analytics/dashboard
- GET /analytics/heatmap

###AI
- POST /ai/suggest-habits
- GET /ai/motivation/{habit_id}

# # 👤 Author
### Gokul S Babu
#### Full Stack / AI Enthusiast



