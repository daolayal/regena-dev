import pino from 'pino';

export const logger = pino({
        level: 'debug',
        transport: {
            targets: [
                {
                    target: 'pino-pretty',
                },
                {
                    target: 'pino-pretty',
                    options: {
                        destination: "./logs/app.log",
                        colorize: false,
                    },
                }

            ],
        },
    },
);

export default logger;
