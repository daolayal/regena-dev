import axios, { AxiosInstance } from 'axios';

export interface AzureSearchConfig {
    serviceUrl: string;
    apiKey: string;
    apiVersion?: string;
}

export class AzureSearchClient {
    private axiosInstance: AxiosInstance;
    private apiVersion: string;

    constructor(private config: AzureSearchConfig) {
        this.apiVersion = config.apiVersion || '2024-07-01';
        const baseUrl = config.serviceUrl;

        this.axiosInstance = axios.create({
            baseURL: baseUrl,
            headers: {
                'Content-Type': 'application/json',
                'api-key': config.apiKey,
            },
        });
    }

    async createIndex(indexDefinition: any): Promise<any> {
        const url = `/indexes?api-version=${this.apiVersion}`;


        try {
            const response = await this.axiosInstance.post(url, indexDefinition);
            return response.data;
        } catch (error: any) {

            console.log(error);

            throw new Error(`Error creating index: ${error.message}`);
        }
    }

    async createDataSource(datasourceDefinition: any): Promise<any> {
        const url = `/datasources?api-version=${this.apiVersion}`;
        try {
            const response = await this.axiosInstance.post(url, datasourceDefinition);
            return response.data;
        } catch (error: any) {
            throw new Error(`Error creating data source: ${error.message}`);
        }
    }

    async createIndexer(indexerDefinition: any): Promise<any> {
        const url = `/indexers?api-version=${this.apiVersion}`;
        try {
            const response = await this.axiosInstance.post(url, indexerDefinition);
            return response.data;
        } catch (error: any) {
            throw new Error(`Error creating indexer: ${error.message}`);
        }
    }


    async createSkillset(skillsetDefinition: any): Promise<any> {
        const url = `/skillsets?api-version=${this.apiVersion}`;
        try {
            const response = await this.axiosInstance.post(url, skillsetDefinition);
            return response.data;
        } catch (error: any) {
            throw new Error(`Error creating skillset: ${error.message}`);
        }
    }
}
