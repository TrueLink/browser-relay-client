import protocol = require('./protocol');
export interface API {
    address: string;
}
export interface ConnectionsManager {
    get(destination: string): API;
}
export interface Callbacks {
    writeMessageData(message: any): void;
}
export declare class Connection extends protocol.Protocol implements protocol.Callbacks {
    private address;
    private peers;
    private transport;
    constructor(transport: Callbacks, address: string, peers: ConnectionsManager);
    public getApi(): API;
    public readMessageData(data: string): void;
    public writeMessage(message: any): void;
    public readPeerConnectedMessage(destination: string): void;
    public readPeerDisconnectedMessage(destination: string): void;
    public readRelayMessage(destination: string, message: any): void;
    public readRelayedMessage(destination: string, message: any): void;
}
