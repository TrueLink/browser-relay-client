import protocol = require('./protocol');
import event = require("./event");
export interface IdentificationData {
    authority: string;
    endpoint: string;
}
export interface ConnectionAPI {
    endpoint: string;
    close(): void;
    connected(remoteAddr: string): void;
    disconnected(remoteAddr: string): void;
    addroutes(routes: any): void;
    onIdentified: event.Event<IdentificationData>;
    onConnected: event.Event<string>;
    onDisconnected: event.Event<string>;
    onRoutesReceived: event.Event<any>;
}
export interface Callbacks {
    writeMessageData(message: any): void;
    getEndpoint(): string;
}
export declare class Connection extends protocol.Protocol implements protocol.Callbacks {
    private _endpoint;
    private _transport;
    private _onIdentified;
    private _onConnected;
    private _onDisconnected;
    private _onRoutesReceived;
    constructor();
    public setTransport(transport: Callbacks): void;
    public getApi(): ConnectionAPI;
    public readMessageData(data: string): void;
    public writeMessage(message: any): void;
    public readPeerConnectedMessage(endpoint: string): void;
    public readPeerDisconnectedMessage(endpoint: string): void;
    public readAddRoutesMessage(table: any): void;
    public readIdentificationMessage(authority: string, endpoint: string): void;
    public readRelayMessage(targetEndpoint: string, message: any): void;
    public readRelayedMessage(sourceEndpoint: string, message: any): void;
}
