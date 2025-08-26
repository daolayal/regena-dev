declare global {
    namespace Express {
        interface Request {
            pagination?: {
                page: number;
                limit: number;
                skip: number;
                take: number;
            };
        }
    }
}
