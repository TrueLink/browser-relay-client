import connection = require("./connection");
import event = require("./event");
import connectionManager = require("./connection-manager");
export interface ConnectionManager extends connectionManager.ConnectionManager<connection.API> {
}
export interface API {
    connections: connection.API[];
    onConnected: event.Event<connection.API>;
    onDisconnected: event.Event<connection.API>;
}
export declare class APIImpl implements API {
    private _manager;
    private _onConnected;
    private _onDisconnected;
    constructor(options: {
        manager: ConnectionManager;
        onConnected: event.Event<connection.API>;
        onDisconnected: event.Event<connection.API>;
    });
    public connections : connection.API[];
    public onConnected : event.Event<connection.API>;
    public onDisconnected : event.Event<connection.API>;
}
