import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import { UserRepository } from '../repositories/user.repository';
import { AzureUserInterface } from '../models/azure-user';

export async function ssoLogin(req: Request, res: Response) {
    const { accessToken } = req.body;

    if (!accessToken) {
        res.status(400).json({ error: 'No access token provided' });
        return;
    }

    try {
        const response = await fetch("https://graph.microsoft.com/v1.0/me", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            }
        });

        const userData: AzureUserInterface = <AzureUserInterface>await response.json();

        if (!userData.id) {
            res.status(401).json({ error: 'Invalid access token' });
            return;
        }

        const userRepository = new UserRepository();
        let user = await userRepository.findByAzureId(userData.id);

        if (!user) {
            user = await userRepository.create({
                azure_id: userData.id,
                email: userData.mail || userData.userPrincipalName,
                name: userData.displayName
            });
        }

        const localToken = jwt.sign(
            {
                id: user.id,
                email: user.email,
                name: user.name,
            },
            process.env.JWT_SECRET!,
            { expiresIn: '14d' }
        );

        res.json({ accessToken: localToken });
    } catch (error) {
        res.status(401).json({ error: 'Token validation failed', details: error });
    }

    return;
}
