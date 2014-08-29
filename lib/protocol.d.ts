export interface Callbacks {
    writeMessage(message: any): void;
    readPeerConnectedMessage(endpoint: string): void;
    readPeerDisconnectedMessage(endpoint: string): void;
    readAddRoutesMessage(table: any): void;
    readIdentificationMessage(authority: string, endpoint: string): void;
    readRelayMessage(targetEndpoint: string, message: string): void;
    readRelayedMessage(sourceEndpoint: string, message: string): void;
}
export declare var PROTOCOL_NAME: string;
export declare class Protocol {
    public MESSAGE_TYPE: {
        DIRECT: number;
        PEER_CONNECTED: number;
        PEER_DICONNECTED: number;
        IDENTIFY: number;
        RELAY: number;
        RELAYED: number;
        ADD_ROUTES: number;
    };
    private callbacks;
    constructor();
    public setReactions(callbacks: Callbacks): void;
    public readMessage(message: any): void;
    public writeDirect(content: string): void;
    public writeConnected(endpoint: string): void;
    public writeDisconnected(endpoint: string): void;
    public writeAddRoutes(table: any): void;
    public writeIdentification(authority: string, endpoint: string): void;
    public writeRelay(targetEndpoint: string, content: string): void;
    public writeRelayed(sourceEndpoint: string, content: string): void;
}
