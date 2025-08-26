export interface ITool {
    id?: number;
    name:  string;
    description: string
    schema: JsonValue
    enabled: boolean
    created_at?: Date
    updated_at?: Date
}
