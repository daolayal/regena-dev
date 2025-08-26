import {Router} from 'express';
import {
    me,
    createUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,

    addRole,
    removeRole,
    addProject,
    removeProject,
    findUser
} from '../../controllers/admin/user.controller';
import {
    validateUserSchema,
    validateUserUpdateSchema,
    validateUserRoleSchema,
    validateUserProjectSchema
} from '../../schemas/user.schema';
import {authMiddleware} from "../../middlewares/auth.middleware";
import {checkAbility} from "../../middlewares/check-ability.middleware";
import {paginationMiddleware} from "../../middlewares/pagination.middleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Admin API for managing users
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         azure_id:
 *           type: string
 *           format: uuid
 *           example: "550e8400-e29b-41d4-a716-446655440000"
 *         email:
 *           type: string
 *           format: email
 *           example: "user@example.com"
 *         name:
 *           type: string
 *           example: "John Doe"
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */


/**
 * @swagger
 * /admin/me:
 *   get:
 *     summary: Get current user
 *     tags: [Users]
 *     responses:
 *       201:
 *         description: User
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.get('/me', authMiddleware, checkAbility('get', 'User'), me);


/**
 * @swagger
 * /admin/user:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.post('/user', validateUserSchema, authMiddleware, checkAbility('create', 'User'), createUser);

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
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
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
router.get('/users', authMiddleware, checkAbility('get', 'User'), paginationMiddleware, getUsers);

/**
 * @swagger
 * /admin/user/find/{name}:
 *   get:
 *     summary: find users by name
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *           description: Username
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
router.get('/user/find/:name', authMiddleware, checkAbility('get', 'User'), findUser);


/**
 * @swagger
 * /admin/user/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID user
 *     responses:
 *       200:
 *         description: User info
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.get('/user/:id', authMiddleware, checkAbility('get', 'User'), getUserById);


/**
 * @swagger
 * /admin/user/{id}:
 *   put:
 *     summary: Update a user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: User updated
 */
router.put('/user/:id', validateUserUpdateSchema, authMiddleware, checkAbility('update', 'User'), updateUser);

/**
 * @swagger
 * /admin/user/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID user
 *     responses:
 *       204:
 *         description: User deleted
 */
router.delete('/user/:id', authMiddleware, checkAbility('delete', 'User'), deleteUser);

/**
 * @swagger
 * /admin/user/add-role:
 *   post:
 *     summary: Add a role to a user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *                 example: 1
 *               role_id:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       201:
 *         description: Role added
 */
router.post('/user/add-role', validateUserRoleSchema, authMiddleware, checkAbility('create', 'User'), addRole);

/**
 * @swagger
 * /admin/user/remove-role:
 *   post:
 *     summary: Delete a role from a user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *                 example: 1
 *               role_id:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Role removed
 */
router.post('/user/remove-role', validateUserRoleSchema, authMiddleware, checkAbility('create', 'User'), removeRole);


/**
 * @swagger
 * /admin/user/add-project:
 *   post:
 *     summary: Add a project to a user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *                 example: 1
 *               project_id:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Project added
 */
router.post('/user/add-project', validateUserProjectSchema, authMiddleware, checkAbility('create', 'User'), addProject);


/**
 * @swagger
 * /admin/user/remove-project:
 *   post:
 *     summary: Delete a project from a user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *                 example: 1
 *               project_id:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Project removed
 */
router.post('/user/remove-project', authMiddleware, checkAbility('create', 'User'), removeProject);

export default router;
