import {Request, Response} from 'express';
import {PrismaClient} from '@prisma/client';
import {validationResult} from 'express-validator';
import {logger} from '../../logger';

const prisma = new PrismaClient();

const handleValidationErrors = (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({errors: errors.array()});
        return;
    }
};


export const createPermission = async (req: Request, res: Response) => {
    handleValidationErrors(req, res);

    try {
        const {action, subject} = req.body;

        const existingPermission = await prisma.permission.findUnique({
            where: {action_subject: {action, subject}},
        });

        if (existingPermission) {
            res.status(400).json({error: 'Permission already exists'});
            return;
        }

        const permission = await prisma.permission.create({
            data: {action, subject},
        });

        res.status(201).json(permission);
    } catch (error) {
        logger.error(error);
        res.status(500).json({error: 'Failed to create permission'});
    }
};


export const getPermissions = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const { skip, take, page, limit } = req.pagination!;

        const [permissions, total] = await Promise.all([
            prisma.permission.findMany({ skip, take }),
            prisma.permission.count(),
        ]);

        const totalPages = Math.ceil(total / limit);

        res.json({
            data: permissions,
            meta: {
                total,
                page,
                limit,
                totalPages,
            },
        });
    } catch (error) {
        logger.error(error);
        res.status(500).json({error: 'Failed to fetch permissions'});
    }
};


export const getPermissionById = async (req: Request, res: Response) => {
    try {
        const permission = await prisma.permission.findUnique({
            where: {id: Number(req.params.id)},
            include: {role_permissions: true},
        });

        if (!permission) {
            res.status(404).json({error: 'Permission not found'});
            return;
        }

        res.json(permission);
    } catch (error) {
        logger.error(error);
        res.status(400).json({error: 'Invalid request'});
    }
};


export const updatePermission = async (req: Request, res: Response) => {
    handleValidationErrors(req, res);

    try {
        const {action, subject} = req.body;

        const permission = await prisma.permission.update({
            where: {id: Number(req.params.id)},
            data: {action, subject},
        });

        res.json(permission);
    } catch (error) {
        logger.error(error);
        res.status(400).json({error: 'Update failed'});
    }
};


export const deletePermission = async (req: Request, res: Response) => {
    try {
        await prisma.permission.delete({where: {id: Number(req.params.id)}});
        res.status(204).send();
    } catch (error) {
        logger.error(error);
        res.status(400).json({error: 'Delete failed'});
    }
};
