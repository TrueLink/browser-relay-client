import connection = require("./connection");
import event = require("./event");
import connectionManager = require("./connection-manager");
import wsConn = require("./websocket-connection");

export interface ConnectionManager extends connectionManager.ConnectionManager<connection.API> {
}

export interface API {
    connections: connection.API[];
    onConnected: event.Event<connection.API>;
    onDisconnected: event.Event<connection.API>;
}

export class APIImpl implements API {
    private _manager: ConnectionManager;

    private _onConnected: event.Event<connection.API>;
    private _onDisconnected: event.Event<connection.API>;

    constructor(options: {
        manager: ConnectionManager;
        onConnected: event.Event<connection.API>;
        onDisconnected: event.Event<connection.API>;
    }) {
        this._manager = options.manager;
        this._onConnected = options.onConnected;
        this._onDisconnected = options.onDisconnected;
    }

    public get connections(): connection.API[] {
        return this._manager.get();
    }

    public get onConnected(): event.Event<connection.API> {
        return this._onConnected;
    }

    public get onDisconnected(): event.Event<connection.API> {
        return this._onDisconnected;
    }
}

class Hub {
    private peers: ConnectionManager;

    private onConnected: event.Event<connection.API>;
    private onDisconnected: event.Event<connection.API>;

    constructor(peers: ConnectionManager) {
        this.peers = peers; 

        this.onConnected = new event.Event<connection.API>();
        this.onDisconnected = new event.Event<connection.API>();

        this.peers.onAdd.on((peer) => {
            this.onConnected.emit(peer);
        });

        this.peers.onRemove.on((peer) => {
            this.onDisconnected.emit(peer);
        });
    }

    private getApi(): API {
        return new APIImpl({
            manager: this.peers,
            onConnected: this.onConnected,
            onDisconnected: this.onDisconnected,
        });
    }

    static create(options): API {
        var manager = new connectionManager.ConnectionManager<connection.API>();

        var hub = new Hub(manager);

        return hub.getApi();
    }

    public connect(address: string): wsConn.API {
        var peer = wsConn.WebSocketConnection.create(address, this.peers);

        peer.onClose.on((event) => {
            this.peers.remove(peer);
        });

        return peer;
    }
}
