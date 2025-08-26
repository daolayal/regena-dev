import {Router, Request, Response} from 'express';

const router = Router();

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Check the service health status
 *     tags: [Health]
 *     security: []
 *     responses:
 *       200:
 *         description: Service is up and running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "UP"
 */
router.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'UP' });
});


export default router;
