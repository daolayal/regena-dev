import { Router } from 'express';
import {
    getProjects,
    createProject,
    updateProject,
    deleteProject,
    addToolToProject,
    removeToolFromProject,
} from '../controllers/project.controller';
import {authMiddleware} from "../middlewares/auth.middleware";
import {checkAbility} from "../middlewares/check-ability.middleware";

const router = Router();

/**
 * @swagger
 * /api/project:
 *   get:
 *     summary: Retrieve projects for current user
 *     description: Retrieves all projects of a user. Requires authentication and proper permissions.
 *     tags:
 *       - Project
 *     responses:
 *       200:
 *         description: Successfully retrieved the projects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get('/', authMiddleware, checkAbility('get', 'Project'), getProjects);

/**
 * @swagger
 * /api/project:
 *   post:
 *     summary: Create a new project
 *     description: Creates a new project attached to the current user. Requires authentication and proper permissions.
 *     tags:
 *       - Project
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description: 
 *                 type: string   
 *             example:
 *               name: "New Project"
 *               description: "Description of the project"
 *     responses:
 *       201:
 *         description: Project successfully created
 */
router.post('/', authMiddleware, checkAbility('create', 'Project'), createProject);


/**
 * @swagger
 * /api/project/{id}:
 *   put:
 *     summary: Update an existing project
 *     description: Updates a project with the specified ID. Requires proper permissions.
 *     tags:
 *       - Project
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the project to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Project successfully updated
 */
router.put('/:id', authMiddleware, checkAbility('update', 'Project'), updateProject);

/**
 * @swagger
 * /api/project/{id}:
 *   delete:
 *     summary: Delete a project
 *     description: Deletes the project with the specified ID. Requires proper permissions.
 *     tags:
 *       - Project
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the project to delete
 *     responses:
 *       200:
 *         description: Project successfully deleted
 */
router.delete('/:id',  authMiddleware, checkAbility('delete', 'Project'),  deleteProject);

/**
 * @swagger
 * /api/project/add-tool:
 *   post:
 *     description: Adds a tool to a project
 *     tags:
 *       - Project
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               project_id:
 *                 type: number
 *               tool_id:
 *                 type: number
 *     responses:
 *       201:
 *         description: Tool successfully attached to project
 */
router.post('/add-tool', authMiddleware, checkAbility('create', 'Project'), addToolToProject);

/**
 * @swagger
 * /api/project/remove-tool:
 *   post:
 *     description: Detaches a tool from a project
 *     tags:
 *       - Project
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               project_id:
 *                 type: number
 *               tool_id:
 *                 type: number
 *     responses:
 *       201:
 *         description: Tool successfully detached from project
 */
router.post('/remove-tool', authMiddleware, checkAbility('create', 'Project'), removeToolFromProject);


export default router;
