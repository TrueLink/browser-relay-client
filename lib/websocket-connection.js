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
