import protocol = require('./protocol');
import event = require("./event");
export interface API {
    endpoint: string;
    close(): void;
    connected(remoteAddr: string): void;
    disconnected(remoteAddr: string): void;
    onIdentified: event.Event<string>;
    onConnected: event.Event<string>;
    onDisconnected: event.Event<string>;
}
export interface Callbacks {
    writeMessageData(message: any): void;
    getEndpoint(): string;
}
export declare class Connection extends protocol.Protocol implements protocol.Callbacks {
    private _endpoint;
    private _transport;
    private onIdentified;
    private onConnected;
    private onDisconnected;
    constructor(transport: Callbacks);
    public getApi(): API;
    public readMessageData(data: string): void;
    public writeMessage(message: any): void;
    public readPeerConnectedMessage(endpoint: string): void;
    public readPeerDisconnectedMessage(endpoint: string): void;
    public readIdentificationMessage(endpoint: string): void;
    public readRelayMessage(targetEndpoint: string, message: any): void;
    public readRelayedMessage(sourceEndpoint: string, message: any): void;
}
