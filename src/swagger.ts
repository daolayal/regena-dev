import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import basicAuth from 'express-basic-auth';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API Docs',
            version: '1.0.0',
            description: 'Regena API Documentation',
        },
        servers: [
            {
                url: 'http://localhost:8080',
                description: 'Development server',
            },
            {
                url: 'https://regenaapi-apfcdka4dghghkgk.westeurope-01.azurewebsites.net',
                description: 'Production server',
            },
            {
                url: 'https://regenaapi-stage-h7ezb2eeh4crhtgx.westeurope-01.azurewebsites.net',
                description: 'Staging server',
            },
        ],
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                BearerAuth: [],
            },
        ],
    },
    apis: [
        './src/routes/*.ts',
        './src/routes/admin/*.ts'
    ],

};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
    app.use('/api-docs',
        basicAuth({
            users: { 'admin': 'P@assword123!' },
            challenge: true,
        }),
        swaggerUi.serve,
        swaggerUi.setup(specs)
    );
};
