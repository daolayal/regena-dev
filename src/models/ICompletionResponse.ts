export interface ICompletionResponse {
    choices: Array<{
        message: { content: string };
    }>;
}
