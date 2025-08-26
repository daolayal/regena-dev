import { checkSchema } from 'express-validator';

export const validateSearchIndexSchema = checkSchema({
    project_id: {
        in: ['body'],
        isInt: {
            errorMessage: 'Project ID must be an integer',
        },
        notEmpty: {
            errorMessage: 'Project ID is required',
        },
        optional: true,
    },
    name: {
        in: ['body'],
        isString: {
            errorMessage: 'Name must be a string',
        },
        notEmpty: {
            errorMessage: 'Name is required',
        },
        isLength: {
            options: { min: 1 },
            errorMessage: 'Name cannot be empty',
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
});
