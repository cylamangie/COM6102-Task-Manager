# 🚀 COM6102 Task Manager

A **real-time collaborative Kanban board** built for **COM6102 Cloud Computing & Distributed Systems**. Supports full CRUD operations, task prioritization, and live synchronization across multiple browser sessions.

## ✨ **Key Features**

- ✅ **Full CRUD Operations**: Create, Read, Update, Delete tasks
- 🎯 **Task Prioritization**: `low` | `medium` | `high` with visual badges
- 🔄 **Real-time Sync**: Socket.IO updates across all connected clients
- 📱 **Kanban Board**: Status columns (`todo` → `in-progress` → `done`)
- 👥 **Multi-user**: Open multiple tabs to test collaboration
- 🐳 **Docker Ready**: PostgreSQL database with docker-compose

## 🏗️ **Tech Stack**

| Frontend | Backend | Database | Realtime |
|----------|---------|----------|----------|
| React 17+ | Node.js + Express | PostgreSQL 15 | Socket.IO |
| Vite | pg (PostgreSQL client) | Docker | CORS |

## 📁 **Project Structure**
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



## 🚀 **Quick Start** *(5 minutes)*

### Prerequisites
- Node.js 18+
- Docker (for PostgreSQL)
- Git

### 1. Clone & Install

```bash
git clone https://github.com/cylamangie/COM6102-Task-Manager.git
cd COM6102-Task-Manager
```

**Backend:**
```bash
cd backend && npm install && cd ..
```

**Frontend:**
```bash
cd frontend && npm install && cd ..
```

### 2. Start Database

```bash
docker-compose up -d
# Verify: docker ps (should see postgres container)
```

### 3. Run Services

**Terminal 1 - Backend (Port 5001):**
```bash
cd backend
node server.js
```
🚀 Backend + Socket.IO running on http://localhost:5001

**Terminal 2 - Frontend (Port 3000):**
```bash
cd frontend
npm run dev
```


## 🎮 **How to Use**

1. Open `http://localhost:3000`
2. **Add Task**: Type title → Select priority → Click "Add Task" 🎯
3. **Update Status**: Use dropdown in task card 🔄
4. **Edit Task**: Click "Edit" button ✏️
5. **Delete Task**: Click "Delete" button 🗑️
6. **Real-time**: Open second browser tab to see live sync! 👥

### Priority Colors
| Priority | Badge Color |
|----------|-------------|
| `low`    | 🟢 Green    |
| `medium` | 🟡 Yellow   |
| `high`   | 🔴 Red      |

## 🔧 **Development Commands** *(Copy & Paste)*

| Action | Command |
|--------|---------|
| Install deps | `npm install` (backend/frontend) |
| Start backend | `cd backend && node server.js` |
| Start frontend | `cd frontend && npm run dev` |
| Database shell | `docker exec -it com6102-task-manager-db-1 psql -U postgres -d taskdb` |
| Stop services | `docker-compose down` |
| View logs | `docker logs com6102-task-manager-db-1` |

## 🐛 **Troubleshooting**

| Issue | Solution |
|-------|----------|
| **Blank page** | Check F12 Console. Ensure backend running on `:5001` |
| **API 500 error** | Check backend terminal. Verify `taskdb` exists |
| **CORS error** | Restart frontend/backend. Check `vite.config.js` proxy |
| **No tasks** | Run `docker exec -it com6102-task-manager-db-1 psql -U postgres -d taskdb` |
| **Port busy** | `lsof -ti:5001` → `kill -9 <PID>` |

## 💾 **Database Schema**

```sql
-- tasks table (with priority enhancement)
CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  board_id INTEGER,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo',
  priority TEXT DEFAULT 'medium',  -- NEW!
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 📱 **API Endpoints**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/boards/:id/tasks` | List tasks |
| `POST` | `/api/boards/:id/tasks` | Create task |
| `PUT` | `/api/tasks/:id` | Update task |
| `DELETE` | `/api/tasks/:id` | Delete task |

## 👥 **Contributors**
- Angie Lam [@cylamangie]
- Jimmy Lo [@immylo102]
- Yuen Sze Hong [@YuenSzeHong]


## 📄 **License**
Academic project for COM6102 Cloud Computing & Distributed Systems
(C) 2026 COM6102 Group Project

---

⭐ **Star this repo if helpful!**  
🐛 **Found a bug?** Open an issue  
🤝 **Want to contribute?** Fork → Branch → PR


