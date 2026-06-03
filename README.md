# Indoor Club Leaderboard System

A real-time indoor club leaderboard built with **Django DRF + Django Channels** (backend) and **React + Vite** (frontend).

## Stack

| Layer | Technology |
|-------|-----------|
| Backend | Django 5, DRF, Django Channels, Daphne |
| Real-time | WebSockets via Django Channels |
| Database | SQLite (dev) → PostgreSQL (prod) |
| Frontend | React 18, Vite, TailwindCSS, Axios, React Router |

## Quick Start

### Backend

```bash
cd backend
python -m venv ../venv          # already created at repo root
source ../venv/bin/activate
pip install -r requirements.txt
cp .env.example .env            # fill in secrets
python manage.py migrate
python manage.py createsuperuser
daphne config.asgi:application
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Timezone

All timestamps are stored and displayed in **Asia/Manila (UTC+8)**.

## Architecture

Modular monolith with WebSocket consumers per domain:

```
notifications → broadcasts leaderboard, match, sidequest events
matches       → match-specific real-time feed
sidequests    → sidequest-specific real-time feed
```
