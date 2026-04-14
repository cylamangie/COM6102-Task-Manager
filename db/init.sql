-- Create tables for collaborative task manager
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert demo user
INSERT INTO users (username) VALUES ('demo-user') ON CONFLICT DO NOTHING;

CREATE TABLE IF NOT EXISTS boards (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  owner_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert demo board
INSERT INTO boards (name, owner_id)
SELECT 'Team Demo Board', u.id
FROM users u
WHERE u.username = 'demo-user'
  AND NOT EXISTS (
    SELECT 1
    FROM boards b
    WHERE b.name = 'Team Demo Board'
      AND b.owner_id = u.id
  );

CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  board_id INTEGER REFERENCES boards(id),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'todo',
  priority TEXT DEFAULT 'medium',
  assigned_to INTEGER REFERENCES users(id),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
