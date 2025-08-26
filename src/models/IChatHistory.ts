export interface IChatHistory {
    id: number;
    created_at: Date;
    user_id: number;
    session_id: number;
    request: string | null;
    response: string | null;
    feedback: any;
}
