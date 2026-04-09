-- Create tables for collaborative task manager
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert demo user
INSERT INTO users (username) VALUES ('demo-user') ON CONFLICT DO NOTHING;

CREATE TABLE boards (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  owner_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert demo board
INSERT INTO boards (name, owner_id) VALUES ('Team Demo Board', 1) ON CONFLICT DO NOTHING;

CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  board_id INTEGER REFERENCES boards(id),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'todo',
  priority TEXT DEFAULT 'medium',
  assigned_to INTEGER REFERENCES users(id),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
