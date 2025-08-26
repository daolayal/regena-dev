import {Router} from 'express';
import {
    getGeneralQuestions,
} from '../controllers/chat-init.controller';

import {authMiddleware} from "../middlewares/auth.middleware";
import {checkAbility} from "../middlewares/check-ability.middleware";

const router = Router();

/**
 * @swagger
 * /api/chat-init/{project_id}:
 *   get:
 *     summary: New chat session
 *     description: Open a new chat session and display general questions. Requires access to the project.
 *     tags:
 *       - Chat Init
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
router.get('/:project_id', authMiddleware, checkAbility('get', 'Project'), getGeneralQuestions);


export default router;