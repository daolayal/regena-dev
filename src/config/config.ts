import dotenv from 'dotenv';

dotenv.config();

export const config = {
    storageAccountConnectionString: process.env.STORAGE_ACCOUNT_CONNECTION_STRING || '',
    containerName: process.env.AZURE_CONTAINER_NAME || '',
    queueName: process.env.AZURE_QUEUE_NAME || 'uploads',
    queueNameFinished: process.env.AZURE_QUEUE_NAME_FINISHED || 'finished-uploads',
    fileSizeLimitMb: process.env.FILE_SIZE_LIMIT_MB || 1000,
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://root:toor@localhost:5432/regena?schema=public',


    tenantId: process.env.AZURE_TENANT_ID,
    clientId: process.env.AZURE_CLIENT_ID,
    clientSecret: process.env.AZURE_CLIENT_SECRET,

    jwtSecret: process.env.JWT_SECRET || 'JWT_SECRET',

    microsoftSsoUrl: process.env.MICROSOFT_SSO_URL || 'https://graph.microsoft.com/v1.0/me',

    azureSearchEndpoint: process.env.AZURE_SEARCH_ENDPOINT || '',
    azureSearchApiKey: process.env.AZURE_SEARCH_API_KEY || '',

    azureOpenAiUrl: process.env.AZURE_OPEN_AI_URL || '',
    azureOpenAiKey: process.env.AZURE_OPEN_AI_KEY || '',

    cleanerDefaultIgnore: process.env.REGENA_DEFAULT_IGNORE || '',
};
