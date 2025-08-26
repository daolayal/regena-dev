import { Router } from 'express';
import {
    createRole,
    getRoles,
    getRoleById,
    updateRole,
    deleteRole,

    addPermission,
    removePermission,
} from '../../controllers/admin/role.controller';
import {
    validateRoleSchema,
    validateRoleUpdateSchema,
    validateRolePermissionSchema
} from '../../schemas/role.schema';
import {authMiddleware} from "../../middlewares/auth.middleware";
import {checkAbility} from "../../middlewares/check-ability.middleware";
import {paginationMiddleware} from "../../middlewares/pagination.middleware";


const router = Router();

/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: Admin API for managing roles
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Role:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: "Admin"
 *     RolePermission:
 *       type: object
 *       properties:
 *         role_id:
 *           type: integer
 *           example: 1
 *         permission_id:
 *           type: integer
 *           example: 2
 */

/**
 * @swagger
 * /admin/role:
 *   post:
 *     summary: Create a new role
 *     tags: [Roles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Role'
 *     responses:
 *       201:
 *         description: Role created
 */
router.post('/role', validateRoleSchema, authMiddleware, checkAbility('create', 'Role'), createRole);

/**
 * @swagger
 * /admin/roles:
 *   get:
 *     summary: Get all roles
 *     tags: [Roles]
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
 *         description: Limit of roles per page
 *     responses:
 *       200:
 *         description: List of roles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Role'
 */
router.get('/roles',authMiddleware, checkAbility('get', 'Role'), paginationMiddleware,  getRoles);

/**
 * @swagger
 * /admin/role/{id}:
 *   get:
 *     summary: Get a role by ID
 *     tags: [Roles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID role
 *     responses:
 *       200:
 *         description: Information about the role
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Role'
 */
router.get('/role/:id',authMiddleware, checkAbility('get', 'Role'), getRoleById);

/**
 * @swagger
 * /admin/role/{id}:
 *   put:
 *     summary: Update a role by ID
 *     tags: [Roles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID role
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Role'
 *     responses:
 *       200:
 *         description: Role updated
 */
router.put('/role/:id', validateRoleUpdateSchema,authMiddleware, checkAbility('update', 'Role'), updateRole);

/**
 * @swagger
 * /admin/role/{id}:
 *   delete:
 *     summary: Delete a role by ID
 *     tags: [Roles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID role
 *     responses:
 *       204:
 *         description: Role deleted
 */
router.delete('/role/:id', authMiddleware, checkAbility('delete', 'Role'), deleteRole);

/**
 * @swagger
 * /admin/role/add-permission:
 *   post:
 *     summary: Add a permission to a role
 *     tags: [Roles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role_id:
 *                 type: integer
 *                 example: 1
 *               permission_id:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       201:
 *         description: Permission added to role
 */
router.post('/role/add-permission', validateRolePermissionSchema, authMiddleware, checkAbility('create', 'Role'), addPermission);

/**
 * @swagger
 * /admin/role/remove-permission:
 *   post:
 *     summary: Remove a permission from a role
 *     tags: [Roles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role_id:
 *                 type: integer
 *                 example: 1
 *               permission_id:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Permission removed from role
 */
router.post('/role/remove-permission', validateRolePermissionSchema, authMiddleware, checkAbility('create', 'Role'), removePermission);

export default router;
