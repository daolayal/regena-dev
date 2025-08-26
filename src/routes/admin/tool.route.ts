import {Router} from 'express';

import {validateToolSchema} from '../../schemas/tool.schema';
import {authMiddleware} from "../../middlewares/auth.middleware";
import {checkAbility} from "../../middlewares/check-ability.middleware";
import {createTool, getTools, updateTool, deleteTool, getToolById} from "../../controllers/admin/tool.controller";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Tools
 *   description: Admin API for managing tools
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Tool:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "test_function"
 *         description:
 *           type: string
 *           example: "Test function"
 *         schema:
 *           type: json
 *           example: "{\"type\":\"function\",\"function\":{\"name\":\"get_structure_tree\",\"description\":\"Get structure of all files and catalogs in the project.\"}}"
 *         enabled:
 *           type: boolean
 *           example: true
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /admin/tool:
 *   post:
 *     summary: Create a new tool
 *     tags: [Tools]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Tool'
 *     responses:
 *       201:
 *         description: User created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tool'
 */
router.post('/tool', validateToolSchema, authMiddleware, checkAbility('create', 'User'), createTool);

/**
 * @swagger
 * /admin/tool/{id}:
 *   get:
 *     summary: Get a tool by ID
 *     tags: [Tools]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID tool
 *     responses:
 *       200:
 *         description: Tool info
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tool'
 */
router.get('/tool/:id', authMiddleware, checkAbility('create', 'User'), getToolById);


/**
 * @swagger
 * /admin/tool:
 *   get:
 *     summary: Get all tools
 *     tags: [Tools]
 *     responses:
 *       200:
 *         description: Tools list
 */
router.get('/tool', authMiddleware, checkAbility('create', 'User'), getTools);


/**
 * @swagger
 * /admin/tool/{id}:
 *   delete:
 *     summary: Delete a tool by ID
 *     tags: [Tools]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID tool
 *     responses:
 *       204:
 *         description: Tool deleted
 */
router.delete('/tool/:id', authMiddleware, checkAbility('delete', 'User'), deleteTool);

/**
 * @swagger
 * /admin/tool/{id}:
 *   put:
 *     summary: Update a tool by ID
 *     tags: [Tools]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID tool
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Tool'
 *     responses:
 *       200:
 *         description: Tool updated
 */
router.put('/tool/:id', validateToolSchema, authMiddleware, checkAbility('update', 'User'), updateTool);

export default router;
