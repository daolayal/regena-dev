import { checkSchema } from 'express-validator';

export const validateRoleSchema = checkSchema({
    name: {
        in: ['body'],
        isString: {
            errorMessage: 'Role name must be a string',
        },
        isLength: {
            options: { min: 1, max: 100 },
            errorMessage: 'Role name must be between 1 and 100 characters',
        },
        trim: true,
    },
});

export const validateRoleUpdateSchema = checkSchema({
    name: {
        in: ['body'],
        optional: true,
        isString: {
            errorMessage: 'Role name must be a string',
        },
        isLength: {
            options: { min: 1, max: 100 },
            errorMessage: 'Role name must be between 1 and 100 characters',
        },
        trim: true,
    },
});

export const validateRolePermissionSchema = checkSchema({
    role_id: {
        in: ['body'],
        isInt: {
            errorMessage: 'role_id must be an integer',
        },
        toInt: true,
    },
    permission_id: {
        in: ['body'],
        isInt: {
            errorMessage: 'permission_id must be an integer',
        },
        toInt: true,
    },
});

