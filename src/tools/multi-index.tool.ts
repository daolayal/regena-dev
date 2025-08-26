import {semanticSearch} from "./search.tool";

//Use semantic search tool on every index and take 10 best chunks across them
export const multiIndexSearch = async(query: string, searchIndexList: string[]) => {
    // All indices results
    const searchResults = await Promise.all(searchIndexList.map(async (searchIndex) => {
        try {
            const result = await semanticSearch(query, searchIndex);
            return {documents: result.documents || [], answers: result.answers};
        } catch (error) {
            return {documents: [], answers: null, query: query};
        }
    }));

    const allDocuments = searchResults.map(result => result.documents).flat();
    const allAnswers = searchResults.map(result => result.answers).flat();

    // Sort by reranker score or search score
    const sortedDocuments = allDocuments.sort((a, b) => {
        return (b['@search.rerankerScore'] || 0) - 
               (a['@search.rerankerScore'] || 0);
    });

    const sortedAnswers = allAnswers.sort((a, b) => {
        return (b['score'] || 0) - 
               (a['score'] || 0);
    });
    
    const topResults = sortedDocuments.slice(0, 10);
    const topAnswers = sortedAnswers.slice(0, 10);
    return {
        documents: topResults,
        answers: topAnswers, 
        query: query
    };
}