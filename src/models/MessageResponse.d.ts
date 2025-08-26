export interface IMessageResponse {
  id: number;
  message: string;
  documents: any[];
  followup: string[];
  mermaid: string;
}
