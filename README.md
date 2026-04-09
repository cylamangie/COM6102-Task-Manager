# COM6102 Task Manager

A real-time collaborative task manager built for the COM6102 project.  
This project uses a React frontend, Express/Node.js backend, PostgreSQL database, and Socket.IO for real-time task updates. [cite:480]

## Features

- Create a new task. [cite:480]
- View tasks by status in a Kanban-style board. [cite:480]
- Update task title. [cite:480]
- Update task status (`todo`, `in-progress`, `done`). [cite:480]
- Delete tasks. [cite:480]
- Set task priority (`low`, `medium`, `high`). [cite:480]
- Real-time task sync across browser tabs using Socket.IO. [cite:480]

## Tech Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: PostgreSQL
- Realtime: Socket.IO
- Version Control: Git + GitHub

## Project Structure

```bash
COM6102-Task-Manager/
├── backend/
│   ├── server.js
│   ├── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   ├── package.json
│   ├── vite.config.js
├── db/
│   ├── init.sql
├── docker-compose.yml
├── README.md
```

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/COM6102-Task-Manager.git
cd COM6102-Task-Manager
```

### 2. Install dependencies

Backend:
```bash
cd backend
npm install
```

Frontend:
```bash
cd ../frontend
npm install
```

### 3. Start PostgreSQL

If using Docker Compose:

```bash
docker-compose up -d
```

Check running containers:

```bash
docker ps
```

## Run the Project

### Start backend

Open a terminal:

```bash
cd backend
node server.js
```

Expected backend server:
```bash
http://localhost:5001
```

### Start frontend

Open another terminal:

```bash
cd frontend
npm run dev
```

Expected frontend app:
```bash
http://localhost:3000
```

## How to Use

1. Open the frontend in the browser.
2. Add a new task using the input box.
3. Select task priority when creating a task.
4. Change task status using the dropdown in each task card.
5. Edit or delete tasks using the buttons.
6. Open another browser tab to test real-time sync.

## Common Commands

### Check Git status
```bash
git status
```

### Start backend
```bash
cd backend
node server.js
```

### Start frontend
```bash
cd frontend
npm run dev
```

### Start database with Docker
```bash
docker-compose up -d
```

### Stop Docker containers
```bash
docker-compose down
```

### View database container
```bash
docker ps
```

### Connect to PostgreSQL
```bash
docker exec -it com6102-task-manager-db-1 psql -U postgres -d taskdb
```

## Database Notes

The `tasks` table includes a `priority` column with default value `medium`.

Example SQL used:

```sql
ALTER TABLE tasks ADD COLUMN priority TEXT DEFAULT 'medium';
```

## Troubleshooting

### Blank page in frontend
- Check browser console for errors.
- Make sure backend is running on port `5001`.
- Make sure frontend is running on port `3000`.
- Check `vite.config.js` proxy settings.

### API returns 500 error
- Check backend terminal logs.
- Confirm PostgreSQL is running.
- Confirm the `taskdb` database exists.
- Confirm the `tasks` table includes the required columns.

### Socket.IO or CORS issues
- Make sure backend CORS allows the frontend origin.
- Restart both frontend and backend after config changes.

## Contributors

- Angie
- Group members

## License

This project is for academic use in COM6102.
