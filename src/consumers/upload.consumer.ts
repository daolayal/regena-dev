import {QueueServiceClient} from "@azure/storage-queue";
import {BlobServiceClient, ContainerClient} from "@azure/storage-blob";
import {IQueueMessage} from "../models/IQueueMessage";
import {config} from "../config/config";
import {logger} from "../logger";
import prisma from "../prisma";
import ignore from 'ignore';
import {decodeMessage} from "./common/queue";

const connectionString: string = config.storageAccountConnectionString as string;
// const queueName: string = config.queueName as string;
// const queueNameFinished: string = config.queueNameFinished as string;

const queueName: string = `${config.queueName}-${process.env.NODE_ENV}`;
const queueNameFinished: string = `${config.queueNameFinished}-${process.env.NODE_ENV}`;

const queueServiceClient = QueueServiceClient.fromConnectionString(connectionString);
const queueClient = queueServiceClient.getQueueClient(queueName);
const queueClientFinished = queueServiceClient.getQueueClient(queueNameFinished);

function getDefaultIgnoreRules(): string[] {
    const raw = config.cleanerDefaultIgnore || "";
    return raw
        .split(",")
        .map(r => r.trim())
        .filter(Boolean);
}

async function getBlobText(containerClient: ContainerClient, blobName: string): Promise<string | null> {
    const blobClient = containerClient.getBlobClient(blobName);
    if (!(await blobClient.exists())) return null;
    const downloadResponse = await blobClient.download();
    const chunks: Buffer[] = [];
    for await (const chunk of downloadResponse.readableStreamBody!) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks).toString("utf-8");
}

export async function cleanBlobContainer(containerName: string): Promise<void> {
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const ig = ignore();
    const ignoreText = await getBlobText(containerClient, '.regenaignore');
    ig.add(ignoreText || getDefaultIgnoreRules());
    const blobBatchClient = blobServiceClient.getBlobBatchClient();
    const blobsToDelete: string[] = [];
    for await (const blob of containerClient.listBlobsFlat()) {
        if (ig.ignores(blob.name)) {
            blobsToDelete.push(blob.name);
        }
    }
    const BATCH_SIZE = 256;
    for (let i = 0; i < blobsToDelete.length; i += BATCH_SIZE) {
        const batch = blobsToDelete.slice(i, i + BATCH_SIZE);
        try {
            await blobBatchClient.deleteBlobs(batch.map(name => containerClient.getBlobClient(name)), {
                deleteSnapshots: 'include'
            });
            console.log(blobsToDelete);
            console.log(`Deleted ${batch.length} blobs`);
        } catch (err) {
            logger.error('Batch deletion error', err);
        }
    }
}

async function consumeMessages(): Promise<void> {
    try {
        const response = await queueClient.receiveMessages({
            numberOfMessages: 1,
            visibilityTimeout: 30
        });

        if (response.receivedMessageItems.length > 0) {
            for (const message of response.receivedMessageItems) {
                const decodedMessage: IQueueMessage = await decodeMessage<IQueueMessage>(message.messageText);
                console.log("New message to cleaning:", decodedMessage);

                if (!decodedMessage.blobName) {
                    logger.error("Blob name is missing");
                    await queueClient.deleteMessage(message.messageId, message.popReceipt);
                    continue;
                }

                await cleanBlobContainer(decodedMessage.blobName);

                try {
                    await prisma.searchIndex.update({
                        where: { id: decodedMessage.indexId },
                        data: { status: "IN_PROGRESS" }
                    });
                } catch (err: any) {
                    if (err.code === "P2025") {
                        logger.warn(`Record not found for indexId: ${decodedMessage.indexId}, deleting message`);
                        await queueClient.deleteMessage(message.messageId, message.popReceipt);
                        continue;
                    } else {
                        throw err; // перекидываем, если другая ошибка
                    }
                }

                await queueClientFinished.sendMessage(message.messageText);
                await queueClient.deleteMessage(message.messageId, message.popReceipt);
            }
        }
    } catch (error) {
        console.error("error consuming messages", error);
    }
}

export function startQueueConsumer(): void {
    setInterval(consumeMessages, 5000);
}