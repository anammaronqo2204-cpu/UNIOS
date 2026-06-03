# UniOS — AI Learning Operating System

> Universities give content — UniOS gives understanding.

UniOS is an all-in-one AI Learning Operating System that replaces 5–10 fragmented tools. Upload any lecture, PDF, textbook, or voice note — and instantly get a personal AI tutor, study planner, exam coach, and smart notes workspace.

## Features

- 🎓 **AI Tutor** — Breaks topics into lessons, adapts difficulty, checks understanding
- 🧾 **Upload Anything** — PDFs, slides, handwritten notes, voice notes → summaries, flashcards, quizzes
- 🎧 **Lecture Transcription** — Records, transcribes, organizes, highlights
- ✍️ **Smart Notes** — AI-enhanced note workspace
- 🗓️ **Study Planner** — AI-generated schedules, catch-up plans
- 🧪 **Exam Mode** — Generated past papers, timed mocks, weakness detection
- 🧠 **Unified AI Brain** — Routes to best model for each task
- 👥 **Study Companion** — AI-moderated group study

## Tech Stack

| Layer | Technology |
|-------|----------|
| **Frontend** | React 18 / Vite / TypeScript / Tailwind CSS |
| **Backend** | Express.js / TypeScript / Knex.js |
| **Database** | SQLite (dev) / Turso (production) |
| **Auth** | JWT + bcrypt |
| **AI** | Multi-model routing (OpenAI, Google AI, Anthropic) |
| **Vector DB** | Pinecone |
| **CI/CD** | GitHub Actions |

## Quick Start

```bash
# Install dependencies
cd frontend && npm install
cd ../backend && npm install

# Setup environment
cp .env.example .env
# Fill in your API keys

# Run migrations
cd ../backend && npx knex migrate:latest

# Seed demo data
npx knex seed:run

# Start development
cd .. && npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- Health check: http://localhost:3001/api/v1/health

## Demo Account

- **Email:** demo@unios.app
- **Password:** password123

## Project Structure

```
UniOS/
├── frontend/          # React SPA
│   ├── src/
│   │   ├── api/       # API client
│   │   ├── components/# UI components
│   │   ├── pages/     # Route pages
│   │   └── store/     # State management
├── backend/           # Express API
│   ├── src/
│   │   ├── routes/    # API routes
│   │   ├── services/  # Business logic
│   │   └── db/        # Migrations & seeds
└── shared/            # Shared TypeScript types
```

## API Documentation

See [tech-architecture.md](../tech-architecture.md) for full API spec.

## License

Private — UniOS Inc.