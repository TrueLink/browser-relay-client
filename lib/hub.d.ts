import connection = require("./connection");
import event = require("./event");
import connectionManager = require("./connection-manager");
import wsConn = require("./websocket-connection");
export interface ConnectionManager extends connectionManager.ConnectionManager<connection.API> {
}
export interface API {
    connect(address: string): wsConn.API;
    connections: connection.API[];
    onConnected: event.Event<connection.API>;
    onDisconnected: event.Event<connection.API>;
}
export declare class APIImpl implements API {
    private _manager;
    private _onConnected;
    private _onDisconnected;
    private _connect;
    constructor(options: {
        manager: ConnectionManager;
        connect: (address: string) => wsConn.API;
        onConnected: event.Event<connection.API>;
        onDisconnected: event.Event<connection.API>;
    });
    public connect(address: string): wsConn.API;
    public connections : connection.API[];
    public onConnected : event.Event<connection.API>;
    public onDisconnected : event.Event<connection.API>;
}
export declare class Hub {
    private peers;
    private onConnected;
    private onDisconnected;
    constructor(peers: ConnectionManager);
    private getApi();
    static create(options?: {}): API;
    public connect(address: string): wsConn.API;
}
