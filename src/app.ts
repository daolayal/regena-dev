import express from 'express';
import ApiRoutes from './routes/api.route'
import ChatSessionRoutes from './routes/chat-session.routes';
import ChatHistoryRoute from './routes/chat-history.route';
import ChatInitRoute from './routes/chat-init.route';
import ProjectRoute from './routes/project.route';
import UserRoute from './routes/admin/user.route';
import RoleRoute from './routes/admin/role.route';
import AdminProjectRoute from './routes/admin/project.route';
import PermissionRoute from './routes/admin/permission.route';
import SearchIndexRoute from "./routes/admin/search-index.route";
import ToolRoute from "./routes/admin/tool.route";

import cors, { CorsOptions } from 'cors';
import expressListRoutes from 'express-list-routes'
import prisma from "./prisma";
import { setupSwagger } from './swagger';
import AuthRoute from "./routes/auth.route";

import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import socketHandler from './sockets';
import {getProject} from "./middlewares/socket.middleware";
import {socketAuthMiddleware} from "./middlewares/socker-auth.middleware";
import PromptRoute from "./routes/prompt.route";
import {startQueueConsumer} from "./consumers/upload.consumer";
import {startIndexerConsumer} from "./consumers/indexer.consumer";



const corsOptions: CorsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS', 'DELETE', 'PUT'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};

const app = express();

app.use(express.json());

if (process.env.NODE_ENV !== 'production') {
    setupSwagger(app);
}

app.use(cors(corsOptions));

app.use('/api', ApiRoutes);
app.use('/auth', AuthRoute);
app.use('/api/chat-sessions', ChatSessionRoutes);
app.use('/api/chat-history', ChatHistoryRoute);
app.use('/api/chat-init', ChatInitRoute);
app.use('/api/project', ProjectRoute);
app.use('/api/prompt', PromptRoute);


app.use('/admin', UserRoute);
app.use('/admin', RoleRoute);
app.use('/admin', PermissionRoute);

app.use('/admin', AdminProjectRoute);
app.use('/admin', SearchIndexRoute);
app.use('/admin', ToolRoute);



//consumers
startQueueConsumer()
startIndexerConsumer()


const server = http.createServer(app);

const io = new SocketIOServer(server, {
    cors: { origin: '*' }
});

io.use(getProject);
io.use(socketAuthMiddleware);

socketHandler(io);

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {

    console.log(`--------------------------------------`);
    console.log(`|         Regena Uploader             |`);
    console.log(`--------------------------------------`);
    console.log(`Log file is located at: ./logs/app.log`);
    console.log(`Routes:`);

    expressListRoutes(app, { prefix: `localhost:${PORT}` });
});


process.on("SIGINT", async () => {
    await prisma.$disconnect();
    process.exit();
});

