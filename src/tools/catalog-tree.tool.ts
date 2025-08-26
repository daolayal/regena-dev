import {BlobServiceClient} from "@azure/storage-blob";
import {config} from "../config/config";
import {TreeNode} from "../models/project";
import {PrismaClient} from "@prisma/client";
const prisma = new PrismaClient();

export const getCatalogTree = async (ind: any) => {

    // @ts-ignore
    const index = await prisma.searchIndex.findFirst({
        where: {name: ind.name},
    });

    if (!index) {
        throw new Error("Index not found");
    }

    if (index.structure) {
        return index.structure
    }

    const blobServiceClient = BlobServiceClient.fromConnectionString(config.storageAccountConnectionString);
    // @ts-ignore
    const containerClient = blobServiceClient.getContainerClient(index.blob_name);
    const blobs = containerClient.listBlobsFlat();
    const tree: TreeNode = {name: "/", type: "folder", children: []};
    for await (const blob of blobs) {
        addToTree(tree, blob.name);
    }

    const updated = await prisma.searchIndex.update({
        where: {id: Number(index.id)},
        data: {
            structure: tree
        }
    });
    return updated.structure;
};

function addToTree(root: TreeNode, path: string) {
    const parts = path.split("/");
    let current = root;
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const isFile = i === parts.length - 1 && !path.endsWith("/");
        let existing = current.children?.find((child) => child.name === part);
        if (!existing) {
            existing = {
                name: part,
                type: isFile ? "file" : "folder",
                ...(isFile ? {} : {children: []})
            };
            current.children?.push(existing);
        }
        if (!isFile) {
            current = existing as TreeNode;
        }
    }
}
