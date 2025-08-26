import prisma from "../prisma";
import {Request, Response} from 'express';
import {validationResult} from "express-validator";

const handleValidationErrors = (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(400).json({errors: errors.array()});

        return errors;
    }
};


export const getPrompts = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const {skip, take, page, limit} = req.pagination!;

        const [prompts, total] = await Promise.all([
            prisma.prompts.findMany({skip, take}),
            prisma.prompts.count(),
        ]);

        const totalPages = Math.ceil(total / limit);

        res.json({
            data: prompts,
            meta: {
                total,
                page,
                limit,
                totalPages,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Error while getting prompts'});
    }
}

export const getPromptById = async (req: Request, res: Response) => {
    try {
        const {id} = req.params;

        const prompt = await prisma.prompts.findUnique({
            where: {id: Number(id)}
        });

        if (!prompt) {
            res.status(404).json({error: 'Prompt not found'});
            return;
        }

        res.json(prompt);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Error while getting prompt'});
    }
}

export const createPrompt = async (req: Request, res: Response) => {
    const validationErrors = handleValidationErrors(req, res);

    if (validationErrors) {
        return;
    }

    try {
        const {key, prompt} = req.body;

        const newProject = await prisma.prompts.create({
            data: {
                key,
                prompt,
            },
        });

        res.status(201).json(newProject);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Error while creating prompt'});
    }
}


export const updatePrompt = async (req: Request, res: Response) => {
    try {
        const {id} = req.params;
        const {key, prompt, visible} = req.body;

        const updatedPrompt = await prisma.prompts.update({
            where: {id: Number(id)},
            data: {key, prompt, visible},
        });

        res.json(updatedPrompt);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Error while updating prompt'});
    }
}


export const deletePrompt = async (req: Request, res: Response) => {
    try {
        const {id} = req.params;

        await prisma.prompts.delete({
            where: {id: Number(id)}
        });

        res.json({message: 'Prompt deleted'});
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Error while deleting prompt'});
    }
}
