import { Server, Socket } from 'socket.io';

export function setupSocket(io: Server): void {
    io.on('connection', (socket: Socket) => {
        console.log('User connected:', socket.id);

        socket.on('joinBoard', (boardId: string) => {
            socket.join(`board-${boardId}`);
            console.log(`User ${socket.id} joined board ${boardId}`);
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });
}
