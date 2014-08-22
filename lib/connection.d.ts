import protocol = require('./protocol');
export interface EventEmitter {
    on(event: string, listener: Function): EventEmitter;
    removeListener(event: string, listener: Function): EventEmitter;
    emit(event: string, ...args: any[]): boolean;
}
export interface EventEmitterFactory {
    new(): EventEmitter;
}
export interface API {
    address: string;
    on(event: string, listener: Function): EventEmitter;
    off(event: string, listener: Function): EventEmitter;
}
export interface IManager {
    get(destination: string): API;
}
export interface Callbacks {
    writeMessageData(message: any): void;
}
export declare class Connection extends protocol.Protocol implements protocol.Callbacks {
    private address;
    private peers;
    public emitter: EventEmitter;
    private transport;
    static EventEmitter: EventEmitterFactory;
    constructor(transport: Callbacks, address: string, peers: IManager);
    public getApi(): API;
    public readMessageData(data: string): void;
    public writeMessage(message: any): void;
    public readPeerConnectedMessage(destination: string): void;
    public readPeerDisconnectedMessage(destination: string): void;
    public readRelayMessage(destination: string, message: any): void;
    public readRelayedMessage(destination: string, message: any): void;
}
