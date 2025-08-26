import {Request, Response, NextFunction} from 'express';
import {defineAbilitiesFor} from '../rbac/define-abilities';
import {AppAbility} from '../rbac/define-abilities';
import {JwtUser} from "../models/jwt-user";


export function checkAbility(action: string, subject: string) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {

            const user: JwtUser | undefined = <JwtUser>req.user;

            if (!user) {
                res.status(401).json({error: 'Unauthorized'});

                return;
            }

            const ability: AppAbility = await defineAbilitiesFor(user.id);

            if (!ability.can(action, subject)) {
                res.status(403).json({error: 'Forbidden'});
                return;
            }

            req.ability = ability;

            next();
        } catch (error) {
            console.error('Error in checkAbility middleware:', error);
            res.status(500).json({error: 'Internal Server Error'});
        }
    };
}
