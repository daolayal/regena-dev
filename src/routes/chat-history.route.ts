import { Router } from 'express';
import {
    getChatHistoryBySessionId,
    createChatHistory,
    updateChatHistory,
    deleteChatHistory
} from '../controllers/chat-history.controller';
import {authMiddleware} from "../middlewares/auth.middleware";
import {checkAbility} from "../middlewares/check-ability.middleware";

const router = Router();

/**
 * @swagger
 * /api/chat-history/{session_id}:
 *   get:
 *     summary: Retrieve chat history by session ID
 *     description: Fetch the chat history for a given session ID. Requires authentication and permission.
 *     tags:
 *       - Chat History
 *     parameters:
 *       - in: path
 *         name: session_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the chat session
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved chat history
 */
router.get('/:session_id', authMiddleware, checkAbility('get', 'ChatHistory'), getChatHistoryBySessionId);


/**
 * @swagger
 * /api/chat-history:
 *   post:
 *     summary: Create a new chat history entry
 *     description: Stores a new chat history record. Requires authentication and permission.
 *     tags:
 *       - Chat History
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               session_id:
 *                 type: integer
 *               request:
 *                 type: string
 *               response:
 *                 type: string
 *               feedback:
 *                  type: string
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       201:
 *         description: Chat history entry created successfully
 */
router.post('/', authMiddleware, checkAbility('create', 'ChatHistory'), createChatHistory);

/**
 * @swagger
 * /api/chat-history/{id}:
 *   put:
 *     summary: Update a chat history entry
 *     description: Updates an existing chat history record with new data. Requires authentication and permission.
 *     tags:
 *       - Chat History
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the chat history entry to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               session_id:
 *                 type: string
 *               request:
 *                 type: string
 *               response:
 *                 type: string
 *               feedback:
 *                 type: string
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Chat history entry updated successfully
 */
router.put('/:id', authMiddleware, checkAbility('update', 'ChatHistory'), updateChatHistory);

/**
 * @swagger
 * /api/chat-history/{id}:
 *   delete:
 *     summary: Delete a chat history entry
 *     description: Deletes a chat history record. Requires authentication and permission.
 *     tags:
 *       - Chat History
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the chat history entry to delete
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Chat history entry deleted successfully
 */
router.delete('/:id', authMiddleware, checkAbility('delete', 'ChatHistory'), deleteChatHistory);


export default router;
