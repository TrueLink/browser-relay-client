export interface Callbacks {
    writeMessage(message: any): void;
    readPeerConnectedMessage(endpoint: string): void;
    readPeerDisconnectedMessage(endpoint: string): void;
    readIdentificationMessage(endpoint: string): void;
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
    };
    private callbacks;
    constructor();
    public setReactions(callbacks: Callbacks): void;
    public readMessage(message: any): void;
    public writeDirect(content: string): void;
    public writeConnected(endpoint: string): void;
    public writeDisconnected(endpoint: string): void;
    public writeIdentification(endpoint: string): void;
    public writeRelay(targetEndpoint: string, content: string): void;
    public writeRelayed(sourceEndpoint: string, content: string): void;
}
