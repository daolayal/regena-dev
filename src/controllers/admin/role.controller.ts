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

export const createRole = async (req: Request, res: Response) => {

    handleValidationErrors(req, res);

    try {
        const {name} = req.body;

        const existingRole = await prisma.role.findUnique({
            where: {name},
        });

        if (existingRole) {
            res.status(400).json({error: 'Role already exists'});
            return;
        }

        const role = await prisma.role.create({
            data: {name},
        });

        res.status(201).json(role);
    } catch (error) {
        logger.error(error);
        res.status(500).json({error: 'Failed to create role'});
    }
};

export const getRoles = async (req: Request, res: Response) => {
    try {

        // @ts-ignore
        const { skip, take, page, limit } = req.pagination!;

        const [role, total] = await Promise.all([
            prisma.role.findMany({ skip, take }),
            prisma.role.count(),
        ]);

        const totalPages = Math.ceil(total / limit);

        res.json({
            data: role,
            meta: {
                total,
                page,
                limit,
                totalPages,
            },
        });
    } catch (error) {
        logger.error(error);
        res.status(500).json({error: 'Failed to fetch roles'});
    }
};

export const getRoleById = async (req: Request, res: Response) => {
    try {
        const role = await prisma.role.findUnique({
            where: {id: Number(req.params.id)},
            include: {user_roles: true, role_permissions: true},
        });

        if (!role) {
            res.status(404).json({error: 'Role not found'});
            return;
        }

        res.json(role);
    } catch (error) {
        logger.error(error);
        res.status(400).json({error: 'Invalid request'});
    }
};


export const updateRole = async (req: Request, res: Response) => {

    handleValidationErrors(req, res);

    try {
        const {name} = req.body;

        const role = await prisma.role.update({
            where: {id: Number(req.params.id)},
            data: {name},
        });

        res.json(role);
    } catch (error) {
        logger.error(error);
        res.status(400).json({error: 'Update failed'});
    }
};

export const deleteRole = async (req: Request, res: Response) => {
    try {
        await prisma.role.delete({where: {id: Number(req.params.id)}});
        res.status(204).send();
    } catch (error) {
        logger.error(error);
        res.status(400).json({error: 'Delete failed'});
    }
};


export const addPermission = async (req: Request, res: Response) => {
    handleValidationErrors(req, res);

    try {
        const {role_id, permission_id} = req.body;

        const role = await prisma.role.findUnique({where: {id: role_id}});
        if (!role) {
            res.status(404).json({error: 'Role not found'});
            return;
        }

        const permission = await prisma.permission.findUnique({where: {id: permission_id}});
        if (!permission) {
            res.status(404).json({error: 'Permission not found'});
            return;
        }

        const existingRolePermission = await prisma.rolePermission.findUnique({
            where: {role_id_permission_id: {role_id, permission_id}},
        });

        if (existingRolePermission) {
            res.status(400).json({error: 'Permission already assigned to role'});
            return;
        }

        await prisma.rolePermission.create({
            data: {role_id, permission_id},
        });

        res.status(201).json({message: 'Permission added to role successfully'});
    } catch (error) {
        logger.error(error);
        res.status(500).json({error: 'Failed to add permission to role'});
    }
};


export const removePermission = async (req: Request, res: Response) => {
    handleValidationErrors(req, res);


    try {
        const {role_id, permission_id} = req.body;

        const rolePermission = await prisma.rolePermission.findUnique({
            where: {role_id_permission_id: {role_id, permission_id}},
        });

        if (!rolePermission) {
            res.status(404).json({error: 'Permission not assigned to role'});
            return;
        }

        await prisma.rolePermission.delete({
            where: {role_id_permission_id: {role_id, permission_id}},
        });

        res.status(200).json({message: 'Permission removed from role successfully'});
    } catch (error) {
        logger.error(error);
        res.status(500).json({error: 'Failed to remove permission from role'});
    }
};
