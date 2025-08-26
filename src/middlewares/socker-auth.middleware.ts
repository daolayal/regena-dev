import jwt from 'jsonwebtoken';

export const socketAuthMiddleware = async (socket: any, next: any) => {
    try {
        const accessToken = socket.handshake.query.accessToken as string;

        if (!accessToken) {
            return next(new Error("No token provided"));
        }

        socket.data.user = jwt.verify(accessToken, process.env.JWT_SECRET!) as any;
        next();
    } catch
        (err) {
        next(err);
    }
}
