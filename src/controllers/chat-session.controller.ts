import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import {JwtUser} from "../models/jwt-user";

const prisma = new PrismaClient();


export const getSessions = async (req: Request, res: Response) => {
    try {

        const user: JwtUser = <JwtUser>req.user;
        const { project_id } = req.params;

        const sessions = await prisma.session.findMany({
            where: {
                user_id: Number(user.id),
                project_id: Number(project_id)
            },
            select: {
                id: true,
                name: true,
                project_id: true,
                created_at: true,
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        res.json(sessions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error while getting chat sessions' });
    }
};

export const createSession = async (req: Request, res: Response) => {
    try {

        const user: JwtUser = <JwtUser>req.user;
        const { name, project_id } = req.body;

        const newSession = await prisma.session.create({
            data: {
                name,
                user_id: user.id,
                project_id
            },
        });

        res.status(201).json(newSession);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error while creating chat session' });
    }
};

export const updateSession = async (req: Request, res: Response) => {
    try {

        const user: JwtUser = <JwtUser>req.user;

        const { id } = req.params;
        const { name } = req.body;

        const updatedSession = await prisma.session.update({
            where: { id: Number(id) },
            data: { name, user_id: user.id },
        });

        res.json(updatedSession);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error while updating chat session' });
    }
};

export const deleteSession = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        await prisma.session.delete({ where: { id: Number(id) } });

        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error while deleting chat session' });
    }
};
