import axios from 'axios';
import prisma from '../prisma';
import {config} from "../config/config";
import {IUser} from "../models/IUser";
import {IMessage} from "../models/IMessage";
import {IMessageResponse} from "../models/MessageResponse";
import {IChatHistory} from "../models/IChatHistory";
import {getCurrentTime} from "../tools/current-time.tool";
import {semanticSearch} from "../tools/search.tool";
import {getCatalogTree} from "../tools/catalog-tree.tool";
import {searchConfluence} from "../tools/confluence-search.tool";
import {getDatabaseSchema} from "../tools/postgres.tool";
import {multiIndexSearch} from "../tools/multi-index.tool";
import {getMermaidText} from "../tools/mermaid.tool";
import {getFileContent} from "../tools/read-file.tool";
import {getProjectMetadata} from "../tools/get-project-metadata.tool";
import {askQuestion, createClient} from "../tools/copilot-agent.tool";
import {Activity, CardAction} from "@microsoft/agents-activity";

const MODEL = "gpt-4o";

const OPENAI_ENDPOINT = `${config.azureOpenAiUrl}/openai/deployments/reverse-engineering-gpt4o/chat/completions?api-version=2025-01-01-preview`;
const PARAMETERS = {
    temperature: 0.2,
    top_p: 0.9,
    presence_penalty: 0.5,
    frequency_penalty: 0.0,
};

export async function processMessage(socket: any, message: IMessage, project: any, sessionId: string, user: IUser): Promise<IMessageResponse> {

    let request = message.text;
    const reformulatedPrompt = await reformulate(request);
    const sensitiveInfoResponse = "This application is not designed to answer questions requesting sensitive information.";
    const outOfScopeResponse = "This question is outside the scope of this application, which is designed for the IT domain.";
    if (reformulatedPrompt.includes(sensitiveInfoResponse) || reformulatedPrompt.includes(outOfScopeResponse)) {
        const chatHistory = await chatHistoryLog(message.text, reformulatedPrompt, sessionId, user.id, project.id);
        return {id: chatHistory.id, message: reformulatedPrompt, documents: [], followup: [],  mermaid: ""};
    }
    const tools = await prisma.tools.findMany(
        {
            where: {
                enabled: true
            }
        });

    const toolsSchemas = tools.map((tool:any) => tool.schema);
    const filteredToolsSchemas = toolsSchemas.filter(tool => {
        // If multi_index_search is available, exclude semantic_vector_search
        if (toolsSchemas.some((t) => t.function?.name === "multi_index_search")) {
            return tool.function?.name !== "semantic_vector_search";
        }
        return true;
    });
    const recentHistory = await getChatHistoryContext(sessionId);
    const historyMessages = recentHistory.flatMap(item => [
        {role: 'user', content: item.request},
        {role: 'assistant', content: item.response}
    ]);
    const internMessages  = [
        { role: "system", content: message.prompt },
        ...historyMessages,
        { role: "user", content: reformulatedPrompt },
    ];
    const toolCallMessage = await callOpenAi(internMessages, filteredToolsSchemas, "auto");
    internMessages.push(toolCallMessage);

    const docs: any[] =[];
    let mermaid: string ='';


    if (toolCallMessage.tool_calls?.length) {
        for (const toolCall of toolCallMessage.tool_calls) {


            console.log(toolCall);
            const args = JSON.parse(toolCall.function.arguments);
            if (toolCall.function.name === "get_current_time") {
                const result = getCurrentTime(args.location);
                internMessages.push({
                    // @ts-ignore
                    tool_call_id: toolCall.id,
                    role: "tool",
                    name: "get_current_time",
                    content: JSON.stringify(result),
                });
            }

            if (toolCall.function.name === "semantic_vector_search") {
                const projectSearchIndex: string = project.SearchIndex[0].name;
                const result = await semanticSearch(args.query, projectSearchIndex);
                internMessages.push({
                    // @ts-ignore
                    tool_call_id: toolCall.id,
                    role: "tool",
                    name: "semantic_vector_search",
                    content: JSON.stringify(result),
                });
                docs.push(...result.documents);
            }
            if (toolCall.function.name === "multi_index_search" ) {
                const projectSearchIndexList: string[] = project.SearchIndex.map((index: any) => index.name);
                const result = await multiIndexSearch(args.query, projectSearchIndexList);
                internMessages.push({
                    // @ts-ignore
                    tool_call_id: toolCall.id,
                    role: "tool",
                    name: "multi_index_search",
                    content: JSON.stringify(result),
                });
                docs.push(...result.documents);
            }
            if (toolCall.function.name === "get_structure_tree") {
                const projectSearchIndex: number = project.SearchIndex[0];
                console.log(projectSearchIndex);
                const result = await getCatalogTree(projectSearchIndex);
                internMessages.push({
                    // @ts-ignore
                    tool_call_id: toolCall.id,
                    role: "tool",
                    name: "get_structure_tree",
                    content: JSON.stringify(result),
                });
            }
            if (toolCall.function.name === "confluence_search") {
                const result = await searchConfluence(args.query);
                internMessages.push({
                    // @ts-ignore
                    tool_call_id: toolCall.id,
                    role: "tool",
                    name: "confluence_search",
                    content: JSON.stringify(result),
                });
            }
            if (toolCall.function.name === "get_structure_postgresql") {
                const result = await getDatabaseSchema();
                console.log(result);
                internMessages.push({
                    // @ts-ignore
                    tool_call_id: toolCall.id,
                    role: "tool",
                    name: "get_structure_postgresql",
                    content: JSON.stringify(result),
                });
            }

            if (toolCall.function.name === "mermaid" ) {
                const { description, diagramType } = args;
                const result = await getMermaidText(description, diagramType);
                internMessages.push({
                    // @ts-ignore
                    tool_call_id: toolCall.id,
                    role: "tool",
                    name: "mermaid",
                    content: JSON.stringify(result),
                });
                mermaid = result.mermaidText;
            }

            if (toolCall.function.name === "get_file_content") {
                const projectSearchIndex: number = project.SearchIndex[0];
                const result = await getFileContent(projectSearchIndex, args.filePath);

                internMessages.push({
                    tool_call_id: toolCall.id,
                    role: "tool",
                    name: "get_file_content",
                    content: JSON.stringify(result),
                } as any);
            }

            if (toolCall.function.name === "get_project_metadata") {
                const result = await getProjectMetadata(project.id);
                const instruction = await prisma.prompts.findFirst({
                    where: {
                        key: "project_overview"
                    }
                });
                const systemMessage = internMessages.find(msg => msg.role === "system");
                if (systemMessage && instruction && instruction.prompt) {
                    systemMessage.content = instruction.prompt;
                } else {
                    console.warn("System message or instruction 'project_overview' not found.");
                }
                internMessages.push({
                    tool_call_id: toolCall.id,
                    role: "tool",
                    name: "get_project_metadata",
                    content: JSON.stringify(result),
                } as any);
            }

            if (toolCall.function.name === "copilot_agent") {

                const copilotClient = await createClient()
                const act: Activity = await copilotClient.startConversationAsync(true)
                console.log('\nSuggested Actions: ')
                act.suggestedActions?.actions.forEach((action: CardAction) => console.log(action.value))
                const result = await askQuestion(copilotClient, act.conversation?.id!, args.query)
                console.log(result)
                internMessages.push({
                    tool_call_id: toolCall.id,
                    role: "tool",
                    name: "copilot_agent",
                    content: JSON.stringify(result),
                } as any);
            }
        }
        const tooledMessage = await callOpenAi(internMessages);
        const chatHistory = await chatHistoryLog(message.text, tooledMessage.content, sessionId, user.id, project.id);
        const followUpQuestions = await generateFollowUpQuestions(chatHistory.session_id.toString());
        const result = `>Reformulated request: ${reformulatedPrompt} \n\n \n\n${tooledMessage.content}`
        return {id: chatHistory.id, message: result, documents: docs, followup: followUpQuestions, mermaid: mermaid};
    }
    // else if (recentHistory.length == 0) {
    //     const projectSearchIndex: string = project.SearchIndex[0].name;
    //     const result = await semanticSearch(reformulatedPrompt, projectSearchIndex);
    //     internMessages.push({
    //         // @ts-ignore
    //         role: "tool",
    //         name: "semantic_vector_search",
    //         content: JSON.stringify(result),
    //     } as any);
    //     docs.push(...result.documents);
    // }
    const chatHistory = await chatHistoryLog(message.text, toolCallMessage.content, sessionId, user.id, project.id);
    const followUpQuestions = await generateFollowUpQuestions(chatHistory.session_id.toString());
    return {id: chatHistory.id, message: toolCallMessage.content, documents: docs, followup: followUpQuestions, mermaid: mermaid};
}


async function chatHistoryLog(request: string, response: string, sessionId: string, userId: number, projectId: number) {
    if (sessionId == "") {
        const session = await prisma.session.create({
            data: {
                name: request,
                user_id: userId,
                project_id: projectId
            },
        });
        sessionId = String(session.id)
    }
    return prisma.chatHistory.create({
        data: {
            session_id: Number(sessionId),
            user_id: userId,
            request: request,
            response: response,
        }
    });
}


async function reformulate(prompt: string): Promise<string> {
    const instruction = await prisma.prompts.findFirst({
        where: {
            key: "reformulator_instruction"
        }
    });
    if (!instruction) {
        return "Could not find the instruction for reformulation, please contact the administrator.";
    }
    const payload = {
        messages: [
            {role: "system", content: instruction.prompt},
            {role: "user", content: `Here is the question to reformulate: ${prompt}`}
        ],
    };
    try {
        const response = await axios.post(OPENAI_ENDPOINT, payload, {
            headers: {
                "api-key": config.azureOpenAiKey,
                "Content-Type": "application/json",
            },
        });
        return response.data.choices?.[0]?.message?.content || prompt;
    } catch (error) {
        console.error('Error in reformulateInput:', error);
        return prompt;
    }
}


async function callOpenAi(messages: any[], tools?: any[], tool_choice?: string) {
    const payload: any = {
        model: MODEL,
        messages,
        ...PARAMETERS,
    };
    if (tools) payload.tools = tools;
    if (tool_choice) payload.tool_choice = tool_choice;
    const response = await axios.post(OPENAI_ENDPOINT, payload, {
        headers: {
            "api-key": config.azureOpenAiKey,
            "Content-Type": "application/json",
        },
    });

    return response.data.choices[0].message;
}

async function getChatHistoryContext(sessionId: string): Promise<IChatHistory[]> {
    let history: IChatHistory[] = await prisma.chatHistory.findMany({
        where: {
            session_id: Number(sessionId),
            feedback: 'positive'
        },
        orderBy: {id: 'desc'},
        take: 10,
    });
    if (history.length == 0) {
        history = await prisma.chatHistory.findMany({
            where: {
                session_id: Number(sessionId),
                feedback: 'empty'
            },
            orderBy: {id: 'desc'},
            take: 3,
        });
    }
    return history.reverse();
}

async function generateFollowUpQuestions(sessionId: string): Promise<string[]> {
    const recentHistory = await getChatHistoryContext(sessionId);
    const historyMessages = recentHistory.flatMap(item => [
        {role: 'user', content: item.request},
        {role: 'assistant', content: item.response}
    ]);
    const followup_instruction = await prisma.prompts.findFirst({
        where: {
            key: "generate_followup"
        }
    });
    if (!followup_instruction) {
        return [];
    }
    try {
        const payload = {
            messages: [
                {role: "system", content: followup_instruction.prompt},
                ...historyMessages,
                {role: "user", content: 'Generate follow-up questions based on the conversation so far.'},
            ],
        };
        const response = await axios.post(OPENAI_ENDPOINT, payload, {
            headers: {
                "api-key": config.azureOpenAiKey,
                "Content-Type": "application/json",
            },
        });
        const rawContent = response.data.choices[0].message.content;
        let followUpQuestions: string[] = [];
        try {
            followUpQuestions = JSON.parse(rawContent).map((q: string) => (q));
        } catch (parseError) {
            return [];
        }
        return followUpQuestions;
    } catch (error) {
        console.error('Error in generateFollowUpQuestions', error);
        return [];
    }
}
