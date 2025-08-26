import {config} from "../config/config";
import {AzureSearchClient} from "../adapters/AzureSearchClient";
import {QueueServiceClient, ReceivedMessageItem} from "@azure/storage-queue";
import prisma from "../prisma";
import {decodeMessage} from "./common/queue";
import {IQueueMessage} from "../models/IQueueMessage";

const connectionString: string = config.storageAccountConnectionString as string;
// const queueNameFinished: string = config.queueNameFinished as string;
const queueNameFinished: string = `${config.queueNameFinished}-${process.env.NODE_ENV}`;

const queueServiceClient = QueueServiceClient.fromConnectionString(connectionString);
const queueClientFinished = queueServiceClient.getQueueClient(queueNameFinished);

async function processMessage(message: ReceivedMessageItem): Promise<{ indexId: number }> {
    const decodedMessage = await decodeMessage<IQueueMessage>(message.messageText);
    console.log("IndexerConsumer: Raw messageText received:", message.messageText); // Log raw message
    console.log(decodedMessage);
    const index = await prisma.searchIndex.findUnique({
        where: {
            id: decodedMessage.indexId
        },
        select: {
            project_id: true,
            name: true,
            datasource: true,
            index: true,
            indexer: true,
            skillset: true,
        },
    });
    if (!index) {
        throw new Error(`Index with ID ${decodedMessage.indexId} not found.`);
    }
    if (!index.datasource || !index.index || !index.skillset || !index.indexer) {
        throw new Error(`Index is not correctly configuration ${decodedMessage.indexId}`);
    }
    const client = new AzureSearchClient({
        serviceUrl: config.azureSearchEndpoint,
        apiKey: config.azureSearchApiKey
    });
    await client.createDataSource(index.datasource);
    await client.createIndex(index.index);
    await client.createSkillset(index.skillset);
    await client.createIndexer(index.indexer);
    return {indexId: decodedMessage.indexId};
}

async function consumeMessages(): Promise<void> {
    try {
        const response = await queueClientFinished.receiveMessages({
            numberOfMessages: 1,
            visibilityTimeout: 30
        });

        if (response.receivedMessageItems.length > 0) {
            for (const message of response.receivedMessageItems) {
                console.log("New message to index creation:", message);

                try {
                    const { indexId } = await processMessage(message);

                    await prisma.searchIndex.update({
                        where: { id: Number(indexId) },
                        data: { status: "SUCCESS" },
                    });

                    await queueClientFinished.deleteMessage(message.messageId, message.popReceipt);
                } catch (err: any) {
                    if( err.message?.includes("429")) {
                        if (message.dequeueCount >= 10) {
                            console.error("Message has been retried too many times, deleting it", message);
                            await queueClientFinished.deleteMessage(message.messageId, message.popReceipt);
                            continue;
                        }else{
                            console.error("Request failed with code 429, likely rate limit exceeded or too many requests, retrying message. \n", err);
                        }
                    }else if (err.message?.includes("not found")) {
                        console.error("Index not found, removing message from queue", err);
                        await queueClientFinished.deleteMessage(message.messageId, message.popReceipt);
                    }
                }
            }
        }
    } catch (error) {
        console.error("error consuming messages", error);
        
    }
}

export async function startIndexerConsumer(): Promise<void> {
    setInterval(consumeMessages, 5000);
}
