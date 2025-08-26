import { checkSchema } from 'express-validator';

export const validateUploadRequest = checkSchema({
    project_id: {
        in: ['body'],
        isInt:  {
            errorMessage: 'Project name must be a integer',
        },
        trim: true,
    },
});
