import {Request, Response} from 'express';
import {PrismaClient} from '@prisma/client';
import {JwtUser} from "../models/jwt-user";
import {TreeNode} from "../models/project";
import { BlobServiceClient } from "@azure/storage-blob";
import {config} from "../config/config";

const prisma = new PrismaClient();


export const getProjects = async (req: Request, res: Response) => {
    try {

        const user: JwtUser = <JwtUser>req.user;

        const projects = await prisma.project.findMany({
            where: {
                UserProject: {
                    some: {
                        user_id: user.id,
                    },
                },
            },
            include: {
                SearchIndex: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        res.json(projects);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Error while getting projects'});
    }
}


export const createProject = async (req: Request, res: Response) => {

    try {
        const user: JwtUser = <JwtUser>req.user;
        const {name, description} = req.body;

        const newProject = await prisma.project.create({
            data: {
                name,
                description,
                owner_id: user.id,
            },
        });

        await prisma.userProject.create({
            data: {
                user_id: user.id,
                project_id: newProject.id,
            },
        });

        res.status(201).json(newProject);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Error while creating project record'});
    }
};

export const updateProject = async (req: Request, res: Response) => {

    try {
        const {id} = req.params;
        const {name, description, owner_id} = req.body;

        const updatedProject = await prisma.project.update({
            where: {id: Number(id)},
            data: {name, description, owner_id},
        });

        res.json(updatedProject);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Error while updating project'});
    }
};

export const deleteProject = async (req: Request, res: Response) => {

    try {
        const {id} = req.params;

        await prisma.project.delete({where: {id: Number(id)}});

        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Error while deleting project record'});
    }
};

export const addToolToProject = async (req: Request, res: Response) => {
    try {
        const {projectId, toolId} = req.body;
        await prisma.projectTools.create({
            data: {
                project_id: projectId,
                tool_id: toolId,
            },
        });

        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Error while adding tool to project'});
    }
}

export const removeToolFromProject = async (req: Request, res: Response) => {
    try {
        const {projectId, toolId} = req.body;
        await prisma.projectTools.deleteMany({
            where: {
                project_id: projectId,
                tool_id: toolId,
            },
        });

        res.status(204).send();
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Error while removing tool from project'});
    }
}

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

export const getProjectStructure = async (req: Request, res: Response) => {
    const { indexId } = req.params;

    if (!indexId) {
         res.status(400).json({ error: "indexId is required" });
         return
    }

    try {
        const index = await prisma.searchIndex.findUnique({
            where: { id: Number(indexId) }
        });

        if (!index) {
             res.status(404).json({ error: "Index not found" });
             return;
        }

        if (!index.blob_name){
            res.status(404).json({ error: "Index not configured yet" });
            return;
        }

        if (index.structure) {
            res.json(index.structure);
            return;
        }

        const blobServiceClient = BlobServiceClient.fromConnectionString(config.storageAccountConnectionString);
        const containerClient = blobServiceClient.getContainerClient(index.blob_name);
        const blobs = containerClient.listBlobsFlat();
        const tree: TreeNode = { name: "/", type: "folder", children: [] };
        for await (const blob of blobs) {
            addToTree(tree, blob.name);
        }

        const updated = await prisma.searchIndex.update({
            where: { id: Number(indexId) },
            data: {
                structure: tree
            }
        });

         res.json(updated.structure);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
};
