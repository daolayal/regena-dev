import {Request, Response} from 'express';
import prisma from '../../prisma';
import {validationResult} from "express-validator";
import {ITool} from "../../models/tool";

const handleValidationErrors = (req: Request, res: Response): boolean => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({errors: errors.array()});
        return false;
    }
    return true;
};

export const createTool = async (req: Request, res: Response) => {
    if (!handleValidationErrors(req, res)) return;
    const tool: ITool = req.body;
    const newTool = await prisma.tools.create({
        data: tool,
    });
    res.status(201).json(newTool);
};

export const getTools = async (req: Request, res: Response) => {
    const tools: ITool[] = await prisma.tools.findMany({
        orderBy: {created_at: 'desc'}
    });
    res.json(tools);
};

export const getToolById = async (req: Request, res: Response) => {
    const {id} = req.params;
    const tool: ITool | null = await prisma.tools.findFirst({
        where: {id: Number(id)},
        orderBy: {created_at: 'desc'}
    });
    if (!tool) {
        res.status(404).json({error: 'Tool not found'});
        return;
    }
    res.json(tool);
};

export const updateTool = async (req: Request, res: Response)=> {
    handleValidationErrors(req, res);
    const {id} = req.params;
    const tool: ITool = req.body;

    const updatedTool: ITool = await prisma.tools.update({
        where: {id: Number(id)},
        data: tool,
    });
    res.json(updatedTool);
}

export const deleteTool = async (req: Request, res: Response) => {
    try {
        await prisma.tools.delete({where: {id: Number(req.params.id)}});
        res.status(204).send();
    } catch (error) {
        res.status(400).json({error: 'Delete failed'});
    }
}


