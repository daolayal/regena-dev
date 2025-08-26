import {Request, Response} from 'express';
import {PrismaClient} from '@prisma/client';
import {validationResult} from 'express-validator';
import {logger} from '../../logger';
import {JwtUser} from "../../models/jwt-user";

const prisma = new PrismaClient();

const handleValidationErrors = (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }
};


export const me = async (req: Request, res: Response) => {
    const currentUser: JwtUser = <JwtUser>req.user;

    try {
        const user = await prisma.user.findUnique({
            where: {id: currentUser.id},
            select: {
                id: true,
                name: true,
                email: true,
                azure_id: true,
                user_roles: {
                    select: {
                        role: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
                UserProject: {
                    select: {
                        project: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        });

        res.json(user);
    } catch (error) {
        logger.error(error);
        res.status(500).json({error: 'Failed to fetch user'});
    }
}

export const createUser = async (req: Request, res: Response) => {
    handleValidationErrors(req, res);

    try {
        const {azure_id, email, name} = req.body;
        const user = await prisma.user.create({
            data: {azure_id, email, name},
        });

        res.status(201).json(user);
    } catch (error) {
        logger.error(error);
        res.status(500).json({error: 'Failed to create user'});
    }
};


export const getUsers = async (req: Request, res: Response) => {
    try {

        // @ts-ignore
        const {skip, take, page, limit} = req.pagination!;

        const [users, total] = await Promise.all([
            prisma.user.findMany({skip, take}),
            prisma.user.count(),
        ]);

        const totalPages = Math.ceil(total / limit);

        res.json({
            data: users,
            meta: {
                total,
                page,
                limit,
                totalPages,
            },
        });
    } catch (error) {
        logger.error(error);
        res.status(500).json({error: 'Failed to fetch users'});
    }
};

export const findUser = async (req: Request, res: Response) => {
    try {

        const {name} = req.params;

        if (!name) {
            res.status(400).json({error: 'Name parameter is required'});
            return;
        }

        const users = await prisma.user.findMany({
            where: {
                name: {
                    contains: name,
                    mode: 'insensitive'
                }
            },
            take: 10,
            orderBy: {created_at: 'desc'}
        });

        res.json(users);
    } catch (error) {
        logger.error(error);
        res.status(500).json({error: 'Failed to fetch users'});
    }
}


export const getUserById = async (req: Request, res: Response) => {
    try {
        const user = await prisma.user.findUnique({
            where: {id: Number(req.params.id)},
            select: {
                id: true,
                name: true,
                user_roles: {
                    select: {
                        role: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                },
                UserProject: {
                    select: {
                        project: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        });

        if (!user) {
            res.status(404).json({error: 'User not found'});
            return;
        }

        res.json(user);
    } catch (error) {
        logger.error(error);
        res.status(400).json({error: 'Invalid request'});
    }
};


export const updateUser = async (req: Request, res: Response) => {
    handleValidationErrors(req, res);

    try {
        const {azure_id, email, name} = req.body;
        const user = await prisma.user.update({
            where: {id: Number(req.params.id)},
            data: {azure_id, email, name},
        });
        res.json(user);
    } catch (error) {
        logger.error(error);
        res.status(400).json({error: 'Update failed'});
    }
};


export const deleteUser = async (req: Request, res: Response) => {
    try {
        await prisma.user.delete({where: {id: Number(req.params.id)}});
        res.status(204).send();
    } catch (error) {
        logger.error(error);
        res.status(400).json({error: 'Delete failed'});
    }
};


export const addRole = async (req: Request, res: Response) => {
    handleValidationErrors(req, res);

    try {
        const {user_id, role_id} = req.body;

        const user = await prisma.user.findUnique({where: {id: user_id}});
        if (!user) {
            res.status(404).json({error: 'User not found'});
            return;
        }

        const role = await prisma.role.findUnique({where: {id: role_id}});
        if (!role) {
            res.status(404).json({error: 'Role not found'});
            return;
        }

        const existingUserRole = await prisma.userRole.findUnique({
            where: {user_id_role_id: {user_id, role_id}},
        });

        if (existingUserRole) {
            res.status(400).json({error: 'User already has this role'});
            return;
        }

        await prisma.userRole.create({
            data: {user_id, role_id},
        });

        res.status(201).json({message: 'Role added successfully'});
    } catch (error) {
        logger.error(error);
        res.status(500).json({error: 'Failed to add role'});
    }
};


export const removeRole = async (req: Request, res: Response) => {
    handleValidationErrors(req, res);

    try {
        const {user_id, role_id} = req.body;

        const userRole = await prisma.userRole.findUnique({
            where: {user_id_role_id: {user_id, role_id}},
        });

        if (!userRole) {
            res.status(404).json({error: 'User does not have this role'});
            return;
        }

        await prisma.userRole.delete({
            where: {user_id_role_id: {user_id, role_id}},
        });

        res.status(200).json({message: 'Role removed successfully'});
    } catch (error) {
        logger.error(error);
        res.status(500).json({error: 'Failed to remove role'});
    }
};


export const addProject = async (req: Request, res: Response) => {
    handleValidationErrors(req, res);

    try {
        const {user_id, project_id} = req.body;
        const user = await prisma.user.findUnique({where: {id: user_id}});
        if (!user) {
            res.status(404).json({error: 'User not found'});
            return;
        }

        const project = await prisma.project.findUnique({where: {id: project_id}});
        if (!project) {
            res.status(404).json({error: 'Project not found'});
            return;

        }
        const existingUserProject = await prisma.userProject.findUnique({
            where: {user_id_project_id: {user_id, project_id}},
        });
        if (existingUserProject) {
            res.status(400).json({error: 'Project already added to user'});
            return;
        }

        const newUserProject = await prisma.userProject.create({
            data: {user_id, project_id},
        });

        res.status(201).json({message: 'Project added successfully'});
    } catch (error) {
        logger.error(error);
        res.status(500).json({error: 'Failed to add project'});
    }
};

export const removeProject = async (req: Request, res: Response) => {
    handleValidationErrors(req, res);

    try {
        const {user_id, project_id} = req.body;
        const userProject = await prisma.userProject.findUnique({
            where: {user_id_project_id: {user_id, project_id}},
        });

        if (!userProject) {
            res.status(404).json({error: 'Project not found for user'});
            return;
        }

        await prisma.userProject.delete({
            where: {user_id_project_id: {user_id, project_id}},
        });

        res.status(200).json({message: 'Project removed successfully'});
    } catch (error) {
        logger.error(error);
        res.status(500).json({error: 'Failed to remove project'});
    }
};
