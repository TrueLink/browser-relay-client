export interface EventEmitter {
    on(event: string, listener: Function): EventEmitter;
    removeListener(event: string, listener: Function): EventEmitter;
    emit(event: string, ...args: any[]): boolean;
}
export interface EventEmitterFactory {
    new(): EventEmitter;
}
export interface IConnection {
    address: string;
}
export declare class ConnectionManager<T extends IConnection> {
    private connectionMap;
    private connectionList;
    private emitter;
    static EventEmitter: EventEmitterFactory;
    public on(event: string, listener: (conn: T) => void): void;
    public off(event: string, listener: (conn: T) => void): void;
    constructor();
    public get(): T[];
    public get(address: string): T;
    public add(connection: T): boolean;
    public remove(connection: T): boolean;
}
