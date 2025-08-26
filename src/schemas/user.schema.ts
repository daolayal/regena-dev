import { checkSchema } from 'express-validator';

export const validateUserSchema = checkSchema({
    azure_id: {
        in: ['body'],
        isUUID: {
            errorMessage: 'azure_id must be a valid UUID',
        },
    },
    email: {
        in: ['body'],
        isEmail: {
            errorMessage: 'Invalid email format',
        },
        normalizeEmail: true,
    },
    name: {
        in: ['body'],
        optional: true,
        isString: {
            errorMessage: 'Name must be a string',
        },
        isLength: {
            options: { min: 1, max: 100 },
            errorMessage: 'Name must be between 1 and 100 characters',
        },
        trim: true,
    },
});

export const validateUserUpdateSchema = checkSchema({
    azure_id: {
        in: ['body'],
        optional: true,
        isUUID: {
            errorMessage: 'azure_id must be a valid UUID',
        },
    },
    email: {
        in: ['body'],
        optional: true,
        isEmail: {
            errorMessage: 'Invalid email format',
        },
        normalizeEmail: true,
    },
    name: {
        in: ['body'],
        optional: true,
        isString: {
            errorMessage: 'Name must be a string',
        },
        isLength: {
            options: { min: 1, max: 100 },
            errorMessage: 'Name must be between 1 and 100 characters',
        },
        trim: true,
    },
});

export const validateUserRoleSchema = checkSchema({
    user_id: {
        in: ['body'],
        isInt: {
            errorMessage: 'user_id must be an integer',
        },
        toInt: true,
    },
    role_id: {
        in: ['body'],
        isInt: {
            errorMessage: 'role_id must be an integer',
        },
        toInt: true,
    },
});

export const validateUserProjectSchema = checkSchema({
    user_id: {
        in: ['body'],
        isInt: {
            errorMessage: 'user_id must be an integer',
        },
        toInt: true,
    },
    project_id: {
        in: ['body'],
        isInt: {
            errorMessage: 'project_id must be an integer',
        },
        toInt: true,
    },
});
