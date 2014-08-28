var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var protocol = require('./protocol');
var event = require("./event");


var Connection = (function (_super) {
    __extends(Connection, _super);
    function Connection(transport) {
        _super.call(this, this);

        this._transport = transport;
        this._endpoint = transport.getEndpoint();

        this.onIdentified = new event.Event();
        this.onConnected = new event.Event();
        this.onDisconnected = new event.Event();
    }
    Connection.prototype.getApi = function () {
        return {
            endpoint: this._endpoint,
            close: function () {
                throw new Error("AbstractMethod");
            },
            connected: this.writeConnected.bind(this),
            disconnected: this.writeDisconnected.bind(this),
            onIdentified: this.onIdentified,
            onConnected: this.onConnected,
            onDisconnected: this.onDisconnected
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
        this._transport.writeMessageData(data);
    };

    Connection.prototype.readPeerConnectedMessage = function (endpoint) {
        this.onConnected.emit(endpoint);
    };

    Connection.prototype.readPeerDisconnectedMessage = function (endpoint) {
        this.onDisconnected.emit(endpoint);
    };

    Connection.prototype.readIdentificationMessage = function (endpoint) {
        this.onIdentified.emit(endpoint);
    };

    Connection.prototype.readRelayMessage = function (targetEndpoint, message) {
        console.warn("client can't relay messages at the moment");
    };

    Connection.prototype.readRelayedMessage = function (sourceEndpoint, message) {
        console.warn("client process relayed message");
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
