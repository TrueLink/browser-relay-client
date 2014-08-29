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

export class APIImpl implements API {
    private _guid: string;
    private _manager: ConnectionManager;

    private _onConnected: event.Event<connection.API>;
    private _onDisconnected: event.Event<connection.API>;
    private _connect: (address: string) => wsConn.API;
    private _disconnect: (address: string) => void;

    constructor(options: {
        guid: string;
        manager: ConnectionManager;
        connect: (address: string) => wsConn.API;
        disconnect: (address: string) => void;
        onConnected: event.Event<connection.API>;
        onDisconnected: event.Event<connection.API>;
    }) {
        this._guid = options.guid;
        this._manager = options.manager;
        this._onConnected = options.onConnected;
        this._onDisconnected = options.onDisconnected;
        this._connect = options.connect;
        this._disconnect = options.disconnect;
    }

    public connect(address: string): wsConn.API {
        return this._connect(address);
    }

    public disconnect(address: string): void {
        this._disconnect(address);
    }

    public get guid(): string {
        return this._guid;
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

export class Hub {
    private peers: ConnectionManager;
    private _guid: string;

    private onConnected: event.Event<connection.API>;
    private onDisconnected: event.Event<connection.API>;

    constructor(guid: string, peers: ConnectionManager) {
        this.peers = peers; 
        this._guid = guid;

        this.onConnected = new event.Event<connection.API>();
        this.onDisconnected = new event.Event<connection.API>();

        this.peers.onAdd.on((connection) => {
            this.onConnected.emit(connection);
        });

        this.peers.onRemove.on((connection) => {
            this.onDisconnected.emit(connection);
        });

        this.onConnected.on((connection) => {
            console.log('peer connected: ' + connection.endpoint + " (" + this.peers.length + ")");
            this.peers.get().forEach(function (other) {
                if (other === connection) return;
                connection.connected(other.endpoint);
                other.connected(connection.endpoint);
            });
        });

        this.onDisconnected.on((connection) => {
            console.log('peer disconnected: ' + connection.endpoint + " (" + this.peers.length + ")");
            this.peers.get().forEach(function (other) {
                if (other === connection) return;
                other.disconnected(connection.endpoint);
            });
        });
    }

    private getApi(): API {
        return new APIImpl({
            guid: this._guid,
            connect: this.connect.bind(this),
            disconnect: this.disconnect.bind(this),
            manager: this.peers,
            onConnected: this.onConnected,
            onDisconnected: this.onDisconnected,
        });
    }

    static create(guid: string, options: {
    } = {}): API {
        var manager = new connectionManager.ConnectionManager<connection.API>();

        var hub = new Hub(guid, manager);

        return hub.getApi();
    }

    public connect(address: string): wsConn.API {
        var peer = wsConn.WebSocketConnection.create(address);

        peer.onOpen.on(() => {
            this.peers.add(peer);
        });

        peer.onClose.on((event) => {
            this.peers.remove(peer);
        });

        return peer;
    }

    public isConnected(address: string): boolean {
        return this.peers.get(address) !== undefined
    }

    public disconnect(address: string): void {
        var peer = this.peers.get(address);
        peer.close();
    }
}
