import protocol = require('./protocol');
import event = require("./event");
export interface API {
    id: string;
    address: string;
    close(): void;
    connected(remoteAddr: string): void;
    disconnected(remoteAddr: string): void;
    onIdentified: event.Event<string>;
    onConnected: event.Event<string>;
    onDisconnected: event.Event<string>;
}
export interface Callbacks {
    writeMessageData(message: any): void;
}
export declare class Connection extends protocol.Protocol implements protocol.Callbacks {
    private id;
    private address;
    private transport;
    private onIdentified;
    private onConnected;
    private onDisconnected;
    constructor(transport: Callbacks, address: string);
    public getApi(): API;
    public readMessageData(data: string): void;
    public writeMessage(message: any): void;
    public readPeerConnectedMessage(id: string): void;
    public readPeerDisconnectedMessage(id: string): void;
    public readIdentificationMessage(id: string): void;
    public readRelayMessage(destination: string, message: any): void;
    public readRelayedMessage(destination: string, message: any): void;
}
