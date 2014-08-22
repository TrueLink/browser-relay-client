var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var connection = require("./connection");
var protocol = require("./protocol");

var WebSocketConnection = (function (_super) {
    __extends(WebSocketConnection, _super);
    function WebSocketConnection(address, peers, webSocket) {
        _super.call(this, address, peers);

        this.webSocket = webSocket;

        this.webSocket.addEventListener('message', this.wsMessageHandler.bind(this));
        this.webSocket.addEventListener('open', this.wsOpenHandler.bind(this));
        this.webSocket.addEventListener('error', this.wsErrorHandler.bind(this));
        this.webSocket.addEventListener('close', this.wsCloseHandler.bind(this));
    }
    WebSocketConnection.prototype.wsMessageHandler = function (message) {
        this.readMessageData(message.data);
    };

    WebSocketConnection.prototype.wsOpenHandler = function (event) {
        this.emitter.emit('open', event);
    };

    WebSocketConnection.prototype.wsErrorHandler = function (event) {
        this.emitter.emit('error', event);
    };

    WebSocketConnection.prototype.wsCloseHandler = function (event) {
        this.emitter.emit('close', event);
    };

    WebSocketConnection.prototype.getApi = function () {
        var api = _super.prototype.getApi.call(this);
        return api;
    };

    WebSocketConnection.create = function (address, peers, options) {
        if (typeof options === "undefined") { options = {}; }
        var PROTOCOL_NAME = options.PROTOCOL_NAME || protocol.PROTOCOL_NAME;
        var webSocket = new WebSocket(address, PROTOCOL_NAME);
        var connection = new WebSocketConnection(address, peers, webSocket);
        return connection.getApi();
    };
    return WebSocketConnection;
})(connection.Connection);
//# sourceMappingURL=websocket-connection.js.map
