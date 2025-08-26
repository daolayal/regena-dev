import { Server, Socket } from 'socket.io';
import { handleMessage } from './chat.handler';


interface MySocket extends Socket {
    user?: { id: string };
}

export default (io: Server) => {

    console.log('Socket handler initialized');

    io.on('connection', (socket: MySocket) => {
        console.log(`User connected: ${socket.id}`);


        handleMessage(socket);

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });
};
