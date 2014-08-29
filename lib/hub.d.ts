import connection = require("./connection");
import event = require("./event");
import connectionManager = require("./connection-manager");
import wsConn = require("./websocket-connection");
export interface ConnectionManager extends connectionManager.ConnectionManager<connection.ConnectionAPI> {
}
export interface HubAPI {
    guid: string;
    connect(address: string): wsConn.WebSocketConnectionAPI;
    disconnect(address: string): void;
    connections: connection.ConnectionAPI[];
    onConnected: event.Event<connection.ConnectionAPI>;
    onDisconnected: event.Event<connection.ConnectionAPI>;
}
export declare class HubAPIImpl implements HubAPI {
    private _guid;
    private _manager;
    private _onConnected;
    private _onDisconnected;
    private _connect;
    private _disconnect;
    constructor(options: {
        guid: string;
        manager: ConnectionManager;
        connect: (address: string) => wsConn.WebSocketConnectionAPI;
        disconnect: (address: string) => void;
        onConnected: event.Event<connection.ConnectionAPI>;
        onDisconnected: event.Event<connection.ConnectionAPI>;
    });
    public connect(address: string): wsConn.WebSocketConnectionAPI;
    public disconnect(address: string): void;
    public guid : string;
    public connections : connection.ConnectionAPI[];
    public onConnected : event.Event<connection.ConnectionAPI>;
    public onDisconnected : event.Event<connection.ConnectionAPI>;
}
export declare class Hub {
    private _peers;
    private _routing;
    private _guid;
    private onConnected;
    private onDisconnected;
    constructor(guid: string, peers: ConnectionManager);
    private getApi();
    static create(guid: string, options?: {}): HubAPI;
    public connect(address: string): wsConn.WebSocketConnectionAPI;
    public isConnected(address: string): boolean;
    public disconnect(address: string): void;
}
