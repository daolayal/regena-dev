import express from 'express';
import {ssoLogin} from "../controllers/auth.controller";

const router = express.Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: SSO Login
 *     description: Authenticate via SSO using an accessToken.
 *     tags:
 *       - Authentication
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               accessToken:
 *                 type: string
 *                 description: JWT access token obtained from the authentication provider
 *                 example: "eyJ0eXAiOiJKV1QiLCJub25jZSI6ImEwTnZ..."
 *     responses:
 *       200:
 *         description: Successfully authenticated
 */
router.post('/login', ssoLogin);

export default router;
