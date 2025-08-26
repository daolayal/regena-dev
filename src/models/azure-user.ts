export interface AzureUserInterface {
    "@odata.context": string;
    businessPhones: string[];
    displayName: string;
    givenName?: string;
    jobTitle?: string;
    mail?: string;
    mobilePhone?: string;
    officeLocation?: string | null;
    preferredLanguage?: string | null;
    surname?: string;
    userPrincipalName: string;
    id: string;
}
