import { Request, Response, NextFunction } from 'express';

export const paginationMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, parseInt(req.query.limit as string) || 10);


    // @ts-ignore
    req.pagination = {
        page,
        limit,
        skip: (page - 1) * limit,
        take: limit,
    };

    next();
};
