import {Router} from 'express';
import {
    getAllProjects, getProjectById,
    uploadProject
} from '../../controllers/admin/project.controller';
import {authMiddleware} from "../../middlewares/auth.middleware";
import {checkAbility} from "../../middlewares/check-ability.middleware";
import {uploadSingleFile} from "../../middlewares/upload.middleware";
import {validateUploadRequest} from "../../schemas/upload-request.schema";
import {paginationMiddleware} from "../../middlewares/pagination.middleware";

const router = Router();

/**
 * @swagger
 * /admin/projects:
 *   get:
 *     summary: Retrieve all projects
 *     description: Retrieves all projects. Requires authentication and proper permissions.
 *     tags:
 *       - Project
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
 *         description: Successfully retrieved the projects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get('/projects', authMiddleware, checkAbility('get', 'AllProject'), paginationMiddleware, getAllProjects);

/**
 * @swagger
 * /admin/project/{id}:
 *   get:
 *     summary: Get a Project by ID
 *     tags: [Project]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID project
 *     responses:
 *       200:
 *         description: Information about the role
 */
router.get('/project/:id', authMiddleware, checkAbility('get', 'AllProject'), getProjectById);



/**
 * @swagger
 * /admin/project/upload:
 *   post:
 *     summary: Upload a file
 *     tags: [Project]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The file to be uploaded
 *               project_id:
 *                 type: string
 *               description: 
 *                 type: string
 *                 description: The description of the file being uploaded
 *     responses:
 *       200:
 *         description: File successfully uploaded and processed
 */
router.post('/project/upload', uploadSingleFile('file'), validateUploadRequest, uploadProject);

export default router;