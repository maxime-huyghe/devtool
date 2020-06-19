export type Credentials = {
    server: string;
    port: string;
    instance: string;
    domain: string;
    userName: string;
    password: string;
    database: string;
    useInstanceName: boolean;
    useTLSv1: boolean;
    useNTLM: boolean;
    encrypt: boolean;
};