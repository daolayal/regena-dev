import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface ProjectMetadataOutput {
    projectDescription: string | null;
    indexDescription: string | null;
    indexStructure: string | null;
}

export const getProjectMetadata = async (projectId: number): Promise<ProjectMetadataOutput> => {
    try {
        const project = await prisma.project.findUnique({
            where: {
                id: projectId
            },
            select: {
                description: true
            }
        });

        if (!project) {
            return { projectDescription: null, indexDescription: null, indexStructure: null };
        }
        const projectDescription = project.description || "No project description available.";
        const index = await prisma.searchIndex.findMany({     
            where: {
                project_id: projectId
            },
            select: {
                description: true,
                structure: true 
            }
        });
        const indexDescription = index
            .map((item, i) => `IndexDescription ${i + 1}: ${item.description}`)
            .join('\n\n');

        const indexStructure = index
            .map((item, i) => `IndexStructure ${i + 1}: ${JSON.stringify(item.structure)}`)
            .join('\n\n');

        return { projectDescription, indexDescription, indexStructure };

    } catch (error) {
        console.error(`Error fetching project and index info for project ID ${projectId}:`, error);
        return {
            projectDescription: "Error fetching project description.",
            indexDescription: "Error fetching index description.",
            indexStructure: "Error fetching index structure."
        };
    }
};