import { BlobServiceClient } from "@azure/storage-blob";
import { config } from "../config/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getFileContent = async (ind: any, filePath: string): Promise<string> => {
    // Ищем запись индекса по имени
    // @ts-ignore
    const index = await prisma.searchIndex.findFirst({
        where: { name: ind.name },
    });

    if (!index) {
        throw new Error("Index not found");
    }


    const blobServiceClient = BlobServiceClient.fromConnectionString(
        config.storageAccountConnectionString
    );
    // @ts-ignore
    const containerClient = blobServiceClient.getContainerClient(index.blob_name);

    // Получаем клиент конкретного blob'а
    const blobClient = containerClient.getBlobClient(filePath);

    // Проверяем, что blob существует
    const exists = await blobClient.exists();
    if (!exists) {
        return `Blob "${filePath}" not found in container "${index.blob_name}"`;
    }

    // Скачиваем содержимое в буфер
    const buffer = await blobClient.downloadToBuffer();

    // Конвертируем буфер в строку (UTF-8)
    const content = buffer.toString("utf-8");
    return content;
};
