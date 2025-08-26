import { Router } from 'express';
import {
    createPermission,
    getPermissions,
    getPermissionById,
    updatePermission,
    deletePermission,
} from '../../controllers/admin/permission.controller';
import {
    validatePermissionSchema,
    validatePermissionUpdateSchema
} from '../../schemas/permission.schema';
import {authMiddleware} from "../../middlewares/auth.middleware";
import {checkAbility} from "../../middlewares/check-ability.middleware";
import { paginationMiddleware } from '../../middlewares/pagination.middleware';

const router = Router();


/**
 * @swagger
 * tags:
 *   name: Permissions
 *   description: API for managing permissions
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Permission:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         action:
 *           type: string
 *           example: "get"
 *         subject:
 *           type: string
 *           example: "ChatSession"
 */

/**
 * @swagger
 * /admin/permission:
 *   post:
 *     summary: Create a new permission
 *     tags: [Permissions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Permission'
 *     responses:
 *       201:
 *         description: Permission created
 */
router.post('/permission', validatePermissionSchema,authMiddleware, checkAbility('create', 'Permission'), createPermission);


/**
 * @swagger
 * /admin/permissions:
 *   get:
 *     summary: Get all permissions
 *     tags: [Permissions]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Number of page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Limit of permissions per page
 *     responses:
 *       200:
 *         description: Pagination of permissions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Permission'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: Total number of permissions
 *                     page:
 *                       type: integer
 *                       description: Current page
 *                     limit:
 *                       type: integer
 *                       description: Limit of permissions per page
 *                     totalPages:
 *                       type: integer
 *                       description: Total number of pages
 */
router.get('/permissions',authMiddleware, checkAbility('get', 'Permission'), paginationMiddleware, getPermissions);

/**
 * @swagger
 * /admin/permission/{id}:
 *   get:
 *     summary: Get permission by ID
 *     tags: [Permissions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID permission
 *     responses:
 *       200:
 *         description: Permission info
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Permission'
 */
router.get('/permission/:id', authMiddleware, checkAbility('get', 'Permission'), getPermissionById);

/**
 * @swagger
 * /admin/permission/{id}:
 *   put:
 *     summary: Update permission by ID
 *     tags: [Permissions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID permission
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Permission'
 *     responses:
 *       200:
 *         description: Permission updated
 */
router.put('/permission/:id', validatePermissionUpdateSchema, authMiddleware, checkAbility('update', 'Permission'), updatePermission);

/**
 * @swagger
 * /admin/permission/{id}:
 *   delete:
 *     summary: Delete permission
 *     tags: [Permissions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID permission
 *     responses:
 *       204:
 *         description: Permission deleted
 */
router.delete('/permission/:id',authMiddleware, checkAbility('delete', 'Permission'), deletePermission);

export default router;
