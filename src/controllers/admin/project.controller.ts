import {Request, Response} from 'express';
import {PrismaClient} from '@prisma/client';
import {validationResult} from "express-validator";
import logger from "../../logger";
import {BlobServiceClient} from "@azure/storage-blob";
import {config} from "../../config/config";
import {v4 as uuidv4} from "uuid";
import {AzureSearchClient} from "../../adapters/AzureSearchClient";
import fs from 'fs/promises';
import StreamZip from 'node-stream-zip';
import {QueueServiceClient } from "@azure/storage-queue";


const prisma = new PrismaClient();
// const queueName: string = config.queueName as string;
const queueName: string = `${config.queueName}-${process.env.NODE_ENV}`;
const connectionString: string = config.storageAccountConnectionString as string;
const queueServiceClient = QueueServiceClient.fromConnectionString(connectionString);
const queueClient = queueServiceClient.getQueueClient(queueName);

const removeSpecialCharsAndSpaces = (projectName: string): string => {
    return projectName.replace(/[^A-Za-zА-Яа-я0-9]/g, '');
}

export const getAllProjects = async (req: Request, res: Response) => {
    try {

        // @ts-ignore
        const { skip, take, page, limit } = req.pagination!;

        const [projects, total] = await Promise.all([
            prisma.project.findMany({ skip, take }),
            prisma.project.count(),
        ]);

        const totalPages = Math.ceil(total / limit);

        res.json({
            data: projects,
            meta: {
                total,
                page,
                limit,
                totalPages,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Error while getting projects'});
    }
}

export const getProjectById = async (req: Request, res: Response) => {
    try {
        const project = await prisma.project.findUnique({
            where: {id: Number(req.params.id)},
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                UserProject: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
                SearchIndex: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        blob_name: true,
                        status: true,
                        created_at: true,
                    },
                },
            },
        });

        res.json(project);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Error while getting project'});
    }
}

export const uploadProject = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({errors: errors.array()});
        return;
    }
    const project = await prisma.project.findUnique({
        where: {id: Number(req.body.project_id)},
    });
    if (!project) {
        res.status(404).json({error: 'Project not found'});
        return;
    }
    let projectName = removeSpecialCharsAndSpaces(project.name);
    const file = req.file;
    if (!file) {
        res.status(400).json({error: 'file is required'});
        return;
    }
    logger.info(`File uploaded successfully: ${file.originalname}`);
    const uid = uuidv4();


    const indexName = `index-${projectName}-${uid}`;
    const containerName = `regena-${projectName}-${uid}`.toLowerCase();


    const searchIndex = await prisma.searchIndex.create({
        data: {
            project_id: project.id,
            name: indexName,
            description: req.body.description,
            blob_name: containerName
        },
    });


    res.status(200).json({
        message: 'Processing started',
        project_name: project.name,
    });

    setImmediate(async () => {

        try {
            const blobServiceClient = BlobServiceClient.fromConnectionString(config.storageAccountConnectionString);
            const containerClient = blobServiceClient.getContainerClient(containerName);
            await containerClient.create();


            const zip = new StreamZip.async({ file: file.path });
            const entries = await zip.entries();
            const uploadPromises: Promise<any>[] = [];

            for (const entryName in entries) {
                const entry = entries[entryName];
                if (entry.isDirectory) continue;
                const entryBlobClient = containerClient.getBlockBlobClient(entry.name);
                const nodeStream = await zip.stream(entry.name);

                uploadPromises.push(
                    // @ts-ignore
                    entryBlobClient.uploadStream(nodeStream, undefined, undefined, {
                        blobHTTPHeaders: { blobContentType: 'application/octet-stream' }
                    })
                );
            }

            await Promise.all(uploadPromises);
            await zip.close();

            const client = new AzureSearchClient({
                serviceUrl: config.azureSearchEndpoint,
                apiKey: config.azureSearchApiKey
            });

            const dataSourceName = `datasource-${projectName}-${uid}`
            const dataSource = {
                "name": dataSourceName,
                "description": "Azure Blob Storage",
                "type": "azureblob",
                "subtype": null,
                "credentials": {
                    "connectionString": config.storageAccountConnectionString
                },
                "container": {
                    "name": containerName
                },
                "dataChangeDetectionPolicy": null,
                "dataDeletionDetectionPolicy": null
            };

            const index = {
                "name": indexName,
                "fields": [
                    {
                        "name": "chunk_id",
                        "type": "Edm.String",
                        "searchable": true,
                        "filterable": false,
                        "retrievable": true,
                        "stored": true,
                        "sortable": true,
                        "facetable": false,
                        "key": true,
                        "analyzer": "keyword",
                        "synonymMaps": []
                    },
                    {
                        "name": "parent_id",
                        "type": "Edm.String",
                        "searchable": false,
                        "filterable": true,
                        "retrievable": true,
                        "stored": true,
                        "sortable": false,
                        "facetable": false,
                        "key": false,
                        "synonymMaps": []
                    },
                    {
                        "name": "chunk",
                        "type": "Edm.String",
                        "searchable": true,
                        "filterable": false,
                        "retrievable": true,
                        "stored": true,
                        "sortable": false,
                        "facetable": false,
                        "key": false,
                        "synonymMaps": []
                    },
                    {
                        "name": "title",
                        "type": "Edm.String",
                        "searchable": true,
                        "filterable": false,
                        "retrievable": true,
                        "stored": true,
                        "sortable": false,
                        "facetable": false,
                        "key": false,
                        "synonymMaps": []
                    },
                    {
                        "name": "text_vector",
                        "type": "Collection(Edm.Single)",
                        "searchable": true,
                        "filterable": false,
                        "retrievable": true,
                        "stored": true,
                        "sortable": false,
                        "facetable": false,
                        "key": false,
                        "dimensions": 1536,
                        "vectorSearchProfile": `${indexName}-azureOpenAi-text-profile`,
                        "synonymMaps": []
                    },
                    {
                        "name": "path",
                        "type": "Edm.String",
                        "searchable": false,
                        "filterable": true,
                        "retrievable": true,
                        "stored": true,
                        "sortable": false,
                        "facetable": false,
                        "key": false,
                        "synonymMaps": []
                    }
                ],
                "scoringProfiles": [],
                "suggesters": [],
                "analyzers": [],
                "tokenizers": [],
                "tokenFilters": [],
                "charFilters": [],
                "similarity": {
                    "@odata.type": "#Microsoft.Azure.Search.BM25Similarity"
                },
                "semantic": {
                    "defaultConfiguration": `${indexName}-semantic-configuration`,
                    "configurations": [
                        {
                            "name": `${indexName}-semantic-configuration`,
                            "prioritizedFields": {
                                "titleField": {
                                    "fieldName": "title"
                                },
                                "prioritizedContentFields": [
                                    {
                                        "fieldName": "chunk"
                                    }
                                ],
                                "prioritizedKeywordsFields": []
                            }
                        }
                    ]
                },
                "vectorSearch": {
                    "algorithms": [
                        {
                            "name": `${indexName}-algorithm`,
                            "kind": "hnsw",
                            "hnswParameters": {
                                "metric": "cosine",
                                "m": 4,
                                "efConstruction": 400,
                                "efSearch": 500
                            }
                        }
                    ],
                    "profiles": [
                        {
                            "name": `${indexName}-azureOpenAi-text-profile`,
                            "algorithm": `${indexName}-algorithm`,
                            "vectorizer": `${indexName}-azureOpenAi-text-vectorizer`
                        }
                    ],
                    "vectorizers": [
                        {
                            "name": `${indexName}-azureOpenAi-text-vectorizer`,
                            "kind": "azureOpenAI",
                            "azureOpenAIParameters": {
                                "resourceUri": config.azureOpenAiUrl,
                                "deploymentId": "ada-embedding",
                                "apiKey": config.azureOpenAiKey,
                                "modelName": "text-embedding-ada-002"
                            }
                        }
                    ],
                    "compressions": []
                }
            };

            const skillsetName = `skillset-${projectName}-${uid}`;
            const skillset =  {
                "name": skillsetName,
                "description": "Skillset to chunk documents and generate embeddings",
                "skills": [
                    {
                        "@odata.type": "#Microsoft.Skills.Text.SplitSkill",
                        "name": "#1",
                        "description": "Split skill to chunk documents",
                        "context": "/document",
                        "defaultLanguageCode": "en",
                        "textSplitMode": "pages",
                        "maximumPageLength": 1600,
                        "pageOverlapLength": 240,
                        "maximumPagesToTake": 0,
                        "inputs": [
                            {
                                "name": "text",
                                "source": "/document/content",
                                "inputs": []
                            }
                        ],
                        "outputs": [
                            {
                                "name": "textItems",
                                "targetName": "pages"
                            }
                        ]
                    },
                    {
                        "@odata.type": "#Microsoft.Skills.Text.AzureOpenAIEmbeddingSkill",
                        "name": "#2",
                        "context": "/document/pages/*",
                        "resourceUri": config.azureOpenAiUrl,
                        "apiKey": config.azureOpenAiKey,
                        "deploymentId": "ada-embedding",
                        "dimensions": 1536,
                        "modelName": "text-embedding-ada-002",
                        "inputs": [
                            {
                                "name": "text",
                                "source": "/document/pages/*",
                                "inputs": []
                            }
                        ],
                        "outputs": [
                            {
                                "name": "embedding",
                                "targetName": "text_vector"
                            }
                        ]
                    }
                ],
                "indexProjections": {
                    "selectors": [
                        {
                            "targetIndexName": indexName,
                            "parentKeyFieldName": "parent_id",
                            "sourceContext": "/document/pages/*",
                            "mappings": [
                                {
                                    "name": "text_vector",
                                    "source": "/document/pages/*/text_vector",
                                    "inputs": []
                                },
                                {
                                    "name": "chunk",
                                    "source": "/document/pages/*",
                                    "inputs": []
                                },
                                {
                                    "name": "title",
                                    "source": "/document/title",
                                    "inputs": []
                                },
                                {
                                    "name": "path",
                                    "source": "/document/metadata_storage_path",
                                    "inputs": []
                                }
                            ]
                        }
                    ],
                    "parameters": {
                        "projectionMode": "skipIndexingParentDocuments"
                    }
                }
            };
            const indexer = {
                "name": `indexer-${projectName}-${uid}`,
                "dataSourceName": dataSourceName,
                "targetIndexName": indexName,
                "description": null,
                "skillsetName": skillsetName,
                "disabled": null,
                "schedule": null,
                "parameters": {
                    "batchSize": null,
                    "maxFailedItems": 1000,
                    "maxFailedItemsPerBatch": null,
                    "base64EncodeKeys": null,
                    "configuration": {
                        "dataToExtract": "contentAndMetadata",
                        "parsingMode": "text",
                        "failOnUnsupportedContentType": false,
                        "failOnUnprocessableDocument": false
                    }
                },
                "fieldMappings": [
                    {
                        "sourceFieldName": "metadata_storage_name",
                        "targetFieldName": "title",
                        "mappingFunction": null
                    }
                ],
                "outputFieldMappings": [],
                "encryptionKey": null
            };

            await prisma.searchIndex.update({
                where: {id: searchIndex.id},
                data: {
                    status: 'SUCCESS',
                    index: index,
                    datasource: dataSource,
                    skillset: skillset,
                    indexer: indexer
                }
            });

            await fs.unlink(file.path);

            const messageObj = {indexId: searchIndex.id, blobName: containerName};

            const messageBody = JSON.stringify(messageObj);
            const base64Message = Buffer.from(messageBody, "utf8").toString("base64");
            await queueClient.sendMessage(base64Message);

        } catch (error: any) {
            console.log(error);
            logger.error(error);
        }

    });



}


