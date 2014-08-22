export interface Callbacks {
    writeMessage(message: any): void;
    readPeerConnectedMessage(address: string): void;
    readPeerDisconnectedMessage(address: string): void;
    readRelayMessage(address: string, message: string): void;
    readRelayedMessage(address: string, message: string): void;
}
export declare var PROTOCOL_NAME: string;
export declare class Protocol {
    public MESSAGE_TYPE: {
        DIRECT: number;
        PEER_CONNECTED: number;
        PEER_DICONNECTED: number;
        RELAY: number;
        RELAYED: number;
    };
    private callbacks;
    constructor(callbacks: Callbacks);
    public readMessage(message: any): void;
    public writeDirect(content: string): void;
    public writeConnected(address: string): void;
    public writeDisconnected(address: string): void;
    public writeRelay(address: string, content: string): void;
    public writeRelayed(address: string, content: string): void;
}
