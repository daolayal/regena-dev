import {Request, Response} from 'express';
import {PrismaClient} from '@prisma/client';
import {JwtUser} from "../models/jwt-user";

const prisma = new PrismaClient();


export const getChatHistoryBySessionId = async (req: Request, res: Response) => {
    try {

        const user: JwtUser = <JwtUser>req.user;
        const {session_id} = req.params;

        const history = await prisma.chatHistory.findMany({
            where: {
                session_id: Number(session_id),
                user_id: user.id
            },
            select: {
                id: true,
                session_id: true,
                request: true,
                response: true,
                feedback: true,
                created_at: true,
            },
            orderBy: {
                created_at: 'asc'
            }
        });

        if (history.length === 0) {
            res.status(404).json({error: 'No chat history found'});
            return
        }


        res.json(history);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Error while getting chat history'});
    }
}


export const createChatHistory = async (req: Request, res: Response) => {
    try {
        const user: JwtUser = <JwtUser>req.user;

        const {session_id, request, response, feedback} = req.body;

        const newChat = await prisma.chatHistory.create({
            data: {session_id, request, response, user_id: user.id, feedback},
        });

        res.status(201).json(newChat);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Error while creating chat history record'});
    }
};

export const updateChatHistory = async (req: Request, res: Response) => {
    try {
        const {id} = req.params;
        const {feedback} = req.body;

        const updatedChat = await prisma.chatHistory.update({
            where: {id: Number(id)},
            data: {feedback},
        });

        res.json(updatedChat);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Error while updating chat history record'});
    }
};

export const deleteChatHistory = async (req: Request, res: Response) => {
    try {
        const {id} = req.params;

        await prisma.chatHistory.delete({where: {id: Number(id)}});

        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Error while deleting chat history record'});
    }
};
