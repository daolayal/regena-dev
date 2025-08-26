import { Router } from 'express';
import {authMiddleware} from "../../middlewares/auth.middleware";
import {checkAbility} from "../../middlewares/check-ability.middleware";
import {deleteIndex, getSearchIndexById, updateSearchIndex} from "../../controllers/admin/search-index.controller";
import {getProjectStructure} from "../../controllers/project.controller";
import {validateSearchIndexSchema} from '../../schemas/search-index.schema';


const router = Router();

/**
 * @swagger
 * tags:
 *   name: SearchIndex
 *   description: Admin API for managing search index
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     SearchIndex:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         project_id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: "test"
 *         description:
 *           type: string
 *           example: "Test search index"
 *         blob_name:
 *           type: string
 *           example: "test"
 *         status:
 *           type: enum
 *
 */

/**
 * @swagger
 * /admin/search-index/{id}:
 *   delete:
 *     summary: Delete a role by ID
 *     tags: [SearchIndex]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID search index
 *     responses:
 *       204:
 *         description: Role deleted
 */
router.delete('/search-index/:id', authMiddleware, checkAbility('delete', 'SearchIndex'), deleteIndex);


/**
 * @swagger
 * /admin/search-index/{id}:
 *   get:
 *     summary: Get search index by ID
 *     tags: [SearchIndex]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID search index
 *     responses:
 *       200:
 *         description: search index info
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SearchIndex'
 */
router.get('/search-index/:id', authMiddleware, checkAbility('get', 'Project'), getSearchIndexById);

/**
 * @swagger
 * /admin/search-index/{id}:
 *   put:
 *     summary: Update a search index by ID
 *     tags: [SearchIndex]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID search index
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SearchIndex'
 *     responses:
 *       200:
 *         description: Search Index updated
 */
router.put('/search-index/:id', validateSearchIndexSchema, authMiddleware, checkAbility('create', 'Project'), updateSearchIndex);

/**
 * @swagger
 * /admin/search-index/{indexId}/structure:
 *   get:
 *     summary: Get tree structure of client files
 *     tags: [SearchIndex]
 *     parameters:
 *       - in: path
 *         name: indexId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID search index
 *     responses:
 *       204:
 *         description: Tree structure of client files
 */
router.get('/search-index/:indexId/structure', authMiddleware, checkAbility('get', 'Project'), getProjectStructure);

export default router;
