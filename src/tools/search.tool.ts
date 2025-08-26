import {config} from "../config/config";
import {IVectorQuery} from "../models/IVectorQuery";
import axios from "axios";

const SEARCH_TOP = 10;

export const semanticSearch = async (query: string, searchIndexName: string) => {
    const searchEndpoint = `${config.azureSearchEndpoint}/indexes/${searchIndexName}/docs/search?api-version=2024-07-01`;
    const vector = await getEmbeddingForText(query);
    const vectorQuery: IVectorQuery = {
        kind: "vector",
        vector: vector,
        fields: "text_vector",
        k: 10,
        exhaustive: true
    };
    const payload = {
        search: query,
        top: SEARCH_TOP,
        count: true,
        queryType: "semantic",
        semanticConfiguration: `${searchIndexName}-semantic-configuration`,
        captions: "extractive|highlight-true",
        answers: "extractive|count-3",
        highlightPreTag: "<strong>",
        highlightPostTag: "</strong>",
        select: "title,chunk,path",
        vectorQueries: [vectorQuery]
    };
    try {
        const response = await axios.post(searchEndpoint, payload, {
            headers: {
                "Content-Type": "application/json",
                "api-key": config.azureSearchApiKey
            }
        });
        const documents = response.data.value || [];
        const answers = response.data["@search.answers"] || null;
        return {documents, answers, query};
    } catch (error) {
        console.error('Error in callSearchSemantic:', error);
        return {documents: [], answers: []};
    }
}


const getEmbeddingForText = async (text: string): Promise<number[]> => {
    const url = `${config.azureOpenAiUrl}/openai/deployments/ada-embedding/embeddings?api-version=2023-05-15`;
    const model = "text-embedding-ada-002";
    try {
        const response = await axios.post(url, {
                input: text,
                model: model
            },
            {headers: {"api-key": config.azureOpenAiKey}}
        );
        return response.data.data[0].embedding;
    } catch (error) {
        console.error("Error in getEmbeddingForText:", error);
        throw error;
    }
}
