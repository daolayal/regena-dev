import {Socket} from 'socket.io';
import {processMessage} from '../services/chat.service';
import {IMessageResponse} from "../models/MessageResponse";

interface MySocket extends Socket {
    user?: { id: string };
}

export function handleMessage(socket: MySocket): void {

    const project = socket.data.project;
    const sessionId = socket.data.sessionId;
    const user = socket.data.user;

    if (!project) {
        throw new Error('Search index not found');
    }

    socket.on('message', async (data: { text: string, prompt: string  }) => {
        try {

            const response = await processMessage(socket, data, project, sessionId, user);

            socket.emit('message', response);

        } catch (error) {
            console.error('Error:', error);

            const errorResponse :IMessageResponse= {
                //@ts-ignore
                message: error.message,
                documents: [],
                id: -1,
                followup: [],
                mermaid: "null",
            }

            socket.emit('error', errorResponse);
        }
    });
}
