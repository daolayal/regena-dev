import { users as User } from '@prisma/client';

declare global {
    namespace Express {
        interface Request {
            user?: User;
            ability?: any;
        }
    }
}
