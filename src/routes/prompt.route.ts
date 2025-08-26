import { Router } from 'express';
import {
    getPrompts,
    getPromptById,
    createPrompt,
    updatePrompt,
    deletePrompt,
} from '../controllers/prompt.controller';
import {authMiddleware} from "../middlewares/auth.middleware";
import {checkAbility} from "../middlewares/check-ability.middleware";
import {paginationMiddleware} from "../middlewares/pagination.middleware";
import {validatePermissionSchema} from "../schemas/permission.schema";
import {validatePromptSchema, validatePromptUpdateSchema} from "../schemas/prompt.schema";

const router = Router();


/**
 * @swagger
 * /api/prompt:
 *   get:
 *     summary: Get all prompts
 *     description: Fetch all prompts. Requires authentication and permission.
 *     tags:
 *       - Prompt
 *     responses:
 *       200:
 *         description: Successfully retrieved the prompts
 */
router.get('/', authMiddleware, checkAbility('get', 'Prompt'), paginationMiddleware, getPrompts);

/**
 * @swagger
 * /api/prompt/{id}:
 *  get:
 *      summary: Get a prompt by ID
 *      description: Fetch a prompt by its ID. Requires authentication and permission.
 *      tags:
 *          - Prompt
 *      parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The unique identifier of the prompt
 *      responses:
 *       200:
 *         description: Prompt successfully retrieved
 */
router.get('/:id', authMiddleware, checkAbility('get', 'Prompt'), getPromptById);


/**
 * @swagger
 * /api/prompt:
 *   post:
 *     summary: Create a new prompt
 *     description: Creates a new prompt. Requires authentication and permission.
 *     tags:
 *       - Prompt
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *           properties:
 *               key:
 *                 type: string
 *               prompt:
 *                 type: string
 *           example:
 *               key: "my-custom-prompt"
 *               prompt: "What is your favorite color?"
 *     responses:
 *       201:
 *         description: Prompt successfully created
 */
router.post('/',validatePromptSchema,  authMiddleware, checkAbility('create', 'Prompt'), createPrompt);

/**
 * @swagger
 * /api/prompt/{id}:
 *   put:
 *     summary: Update a prompt
 *     description: Update a prompt by its ID. Requires authentication and permission.
 *     tags:
 *       - Prompt
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The unique identifier of the prompt to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               key:
 *                 type: string
 *               prompt:
 *                 type: string
 *     responses:
 *       200:
 *         description: Prompt successfully updated
 */
router.put('/:id', validatePromptUpdateSchema, authMiddleware, checkAbility('update', 'Prompt'), updatePrompt);

/**
 * @swagger
 * /api/prompt/{id}:
 *   delete:
 *     summary: Delete a prompt
 *     description: Delete a prompt by its ID. Requires authentication and permission.
 *     tags:
 *       - Prompt
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The unique identifier of the prompt to delete
 *     responses:
 *       200:
 *         description: Prompt successfully deleted
 */
router.delete('/:id', authMiddleware, checkAbility('delete', 'Prompt'), deletePrompt);

export default router;
