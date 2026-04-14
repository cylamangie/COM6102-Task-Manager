# COM6102 Task Manager

A **real-time collaborative Kanban board** built for **COM6102 Cloud Computing & Distributed Systems**. Supports full CRUD operations, task prioritization, and live synchronization across multiple browser sessions.

## Features

- Full CRUD operations (Create, Read, Update, Delete tasks)
- Task prioritization: `low` / `medium` / `high`
- Real-time sync via Socket.IO across all connected clients
- Kanban board with three columns: `To Do` → `In Progress` → `Done`
- Multi-user collaboration (open multiple tabs to test)
- Docker / Podman ready with PostgreSQL

## Tech Stack

| Layer     | Technology                       |
| --------- | -------------------------------- |
| Frontend  | React 19 + Vite + Tailwind CSS   |
| Backend   | Node.js + Express 5 (TypeScript) |
| Database  | PostgreSQL 18                    |
| Realtime  | Socket.IO                        |
| Container | Docker / Podman Compose          |

## Project Structure

```text
COM6102-Task-Manager/
├── backend/
│   └── src/
│       ├── server.ts            # Entry point, wires everything together
│       ├── db.ts                # PostgreSQL pool + CRUD helpers
│       ├── socket.ts            # Socket.IO event handlers
│       ├── routes/
│       │   ├── auth.ts          # Login route
│       │   └── tasks.ts         # Task CRUD routes + Socket events
│       └── middleware/
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── components/
│   │   └── types.ts
│   └── vite.config.ts
├── db/
│   └── init.sql                 # Database initialization script
├── docker-compose.yml            # Full production stack
├── docker-compose.local-db.yml   # Local dev DB only
├── Dockerfile
├── package.json
└── README.md
```

## Quick Start

### Prerequisites

- Node.js 22+
- Docker (or Podman)
- Git

### 1. Clone & Install

```bash
git clone https://github.com/cylamangie/COM6102-Task-Manager.git
cd COM6102-Task-Manager
npm install
```

### 2. Configure

Copy the example env file and adjust if needed:

```bash
cp .env.example .env
```

Default values work out of the box for local development.

### 3. Choose a Mode

#### Mode A — Local Dev (recommended)

Start a local PostgreSQL container, then run the app with hot-reload:

```bash
# Start local DB
docker compose -f docker-compose.local-db.yml up -d

# Start dev server (Vite HMR + Express API on port 5173)
npm run dev
```

Open <http://localhost:5173>.

When done, tear down the DB:

```bash
docker compose -f docker-compose.local-db.yml down
```

#### Mode B — Full Container Stack

Run everything in containers (no local `npm run dev` needed):

```bash
docker compose -f docker-compose.yml up -d --build
```

Open <http://localhost:3000>.

To stop:

```bash
docker compose -f docker-compose.yml down
```

> **Podman users:** replace `docker compose` with `podman compose` in all commands above.

### 4. Production Build

```bash
npm run build    # Builds frontend + compiles backend
npm run start    # Serves from dist/
```

## Development Commands

| Command                                               | Description                                |
| ----------------------------------------------------- | ------------------------------------------ |
| `npm run dev`                                         | Start dev server with Vite HMR (port 5173) |
| `npm run build`                                       | Build frontend + compile backend           |
| `npm run start`                                       | Run production build                       |
| `docker compose -f docker-compose.local-db.yml up -d` | Start local dev DB                         |
| `docker compose -f docker-compose.local-db.yml down`  | Stop local dev DB                          |
| `docker compose -f docker-compose.yml up -d --build`  | Start full production stack                |
| `docker compose -f docker-compose.yml down`           | Stop full stack                            |

## API Endpoints

| Method   | Endpoint                     | Description                  |
| -------- | ---------------------------- | ---------------------------- |
| `POST`   | `/api/login`                 | Upsert user by username      |
| `GET`    | `/api/boards/:boardId/tasks` | List tasks for a board       |
| `POST`   | `/api/boards/:boardId/tasks` | Create a new task            |
| `PUT`    | `/api/tasks/:id`             | Update task fields (partial) |
| `DELETE` | `/api/tasks/:id`             | Delete a task                |

## Socket.IO Events

| Event         | Payload   | Description                      |
| ------------- | --------- | -------------------------------- |
| `taskCreated` | `Task`    | Broadcast when a task is created |
| `taskUpdated` | `Task`    | Broadcast when a task is updated |
| `taskDeleted` | `taskId`  | Broadcast when a task is deleted |
| `joinBoard`   | `boardId` | Client joins a board room        |

## Troubleshooting

| Issue                    | Solution                                                                     |
| ------------------------ | ---------------------------------------------------------------------------- |
| Port 5432 already in use | Stop the other service or set `LOCAL_DB_PORT=5433` before running compose    |
| App returns 500 errors   | Check DB is running: `docker compose ps`                                     |
| Port 3000 / 5173 in use  | Change `PORT` in `.env` or stop the conflicting process                      |
| Stale DB data            | `docker compose -f docker-compose.local-db.yml down -v` to wipe and recreate |

## Contributors

- Angie Lam [@cylamangie]
- Jimmy Lo [@immylo102]
- Yuen Sze Hong [@YuenSzeHong]

---

Academic project for COM6102 Cloud Computing & Distributed Systems
(C) 2026 COM6102 Group Project
