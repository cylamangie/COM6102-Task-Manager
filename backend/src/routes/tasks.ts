import { Router, type Request, type Response } from 'express';
import { db, type Task } from '../db';

let io: import('socket.io').Server | null = null;

export function setIo(instance: import('socket.io').Server) {
    io = instance;
}

function emit(event: string, data: unknown) {
    io?.emit(event, data);
}

interface TaskPayload {
    title?: string;
    description?: string;
    status?: string;
    priority?: string;
}

const router = Router();

router.get('/boards/:boardId/tasks', async (req: Request<{ boardId: string }>, res: Response) => {
    const tasks = await db.getTasksByBoardId(Number(req.params.boardId));
    res.json(tasks);
});

router.post('/boards/:boardId/tasks', async (req: Request<{ boardId: string }, {}, TaskPayload>, res: Response) => {
    const { title, description, status, priority } = req.body;

    if (!title?.trim()) {
        res.status(400).json({ error: 'Task title is required' });
        return;
    }

    const task = await db.createTask(
        Number(req.params.boardId),
        title,
        description ?? '',
        status ?? 'todo',
        priority ?? 'medium'
    );
    emit('taskCreated', task);
    res.json(task);
});

router.put('/tasks/:id', async (req: Request<{ id: string }, {}, TaskPayload>, res: Response) => {
    const { title, description, status, priority } = req.body;
    const updates: Partial<Pick<Task, 'title' | 'description' | 'status' | 'priority'>> = {};

    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (status !== undefined) updates.status = status;
    if (priority !== undefined) updates.priority = priority;

    const updatedTask = await db.updateTask(Number(req.params.id), updates);
    if (!updatedTask) {
        res.status(404).json({ error: 'Task not found' });
        return;
    }
    emit('taskUpdated', updatedTask);
    res.json(updatedTask);
});

router.delete('/tasks/:id', async (req: Request<{ id: string }>, res: Response) => {
    const deletedTask = await db.deleteTask(Number(req.params.id));
    if (!deletedTask) {
        res.status(404).json({ error: 'Task not found' });
        return;
    }
    emit('taskDeleted', deletedTask.id);
    res.json({ message: 'Task deleted successfully', task: deletedTask });
});

export default router;
