# AIRA Web Application 🧠💜

> **Full-stack mental wellness web app** — React frontend + FastAPI backend + MongoDB

---

## 🏗️ Architecture

```
AIRA_Web/
├── frontend/          ← React + Vite app
│   ├── src/
│   │   ├── pages/     ← Login, Register, Home, Chat, Journal, etc.
│   │   ├── components/ ← Sidebar, Layout
│   │   ├── context/   ← Auth context
│   │   └── services/  ← Axios API layer
│   └── package.json
│
├── backend/           ← FastAPI Python app
│   ├── main.py        ← App entry point + CORS
│   ├── database.py    ← MongoDB (Motor async)
│   ├── config.py      ← Settings (pydantic)
│   ├── routes/        ← auth, chat, user, sentiment, reminders, visionboard
│   └── services/      ← AI (LangChain+Groq), sentiment (Afinn), auth (JWT)
│
└── docker-compose.yml ← Run everything with one command
```

---

## ⚡ Quick Start

### Option A — Docker (Easiest)

```bash
# 1. Clone and enter directory
cd AIRA_Web

# 2. Create .env file
cp backend/.env.example backend/.env
# Edit backend/.env with your GROQ_API_KEY

# 3. Generate a Fernet key
python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
# Paste it into backend/.env as FERNET_KEY

# 4. Start everything
docker-compose up --build

# App runs at http://localhost:3000
# API docs at http://localhost:8000/docs
```

---

### Option B — Manual Setup (Recommended for Development)

#### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- MongoDB (local or Atlas)

---

## 🔧 Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate       # Mac/Linux
# venv\Scripts\activate        # Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your values (see below)

# Run the backend
uvicorn main:app --reload --port 8000
```

### Backend `.env` values

| Key | Where to get it |
|-----|----------------|
| `MONGO_URI` | [MongoDB Atlas](https://cloud.mongodb.com) — free tier works great |
| `SECRET_KEY` | Any long random string (use: `python3 -c "import secrets; print(secrets.token_hex(32))"`) |
| `GROQ_API_KEY` | [console.groq.com](https://console.groq.com) — free tier, very fast |
| `FERNET_KEY` | `python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"` |

---

## 🎨 Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# For local dev, default values work (Vite proxies /api to localhost:8000)

# Start dev server
npm run dev
```

Frontend runs at **http://localhost:3000**

---

## 📱 Pages & Features

| Page | Route | Description |
|------|-------|-------------|
| Login | `/login` | Email/password auth |
| Register | `/register` | New account creation |
| Intro | `/intro` | First-run onboarding chat |
| Home | `/` | Dashboard + motivation |
| Chat | `/chat/:id` | Real-time AI conversation |
| Journal | `/journal` | Auto-saved chat history |
| Mental Growth | `/growth` | Wellness score chart |
| Vision Board | `/vision` | Goal tracking grid |
| My Story | `/story` | AI-generated narrative |
| Reminders | `/reminders` | Daily nudge management |
| Profile | `/profile` | User settings |

---

## 🔌 API Reference

All routes are prefixed with `/api`

### Auth
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
POST /api/auth/reset-password
```

### Chat
```
POST /api/chat/start_intro
POST /api/chat/new_session
POST /api/chat/send
GET  /api/chat/sessions
GET  /api/chat/history?session_id=<id>
```

### User
```
GET  /api/user/profile
PUT  /api/user/update
POST /api/user/send_motivation
POST /api/user/generate_story
```

### Sentiment, Reminders, Vision Board
```
GET  /api/sentiment/get_sentiments
POST /api/sentiment/analyze
GET  /api/reminder/get_all_reminders
POST /api/reminder/add_reminder
PUT  /api/reminder/update_reminder
DELETE /api/reminder/delete_reminder
GET  /api/visionboard/get_goals
POST /api/visionboard/add_custom_goal
POST /api/feedback/submitL
```

Interactive docs: **http://localhost:8000/docs**

---

## 🗄️ Database (MongoDB Collections)

| Collection | Purpose |
|------------|---------|
| `users` | Auth + profile + flags |
| `chat_history` | Session messages + feedback |
| `sentiment_collection` | Daily wellness scores |
| `reminders` | Scheduled nudges |
| `vision_board` | User goals |
| `aira_brain` | Long-term memory |

---

## 🚀 Deployment

### Frontend → Vercel
```bash
cd frontend
npm run build
# Push to GitHub, connect to Vercel
# Set VITE_API_URL=https://your-backend.com/api
```

### Backend → Railway / Render
1. Connect GitHub repo
2. Set all env variables in the dashboard
3. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Database → MongoDB Atlas
- Free 512MB cluster is sufficient for development
- Create a free account at [cloud.mongodb.com](https://cloud.mongodb.com)

---

## 🧑‍💻 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router, Axios, Recharts, Framer Motion |
| Backend | FastAPI, Uvicorn, Pydantic |
| AI | LangChain, Groq (LLaMA 3 8B), FAISS, HuggingFace Embeddings |
| NLP | Afinn (sentiment), NLTK |
| Database | MongoDB (Motor async driver) |
| Auth | JWT (python-jose), bcrypt |
| Encryption | cryptography.fernet |
| DevOps | Docker, Docker Compose |

---

*AIRA — Adaptive, Interactive, and Responsive Assistant*  

