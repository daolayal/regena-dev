export interface IVectorQuery {
    kind: string;
    vector: number[];
    fields: string;
    k: number;
    filter?: string;
    exhaustive: boolean;
}
