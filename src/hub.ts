import connection = require("./connection");
import event = require("./event");
import connectionManager = require("./connection-manager");
import wsConn = require("./websocket-connection");
import routing = require("./routing-table");

export interface ConnectionManager extends connectionManager.ConnectionManager<connection.ConnectionAPI> {
}

export interface HubAPI {
    guid: string;
    connect(address: string): wsConn.WebSocketConnectionAPI;
    disconnect(address: string): void;
    connections: connection.ConnectionAPI[];
    onConnected: event.Event<connection.ConnectionAPI>;
    onDisconnected: event.Event<connection.ConnectionAPI>;
    onRoutingChanged: event.Event<any>;
}

export class HubAPIImpl implements HubAPI {
    private _guid: string;
    private _manager: ConnectionManager;

    private _onConnected: event.Event<connection.ConnectionAPI>;
    private _onDisconnected: event.Event<connection.ConnectionAPI>;
    private _onRoutingChanged: event.Event<any>;

    private _connect: (address: string) => wsConn.WebSocketConnectionAPI;
    private _disconnect: (address: string) => void;

    constructor(options: {
        guid: string;
        manager: ConnectionManager;
        connect: (address: string) => wsConn.WebSocketConnectionAPI;
        disconnect: (address: string) => void;
        onConnected: event.Event<connection.ConnectionAPI>;
        onDisconnected: event.Event<connection.ConnectionAPI>;
        onRoutingChanged: event.Event<any>;
    }) {
        this._guid = options.guid;
        this._manager = options.manager;
        this._onConnected = options.onConnected;
        this._onDisconnected = options.onDisconnected;
        this._onRoutingChanged = options.onRoutingChanged;
        this._connect = options.connect;
        this._disconnect = options.disconnect;
    }

    public connect(address: string): wsConn.WebSocketConnectionAPI {
        return this._connect(address);
    }

    public disconnect(address: string): void {
        this._disconnect(address);
    }

    public get guid(): string {
        return this._guid;
    }

    public get connections(): connection.ConnectionAPI[] {
        return this._manager.get();
    }

    public get onConnected(): event.Event<connection.ConnectionAPI> {
        return this._onConnected;
    }

    public get onDisconnected(): event.Event<connection.ConnectionAPI> {
        return this._onDisconnected;
    }

    public get onRoutingChanged(): event.Event<any> {
        return this._onRoutingChanged;
    }
}

export class Hub {
    private _peers: ConnectionManager;
    private _routing: routing.RoutingTable = new routing.RoutingTable();
    private _guid: string;

    private _onConnected: event.Event<connection.ConnectionAPI> = new event.Event<connection.ConnectionAPI>()
    private _onDisconnected: event.Event<connection.ConnectionAPI> = new event.Event<connection.ConnectionAPI>();
    private _onRoutingChanged: event.Event<any> = new event.Event<any>();

    constructor(guid: string, peers: ConnectionManager) {
        this._peers = peers; 
        this._guid = guid;

        this._peers.onAdd.on((connection) => {
            this._onConnected.emit(connection);
        });

        this._peers.onRemove.on((connection) => {
            this._onDisconnected.emit(connection);
        });

        this._routing.onChanged.on((routing) => {
            this._onRoutingChanged.emit(routing.serialize());
        });

        this._onConnected.on((connection) => {
            console.log('peer connected: ' + connection.endpoint + " (" + this._peers.length + ")");
            this._peers.get().forEach(function (other) {
                if (other === connection) return;
                connection.connected(other.endpoint);
                other.connected(connection.endpoint);
            });
        });

        this._onDisconnected.on((connection) => {
            console.log('peer disconnected: ' + connection.endpoint + " (" + this._peers.length + ")");
            this._peers.get().forEach(function (other) {
                if (other === connection) return;
                other.disconnected(connection.endpoint);
            });
        });

        this._onRoutingChanged.on((table) => {
            this._peers.get().forEach(function (other) {
                other.addroutes(table);
            });
        });
    }

    private getApi(): HubAPI {
        return new HubAPIImpl({
            guid: this._guid,
            connect: this.connect.bind(this),
            disconnect: this.disconnect.bind(this),
            manager: this._peers,
            onConnected: this._onConnected,
            onDisconnected: this._onDisconnected,
            onRoutingChanged: this._onRoutingChanged,
        });
    }

    static create(guid: string, options: {
    } = {}): HubAPI {
        var manager = new connectionManager.ConnectionManager<connection.ConnectionAPI>();

        var hub = new Hub(guid, manager);

        return hub.getApi();
    }

    public connect(address: string): wsConn.WebSocketConnectionAPI {
        var peer = wsConn.WebSocketConnection.create(address);

        peer.onOpen.on(() => {
            this._peers.add(peer);
        });

        peer.onClose.on((event) => {
            this._peers.remove(peer);
        });

        peer.onIdentified.on((data) => {
            var row = new routing.RoutingRow(this._guid, data.authority, data.endpoint);
            this._routing.add(row); 
            var table = this._routing.serialize();
            this._peers.get().forEach(function (other) {
                other.addroutes(table);
            });
        });

        peer.onRoutesReceived.on((table) => {
            var routes = routing.RoutingTable.deserialize(table);
            routes.subtract(this._routing);
            if (routes.length > 0) {
                this._routing.update(routes);
                var table = this._routing.serialize();
                this._onRoutingChanged.emit(table);
            }
        });

        return peer;
    }

    public isConnected(address: string): boolean {
        return this._peers.get(address) !== undefined
    }

    public disconnect(address: string): void {
        var peer = this._peers.get(address);
        peer.close();
    }
}
