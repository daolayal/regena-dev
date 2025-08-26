import { checkSchema } from 'express-validator';

export const validateToolSchema = checkSchema({
    name: {
        in: ['body'],
        isString: {
            errorMessage: 'Name must be a string',
        },
        optional: true,
    },
    description: {
        in: ['body'],
        isString: {
            errorMessage: 'Description must be a string',
        },
        optional: true,
    },
    schema: {
        in: ['body'],
        custom: {
            options: (value) => {
                if (typeof value !== 'object' || value === null || Array.isArray(value)) {
                    throw new Error('Schema must be a JSON object');
                }
                return true;
            },
        },
        optional: true,
    },
    enabled: {
        in: ['body'],
        isBoolean: {
            errorMessage: 'Enabled must be a boolean',
        },
        optional: true,
    }
});
