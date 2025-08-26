import {Request, Response} from 'express';
import {PrismaClient} from '@prisma/client';
import {logger} from '../../logger';

const prisma = new PrismaClient();

export const deleteIndex = async (req: Request, res: Response) => {
    try {
        await prisma.searchIndex.delete({where: {id: Number(req.params.id)}});
        res.status(204).send();
    } catch (error) {
        logger.error(error);
        res.status(400).json({error: 'Delete failed'});
    }
};

export const getSearchIndexById = async (req: Request, res: Response) => {
    try {
        const {id} = req.params;
        const searchIndex = await prisma.searchIndex.findFirst({
            where: {
                id: Number(id),
            },
        });
        if (searchIndex === null) {
            res.status(404).json({error: 'No searchIndex found'});
            return
        }
        res.json(searchIndex);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Error while getting search Index'});
    }
}

export const updateSearchIndex = async (req: Request, res: Response) => {
    try {
        const {id} = req.params;
        const {description} = req.body;
        const updatedSearchIndex = await prisma.searchIndex.update({
            where: {id: Number(id)},
            data: {
                description,
            },
        });
        res.json(updatedSearchIndex);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Error while updating Search Index record'});
    }
};
