var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var protocol = require('./protocol');

var Connection = (function (_super) {
    __extends(Connection, _super);
    function Connection(transport, address, peers) {
        _super.call(this, this);
        this.address = address;
        this.peers = peers;
        this.transport = transport;
    }
    Connection.prototype.getApi = function () {
        return {
            address: this.address
        };
    };

    Connection.prototype.readMessageData = function (data) {
        var message = JSON.parse(data);
        this.readMessage(message);
    };

    Connection.prototype.writeMessage = function (message) {
        var data = JSON.stringify(message);
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
