import { Router, type Request, type Response } from 'express';
import { db } from '../db';

interface LoginBody {
    username?: string;
}

const router = Router();

router.post('/login', async (req: Request<{}, {}, LoginBody>, res: Response) => {
    const { username } = req.body;

    if (!username?.trim()) {
        res.status(400).json({ error: 'Username is required' });
        return;
    }

    const user = await db.upsertUser(username);
    res.json({ userId: user.id, username: user.username });
});

export default router;
