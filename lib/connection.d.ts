﻿import protocol = require('./protocol');
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
    writeMessage(message: any): void;
}
export declare class Connection extends protocol.Protocol implements protocol.Callbacks {
    private address;
    private peers;
    public emitter: EventEmitter;
    static EventEmitter: EventEmitterFactory;
    constructor(address: string, peers: IManager);
    static create(address: string, peers: IManager): API;
    public getApi(): API;
    public readMessageData(data: string): void;
    public writeMessage(message: any): void;
    public readPeerConnectedMessage(destination: string): void;
    public readPeerDisconnectedMessage(destination: string): void;
    public readRelayMessage(destination: string, message: any): void;
    public readRelayedMessage(destination: string, message: any): void;
}