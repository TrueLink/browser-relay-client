var event = require("./event");
var connectionManager = require("./connection-manager");
var wsConn = require("./websocket-connection");
var routing = require("./routing-table");

var HubAPIImpl = (function () {
    function HubAPIImpl(options) {
        this._guid = options.guid;
        this._manager = options.manager;
        this._onConnected = options.onConnected;
        this._onDisconnected = options.onDisconnected;
        this._connect = options.connect;
        this._disconnect = options.disconnect;
    }
    HubAPIImpl.prototype.connect = function (address) {
        return this._connect(address);
    };

    HubAPIImpl.prototype.disconnect = function (address) {
        this._disconnect(address);
    };

    Object.defineProperty(HubAPIImpl.prototype, "guid", {
        get: function () {
            return this._guid;
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(HubAPIImpl.prototype, "connections", {
        get: function () {
            return this._manager.get();
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(HubAPIImpl.prototype, "onConnected", {
        get: function () {
            return this._onConnected;
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(HubAPIImpl.prototype, "onDisconnected", {
        get: function () {
            return this._onDisconnected;
        },
        enumerable: true,
        configurable: true
    });
    return HubAPIImpl;
})();
exports.HubAPIImpl = HubAPIImpl;

var Hub = (function () {
    function Hub(guid, peers) {
        var _this = this;
        this._routing = new routing.RoutingTable();
        this.onConnected = new event.Event();
        this.onDisconnected = new event.Event();
        this._peers = peers;
        this._guid = guid;

        this._peers.onAdd.on(function (connection) {
            _this.onConnected.emit(connection);
        });

        this._peers.onRemove.on(function (connection) {
            _this.onDisconnected.emit(connection);
        });

        this.onConnected.on(function (connection) {
            console.log('peer connected: ' + connection.endpoint + " (" + _this._peers.length + ")");
            _this._peers.get().forEach(function (other) {
                if (other === connection)
                    return;
                connection.connected(other.endpoint);
                other.connected(connection.endpoint);
            });
        });

        this.onDisconnected.on(function (connection) {
            console.log('peer disconnected: ' + connection.endpoint + " (" + _this._peers.length + ")");
            _this._peers.get().forEach(function (other) {
                if (other === connection)
                    return;
                other.disconnected(connection.endpoint);
            });
        });
    }
    Hub.prototype.getApi = function () {
        return new HubAPIImpl({
            guid: this._guid,
            connect: this.connect.bind(this),
            disconnect: this.disconnect.bind(this),
            manager: this._peers,
            onConnected: this.onConnected,
            onDisconnected: this.onDisconnected
        });
    };

    Hub.create = function (guid, options) {
        if (typeof options === "undefined") { options = {}; }
        var manager = new connectionManager.ConnectionManager();

        var hub = new Hub(guid, manager);

        return hub.getApi();
    };

    Hub.prototype.connect = function (address) {
        var _this = this;
        var peer = wsConn.WebSocketConnection.create(address);

        peer.onOpen.on(function () {
            _this._peers.add(peer);
        });

        peer.onClose.on(function (event) {
            _this._peers.remove(peer);
        });

        peer.onIdentified.on(function (data) {
            var row = new routing.RoutingRow(_this._guid, data.authority, data.endpoint);
            _this._routing.add(row);
            var table = _this._routing.serialize();
            _this._peers.get().forEach(function (other) {
                other.addroutes(table);
            });
        });

        peer.onRoutesReceived.on(function (table) {
            var routes = routing.RoutingTable.deserialize(table);
            routes.subtract(_this._routing);
            if (routes.length > 0) {
                var table = _this._routing.serialize();
                _this._peers.get().forEach(function (other) {
                    if (other === peer)
                        return;
                    other.addroutes(table);
                });
            }
        });

        return peer;
    };

    Hub.prototype.isConnected = function (address) {
        return this._peers.get(address) !== undefined;
    };

    Hub.prototype.disconnect = function (address) {
        var peer = this._peers.get(address);
        peer.close();
    };
    return Hub;
})();
exports.Hub = Hub;
//# sourceMappingURL=hub.js.map
