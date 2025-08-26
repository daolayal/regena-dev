import { checkSchema } from 'express-validator';

export const validatePromptSchema = checkSchema({
    key: {
        in: ['body'],
        optional: false,
        isString: {
            errorMessage: 'key must be a string',
        },
        isLength: {
            options: { min: 1, max: 50 },
            errorMessage: 'Key must be between 1 and 50 characters',
        },
        trim: true,
    },
    prompt: {
        in: ['body'],
        optional: false,
        isString: {
            errorMessage: 'prompt must be a string',
        },
    },
});

export const validatePromptUpdateSchema = checkSchema({
    key: {
        in: ['body'],
        isString: {
            errorMessage: 'key must be a string',
        },
        isLength: {
            options: { min: 1, max: 50 },
            errorMessage: 'Key must be between 1 and 50 characters',
        },
        trim: true,
    },
    prompt: {
        in: ['body'],
        isString: {
            errorMessage: 'prompt must be a string',
        },
    },
});
