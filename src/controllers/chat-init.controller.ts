import {PrismaClient} from '@prisma/client';
import { Request, Response } from "express";
import { IInitChat } from "../models/IInitChat";
import axios from 'axios';
import {config} from "../config/config";
const prisma = new PrismaClient();

const MODEL = "gpt-4o";
const OPENAI_ENDPOINT = `${config.azureOpenAiUrl}/openai/deployments/reverse-engineering-gpt4o/chat/completions?api-version=2025-01-01-preview`;
const PARAMETERS = {
    temperature: 0.2,
    top_p: 0.9,
    presence_penalty: 0.5,
    frequency_penalty: 0.0,
};

const STATIC_PROJECT_IDS = [1, 2, 22, 24, 26 ];
const STATIC_QUESTIONS = [
    "Provide a brief overview of the project.",
    "Summarise the catalog structure of the project.",
    "Describe the key features and functionalities of the project.",
    "List the technologies used in the project."
];

export const getGeneralQuestions = async (req: Request, res: Response) => {
    try {
        const projectIdString = req.params.project_id;
        if (!projectIdString) {
            res.status(400).json({ error: "Project ID is required." });
            return;
        }
        const projectId = Number(projectIdString);

        if (STATIC_PROJECT_IDS.includes(projectId)) {
            const responseData: IInitChat = { generalQuestion: STATIC_QUESTIONS };
            res.status(200).json(responseData);
            return;
        }

        const projectDescription = await getProjectDescription(projectId);
        const indexDescription = await getIndexDescription(projectId);
        const toolsDescription = await getEnabledToolsDescription();

        const descriptions = [
            {role: "user", content: `Project Description:\n${projectDescription}`},
            {role: "user", content: `Index Description:\n${indexDescription}`},
            {role: "user", content: `Tool Description:\n${toolsDescription}`}
        ];

        const instruction = await prisma.prompts.findFirst({
            where: {
             key: "general_question"
            }
        });
        if (!instruction) {
            res.status(400).json({ error: 'Failed to load instruction for general question.'});
            return;
        }
        const payload = {
            messages: [
                {role: "system", content: instruction.prompt},
                ...descriptions,
                {role: "user", content: `Suggest 4 general questions analysing the context of the descriptions provided.`},
            ],
            ...PARAMETERS,
            model: MODEL,
        };
        const response = await axios.post(OPENAI_ENDPOINT, payload, {
            headers: {
                "api-key": config.azureOpenAiKey,
                "Content-Type": "application/json",
            },
        });
        const rawContent = response.data.choices[0].message.content;
        if (!rawContent) {
            res.status(400).json({ error: 'No content received from OpenAI for general questions'});
            return;
        }

        let generatedQuestions: string[] = [];
        generatedQuestions = JSON.parse(rawContent).map((q: string) => (q));
        const responseData: IInitChat = { generalQuestion: generatedQuestions };
        res.status(201).json(responseData);

    } catch (error) {
        res.status(401).json({ error: 'Unexpected error', details: error });
    }
};

async function getProjectDescription(projectId: number): Promise<string> {
    const project = await prisma.project.findUnique({
        where: {
            id: projectId
        },
        select: {
            description: true
        },
    });
    return project?.description || "";
}

async function getIndexDescription(projectId: number): Promise<string> {
    const index = await prisma.searchIndex.findMany({
        where: {
            project_id: projectId
        },
        select: {
            description: true
        },
    });
    const indexDescriptions = index
        .map((item, i) => `Index ${i + 1}: ${item.description}`)
        .join('\n\n');
    return indexDescriptions || "";
}

async function getEnabledToolsDescription(): Promise<string> {
    const tools = await prisma.tools.findMany({
        where: {
            enabled: true,
        },
        select: {
            description: true,
        },
    });

    const toolDescriptions = tools
        .map((item, i) => `Tool ${i + 1}: ${item.description}`)
        .join('\n\n');
    return toolDescriptions || "";
}
