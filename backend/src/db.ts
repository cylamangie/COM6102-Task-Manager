import { Pool } from 'pg';

export const pool = new Pool({
    user: process.env.DB_USER ?? 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    database: process.env.DB_NAME ?? 'taskdb',
    password: process.env.DB_PASSWORD ?? 'password',
    port: Number(process.env.DB_PORT ?? 5432)
});

export async function checkConnection(): Promise<void> {
    await pool.query('SELECT 1');
}

export interface Task {
    id: number;
    board_id: number | null;
    title: string;
    description: string;
    status: string;
    priority: string;
    updated_at: string;
}

export interface User {
    id: number;
    username: string;
}

export const db = {
    async getTasksByBoardId(boardId: number): Promise<Task[]> {
        const { rows } = await pool.query<Task>(
            `SELECT * FROM tasks WHERE board_id = $1 ORDER BY updated_at DESC`,
            [boardId]
        );
        return rows;
    },

    async createTask(boardId: number, title: string, description: string, status: string, priority: string): Promise<Task> {
        const { rows } = await pool.query<Task>(
            `INSERT INTO tasks (board_id, title, description, status, priority)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [boardId, title, description, status, priority]
        );
        return rows[0];
    },

    async getTaskById(id: number): Promise<Task | null> {
        const { rows } = await pool.query<Task>(
            `SELECT * FROM tasks WHERE id = $1`,
            [id]
        );
        return rows[0] ?? null;
    },

    async updateTask(id: number, fields: Partial<Pick<Task, 'title' | 'description' | 'status' | 'priority'>>): Promise<Task | null> {
        const updates: string[] = [];
        const values: (string | number)[] = [];
        let paramIndex = 1;

        if (fields.title !== undefined) {
            updates.push(`title = $${paramIndex++}`);
            values.push(fields.title);
        }
        if (fields.description !== undefined) {
            updates.push(`description = $${paramIndex++}`);
            values.push(fields.description);
        }
        if (fields.status !== undefined) {
            updates.push(`status = $${paramIndex++}`);
            values.push(fields.status);
        }
        if (fields.priority !== undefined) {
            updates.push(`priority = $${paramIndex++}`);
            values.push(fields.priority);
        }

        if (updates.length === 0) {
            return null;
        }

        updates.push(`updated_at = NOW()`);
        values.push(id);

        const { rows } = await pool.query<Task>(
            `UPDATE tasks SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
            values
        );
        return rows[0] ?? null;
    },

    async deleteTask(id: number): Promise<Task | null> {
        const { rows } = await pool.query<Task>(
            `DELETE FROM tasks WHERE id = $1 RETURNING *`,
            [id]
        );
        return rows[0] ?? null;
    },

    async upsertUser(username: string): Promise<User> {
        const { rows } = await pool.query<User>(
            `INSERT INTO users (username)
             VALUES ($1)
             ON CONFLICT (username) DO UPDATE SET username = EXCLUDED.username
             RETURNING id, username`,
            [username]
        );
        return rows[0];
    }
};
