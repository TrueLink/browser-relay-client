import connection = require("./connection");
import event = require("./event");
import connectionManager = require("./connection-manager");
import wsConn = require("./websocket-connection");
export interface ConnectionManager extends connectionManager.ConnectionManager<connection.API> {
}
export interface API {
    guid: string;
    connect(address: string): wsConn.API;
    disconnect(address: string): void;
    connections: connection.API[];
    onConnected: event.Event<connection.API>;
    onDisconnected: event.Event<connection.API>;
}
export declare class APIImpl implements API {
    private _guid;
    private _manager;
    private _onConnected;
    private _onDisconnected;
    private _connect;
    private _disconnect;
    constructor(options: {
        guid: string;
        manager: ConnectionManager;
        connect: (address: string) => wsConn.API;
        disconnect: (address: string) => void;
        onConnected: event.Event<connection.API>;
        onDisconnected: event.Event<connection.API>;
    });
    public connect(address: string): wsConn.API;
    public disconnect(address: string): void;
    public guid : string;
    public connections : connection.API[];
    public onConnected : event.Event<connection.API>;
    public onDisconnected : event.Event<connection.API>;
}
export declare class Hub {
    private peers;
    private _guid;
    private onConnected;
    private onDisconnected;
    constructor(guid: string, peers: ConnectionManager);
    private getApi();
    static create(guid: string, options?: {}): API;
    public connect(address: string): wsConn.API;
    public isConnected(address: string): boolean;
    public disconnect(address: string): void;
}
