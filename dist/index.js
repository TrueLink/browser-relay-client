(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var hub = require("./hub");

var serverAddress = 'ws://127.0.0.1:20500/';

var instance = hub.Hub.create();

console.log(instance);

instance.connect(serverAddress);
//# sourceMappingURL=app.js.map

},{"./hub":5}],2:[function(require,module,exports){
// This module should be common for client and server.
var event = require("./event");

function noop(connection) {
}

var ConnectionManager = (function () {
    function ConnectionManager() {
        this.connectionMap = {};
        this.connectionList = [];
        this.onAdd = new event.Event();
        this.onRemove = new event.Event();
    }
    ConnectionManager.prototype.get = function (address) {
        if (address === undefined) {
            return this.connectionList.slice();
        }

        return this.connectionMap[address];
    };

    ConnectionManager.prototype.add = function (connection) {
        var address = connection.address;
        if (address in this.connectionMap)
            return false;

        this.connectionMap[address] = connection;
        this.connectionList.push(connection);

        this.onAdd.emit(connection);
        return true;
    };

    ConnectionManager.prototype.remove = function (connection) {
        var address = connection.address;
        var mappedConnection = this.connectionMap[address];
        if (!mappedConnection || mappedConnection !== connection)
            return false;

        delete this.connectionMap[address];

        var index = this.connectionList.indexOf(connection);
        this.connectionList.splice(index, 1);

        this.onRemove.emit(connection);
        return true;
    };

    Object.defineProperty(ConnectionManager.prototype, "length", {
        get: function () {
            return this.connectionList.length;
        },
        enumerable: true,
        configurable: true
    });
    return ConnectionManager;
})();
exports.ConnectionManager = ConnectionManager;
//# sourceMappingURL=connection-manager.js.map

},{"./event":4}],3:[function(require,module,exports){
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var protocol = require('./protocol');

var Connection = (function (_super) {
    __extends(Connection, _super);
    function Connection(transport, address) {
        _super.call(this, this);
        this.address = address;
        this.transport = transport;
    }
    Connection.prototype.getApi = function () {
        return {
            address: this.address,
            connected: this.writeConnected.bind(this),
            disconnected: this.writeDisconnected.bind(this)
        };
    };

    Connection.prototype.readMessageData = function (data) {
        var message = JSON.parse(data);
        console.log("<--", message);
        this.readMessage(message);
    };

    Connection.prototype.writeMessage = function (message) {
        var data = JSON.stringify(message);
        console.log("-->", data);
        this.transport.writeMessageData(data);
    };

    Connection.prototype.readPeerConnectedMessage = function (destination) {
    };

    Connection.prototype.readPeerDisconnectedMessage = function (destination) {
    };

    Connection.prototype.readRelayMessage = function (destination, message) {
        throw new Error("client can't relay messages at the moment");
    };

    Connection.prototype.readRelayedMessage = function (destination, message) {
        //    var MESSAGE_TYPE = this.MESSAGE_TYPE,
        //        messageType = message[0];
        //    switch (messageType) {
        //        // An initial connection request from a third party peer
        //        case MESSAGE_TYPE.RTC_OFFER:
        //            this.readRelayedOffer(origin, message[1], message[2]);
        //            break;
        //        // An answer to an RTC offer sent from this node
        //        case MESSAGE_TYPE.RTC_ANSWER:
        //            this.readRelayedAnswer(origin, message[1]);
        //            break;
        //        // An ICE candidate from the source node
        //        case MESSAGE_TYPE.RTC_ICE_CANDIDATE:
        //            this.readRelayedIceCandidate(origin, message[1]);
        //            break;
        //        default:
        //            throw new Error('Unknown message type: ' + messageType);
        //    }
    };
    return Connection;
})(protocol.Protocol);
exports.Connection = Connection;
//# sourceMappingURL=connection.js.map

},{"./protocol":6}],4:[function(require,module,exports){
var Event = (function () {
    function Event(context) {
        this._handlers = [];
        this._context = context;
    }
    Event.prototype.emit = function (value) {
        var _this = this;
        this._handlers.forEach(function (handler) {
            handler.callback.call(handler.context || _this._context, value);
        });
    };

    Event.prototype.on = function (callback, context) {
        if (arguments.length == 2) {
            for (var i = 0; i < this._handlers.length; i++) {
                var handler = this._handlers[i];
                if (handler.callback == callback && handler.context == context)
                    return;
            }
        }
        this._handlers.push({ callback: callback, context: context });
    };

    Event.prototype.off = function (callback, context) {
        var remaining = [];
        if (arguments.length == 2) {
            for (var i = 0; i < this._handlers.length; i++) {
                var handler = this._handlers[i];
                if (handler.callback != callback)
                    continue;
                if (handler.context != context)
                    continue;
                remaining.push(handler);
            }
        } else {
            for (var i = 0; i < this._handlers.length; i++) {
                var handler = this._handlers[i];
                if (handler.callback != callback)
                    continue;
                remaining.push(handler);
            }
        }
        this._handlers = remaining;
    };
    return Event;
})();
exports.Event = Event;
//# sourceMappingURL=event.js.map

},{}],5:[function(require,module,exports){
var event = require("./event");
var connectionManager = require("./connection-manager");
var wsConn = require("./websocket-connection");

var APIImpl = (function () {
    function APIImpl(options) {
        this._manager = options.manager;
        this._onConnected = options.onConnected;
        this._onDisconnected = options.onDisconnected;
        this._connect = options.connect;
    }
    APIImpl.prototype.connect = function (address) {
        return this._connect(address);
    };

    Object.defineProperty(APIImpl.prototype, "connections", {
        get: function () {
            return this._manager.get();
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(APIImpl.prototype, "onConnected", {
        get: function () {
            return this._onConnected;
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(APIImpl.prototype, "onDisconnected", {
        get: function () {
            return this._onDisconnected;
        },
        enumerable: true,
        configurable: true
    });
    return APIImpl;
})();
exports.APIImpl = APIImpl;

var Hub = (function () {
    function Hub(peers) {
        var _this = this;
        this.peers = peers;

        this.onConnected = new event.Event();
        this.onDisconnected = new event.Event();

        this.peers.onAdd.on(function (connection) {
            _this.onConnected.emit(connection);
            console.log('peer connected: ' + connection.address + " (" + _this.peers.length + ")");
            _this.peers.get().forEach(function (other) {
                if (other === connection)
                    return;
                connection.connected(other.address);
                other.connected(connection.address);
            });
        });

        this.peers.onRemove.on(function (connection) {
            _this.onDisconnected.emit(connection);
            console.log('peer disconnected: ' + connection.address + " (" + _this.peers.length + ")");
            _this.peers.get().forEach(function (other) {
                if (other === connection)
                    return;
                other.disconnected(connection.address);
            });
        });
    }
    Hub.prototype.getApi = function () {
        return new APIImpl({
            connect: this.connect.bind(this),
            manager: this.peers,
            onConnected: this.onConnected,
            onDisconnected: this.onDisconnected
        });
    };

    Hub.create = function (options) {
        if (typeof options === "undefined") { options = {}; }
        var manager = new connectionManager.ConnectionManager();

        var hub = new Hub(manager);

        return hub.getApi();
    };

    Hub.prototype.connect = function (address) {
        var _this = this;
        var peer = wsConn.WebSocketConnection.create(address, this.peers);

        peer.onClose.on(function (event) {
            _this.peers.remove(peer);
        });

        return peer;
    };
    return Hub;
})();
exports.Hub = Hub;
//# sourceMappingURL=hub.js.map

},{"./connection-manager":2,"./event":4,"./websocket-connection":7}],6:[function(require,module,exports){
// This module should be common for client and server.
function notImplemented() {
    throw new Error('This method is not implemented');
}

exports.PROTOCOL_NAME = "p";

var Protocol = (function () {
    function Protocol(callbacks) {
        this.MESSAGE_TYPE = {
            DIRECT: 0,
            PEER_CONNECTED: 1,
            PEER_DICONNECTED: 2,
            RELAY: 6,
            RELAYED: 7
        };
        this.callbacks = callbacks;
    }
    Protocol.prototype.readMessage = function (message) {
        var MESSAGE_TYPE = this.MESSAGE_TYPE;
        var callbacks = this.callbacks;
        var messageType = message[0];

        switch (messageType) {
            case MESSAGE_TYPE.PEER_CONNECTED:
                callbacks.readPeerConnectedMessage(message[1]);
                break;

            case MESSAGE_TYPE.PEER_DICONNECTED:
                callbacks.readPeerDisconnectedMessage(message[1]);
                break;

            case MESSAGE_TYPE.RELAY:
                callbacks.readRelayMessage(message[1], message[2]);
                break;

            case MESSAGE_TYPE.RELAYED:
                callbacks.readRelayedMessage(message[1], message[2]);
                break;

            default:
                throw new Error('Unknown message type: ' + messageType);
        }
    };

    Protocol.prototype.writeDirect = function (content) {
        var message = [
            this.MESSAGE_TYPE.DIRECT,
            content
        ];
        this.callbacks.writeMessage(message);
    };

    Protocol.prototype.writeConnected = function (address) {
        var message = [
            this.MESSAGE_TYPE.PEER_CONNECTED,
            address
        ];
        this.callbacks.writeMessage(message);
    };

    Protocol.prototype.writeDisconnected = function (address) {
        var message = [
            this.MESSAGE_TYPE.PEER_DICONNECTED,
            address
        ];
        this.callbacks.writeMessage(message);
    };

    Protocol.prototype.writeRelay = function (address, content) {
        var message = [
            this.MESSAGE_TYPE.RELAY,
            address,
            content
        ];
        this.callbacks.writeMessage(message);
    };

    Protocol.prototype.writeRelayed = function (address, content) {
        var message = [
            this.MESSAGE_TYPE.RELAYED,
            address,
            content
        ];
        this.callbacks.writeMessage(message);
    };
    return Protocol;
})();
exports.Protocol = Protocol;
//# sourceMappingURL=protocol.js.map

},{}],7:[function(require,module,exports){
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var connection = require("./connection");
var protocol = require("./protocol");
var event = require("./event");

var WebSocketConnection = (function (_super) {
    __extends(WebSocketConnection, _super);
    function WebSocketConnection(address, webSocket) {
        var _this = this;
        _super.call(this, this, address);

        this.onOpen = new event.Event();
        this.onError = new event.Event();
        this.onClose = new event.Event();

        this.webSocket = webSocket;

        this.webSocket.addEventListener('message', function (event) {
            _this.readMessageData(event.data);
        });

        this.webSocket.addEventListener('open', function (event) {
            _this.onOpen.emit(event);
        });

        this.webSocket.addEventListener('error', function (event) {
            _this.onError.emit(event);
        });

        this.webSocket.addEventListener('close', function (event) {
            _this.onClose.emit(event);
        });
    }
    WebSocketConnection.prototype.writeMessageData = function (data) {
        this.webSocket.send(data);
    };

    WebSocketConnection.prototype.getApi = function () {
        var api = _super.prototype.getApi.call(this);
        api.onOpen = this.onOpen;
        api.onError = this.onError;
        api.onClose = this.onClose;
        return api;
    };

    WebSocketConnection.create = function (address, options) {
        if (typeof options === "undefined") { options = {}; }
        var PROTOCOL_NAME = options.PROTOCOL_NAME || protocol.PROTOCOL_NAME;
        var webSocket = new WebSocket(address, PROTOCOL_NAME);
        var connection = new WebSocketConnection(address, webSocket);
        return connection.getApi();
    };
    return WebSocketConnection;
})(connection.Connection);
exports.WebSocketConnection = WebSocketConnection;
//# sourceMappingURL=websocket-connection.js.map

},{"./connection":3,"./event":4,"./protocol":6}]},{},[1])


//# sourceMappingURL=index.js.map