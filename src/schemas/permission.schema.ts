import { checkSchema } from 'express-validator';

export const validatePermissionSchema = checkSchema({
    action: {
        in: ['body'],
        isString: {
            errorMessage: 'Action must be a string',
        },
        isLength: {
            options: { min: 1, max: 255 },
            errorMessage: 'Action must be between 1 and 255 characters',
        },
        trim: true,
    },
    subject: {
        in: ['body'],
        isString: {
            errorMessage: 'Subject must be a string',
        },
        isLength: {
            options: { min: 1, max: 255 },
            errorMessage: 'Subject must be between 1 and 255 characters',
        },
        trim: true,
    },
});

export const validatePermissionUpdateSchema = checkSchema({
    action: {
        in: ['body'],
        optional: true,
        isString: {
            errorMessage: 'Action must be a string',
        },
        isLength: {
            options: { min: 1, max: 255 },
            errorMessage: 'Action must be between 1 and 255 characters',
        },
        trim: true,
    },
    subject: {
        in: ['body'],
        optional: true,
        isString: {
            errorMessage: 'Subject must be a string',
        },
        isLength: {
            options: { min: 1, max: 255 },
            errorMessage: 'Subject must be between 1 and 255 characters',
        },
        trim: true,
    },
});
