import prisma from "../prisma";

export const getProject = async (socket: any, next: any) => {
    try {
        const projectId = socket.handshake.query.projectId as string;
        const sessionId = socket.handshake.query.sessionId as string;

        const project = await prisma.project.findUnique({
            where: {id: Number(projectId)},
            include: {
                SearchIndex: {
                    select: {
                        name: true,
                        blob_name: true,
                    },
                },
            }
        });

        if (!project) {
            return next(new Error("Project not found"));
        }

        socket.data.project = project;
        socket.data.sessionId = sessionId;
        next();
    } catch
        (err) {
        next(err);
    }
}
