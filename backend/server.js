const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { 
    origin: ["http://localhost:3000", "http://localhost:5173"], 
    methods: ["GET", "POST", "PUT", "DELETE"] 
  }
});

app.use(cors({ 
  origin: ["http://localhost:3000", "http://localhost:5173"], 
  credentials: true 
}));
app.use(express.json());

// Postgres pool
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'taskdb',
  password: 'password',
  port: 5432,
});

// Auth (MVP)
app.post('/api/login', async (req, res) => {
  const { username } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO users (username) VALUES ($1) ON CONFLICT (username) DO UPDATE SET username = $1 RETURNING id, username',
      [username]
    );
    res.json({ userId: rows[0].id, username: rows[0].username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get tasks
app.get('/api/boards/:boardId/tasks', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM tasks WHERE board_id = $1 OR board_id IS NULL ORDER BY updated_at DESC`,
      [req.params.boardId]
    );
    res.json(rows);
  } catch (err) {
    console.error('GET tasks error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create task
app.post('/api/boards/:boardId/tasks', async (req, res) => {
  try {
    const { title, description, status, priority } = req.body;

    const { rows } = await pool.query(
      `INSERT INTO tasks (board_id, title, description, status, priority)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        req.params.boardId,
        title,
        description || '',
        status || 'todo',
        priority || 'medium',
      ]
    );

    const newTask = rows[0];

    // Real-time broadcast!
    io.emit('taskCreated', newTask);

    res.json(newTask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete task
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'DELETE FROM tasks WHERE id = $1 RETURNING *',
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const deletedTask = rows[0];

    // Real-time broadcast
    io.emit('taskDeleted', deletedTask.id);

    res.json({ message: 'Task deleted successfully', task: deletedTask });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update task
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { title, status, priority, description } = req.body;

    const { rows } = await pool.query(
      `UPDATE tasks
       SET
         title = COALESCE($1, title),
         status = COALESCE($2, status),
         priority = COALESCE($3, priority),
         description = COALESCE($4, description),
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $5
       RETURNING *`,
      [title, status, priority, description, req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const updatedTask = rows[0];

    io.emit('taskUpdated', updatedTask);

    res.json(updatedTask);
  } catch (err) {
    console.error('Update task error:', err);
    res.status(500).json({ error: err.message });
  }
});

// WebSocket
io.on('connection', (socket) => {
  console.log('👤 User connected:', socket.id);

  socket.on('joinBoard', (boardId) => {
    socket.join(`board-${boardId}`);
    console.log(`User ${socket.id} joined board ${boardId}`);
  });

  socket.on('disconnect', () => {
    console.log('👋 User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`🚀 Backend + Socket.io running on http://localhost:${PORT}`);
});