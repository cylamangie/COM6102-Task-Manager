import dotenv from 'dotenv';
dotenv.config();

import cors from 'cors';
import express from 'express';
import http from 'http';
import path from 'node:path';
import fs from 'node:fs/promises';
import { Server } from 'socket.io';
import { checkConnection } from './db';
import { setupSocket } from './socket';
import authRoutes from './routes/auth';
import taskRoutes, { setIo } from './routes/tasks';

const app = express();
const server = http.createServer(app);
const isProduction = process.env.NODE_ENV === 'production';

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use('/api', authRoutes);
app.use('/api', taskRoutes);

const io = new Server(server, {
    cors: { origin: true, methods: ['GET', 'POST', 'PUT', 'DELETE'] }
});
setIo(io);
setupSocket(io);

const frontendRoot = path.resolve(process.cwd(), 'frontend');
const frontendIndex = path.resolve(frontendRoot, 'index.html');
const frontendDist = path.resolve(process.cwd(), 'dist', 'client');

async function setupFrontend() {
    if (isProduction) {
        app.use(express.static(frontendDist));
        app.use((req, res, next) => {
            if (req.method !== 'GET' && req.method !== 'HEAD') return next();
            if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) return next();
            res.sendFile(path.join(frontendDist, 'index.html'));
        });
        return;
    }

    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
        configFile: path.resolve(frontendRoot, 'vite.config.ts'),
        server: { middlewareMode: true },
        appType: 'custom'
    });

    app.use(vite.middlewares);
    app.use(async (req, res, next) => {
        if (req.method !== 'GET' && req.method !== 'HEAD') return next();
        if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) return next();
        try {
            const template = await fs.readFile(frontendIndex, 'utf-8');
            const html = await vite.transformIndexHtml(req.originalUrl, template);
            res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
        } catch (err) {
            const renderError = err as Error;
            vite.ssrFixStacktrace(renderError);
            next(renderError);
        }
    });
}

async function waitForDb(maxRetries = 10, interval = 2000) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            await checkConnection();
            console.log('Connected to PostgreSQL');
            return true;
        } catch {
            if (isProduction) throw new Error('Cannot connect to PostgreSQL in production');
            console.log(`Waiting for PostgreSQL... (${i + 1}/${maxRetries})`);
            await new Promise(r => setTimeout(r, interval));
        }
    }
    console.warn('PostgreSQL unavailable, API will return errors');
    return false;
}

const PORT = Number(process.env.PORT) || 5173;

// Start frontend immediately, connect DB in background
setupFrontend().then(() => {
    server.listen(PORT, () => {
        console.log(`Task manager running on http://localhost:${PORT}`);
    });
});

if (isProduction) {
    waitForDb().catch((err) => {
        console.error('Failed to connect to PostgreSQL:', err);
        process.exit(1);
    });
} else {
    waitForDb();
}
