import {Router} from 'express';
import {
    getSessions,
    createSession,
    updateSession,
    deleteSession,
} from '../controllers/chat-session.controller';

import {authMiddleware} from "../middlewares/auth.middleware";
import {checkAbility} from "../middlewares/check-ability.middleware";

const router = Router();

/**
 * @swagger
 * /api/chat-sessions/{project_id}:
 *   get:
 *     summary: Get all chat sessions
 *     description: Fetch all chat sessions. Requires authentication and permission.
 *     tags:
 *       - Chat Session
 *     parameters:
 *       - in: path
 *         name: project_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Project ID
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Sessions successfully retrieved
 */
router.get('/:project_id', authMiddleware, checkAbility('get', 'ChatSession'), getSessions);


/**
 * @swagger
 * /api/chat-sessions:
 *   post:
 *     summary: Create a new chat session
 *     description: Creates a new chat session. Requires authentication and permission.
 *     tags:
 *       - Chat Session
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               project_id:
 *                 type: integer
 *             example:
 *               name: "Test session name"
 *               project_id: 11
 *
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       201:
 *         description: Session successfully created
 */
router.post('/', authMiddleware, checkAbility('create', 'ChatSession'), createSession);


/**
 * @swagger
 * /api/chat-sessions/{id}:
 *   put:
 *     summary: Update a session
 *     description: Updates a session by ID. Requires authentication and permission.
 *     tags:
 *       - Chat Session
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID session
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *             example:
 *               name: "New session name"
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Сессия успешно обновлена
 */
router.put('/:id', authMiddleware, checkAbility('update', 'ChatSession'), updateSession);

/**
 * @swagger
 * /api/chat-sessions/{id}:
 *   delete:
 *     summary: Delete a session
 *     description: Deletes a session by ID. Requires authentication and permission.
 *     tags:
 *       - Chat Session
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID session
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Session successfully deleted
 */
router.delete('/:id', authMiddleware, checkAbility('delete', 'ChatSession'), deleteSession);

export default router;
