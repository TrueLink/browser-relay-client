// This module should be common for client and server.
function notImplemented() {
    throw new Error('This method is not implemented');
}

exports.PROTOCOL_NAME = "p";

var Protocol = (function () {
    function Protocol() {
        this.MESSAGE_TYPE = {
            DIRECT: 0,
            PEER_CONNECTED: 1,
            PEER_DICONNECTED: 2,
            IDENTIFY: 3,
            RELAY: 6,
            RELAYED: 7,
            ADD_ROUTES: 100
        };
    }
    Protocol.prototype.setReactions = function (callbacks) {
        this.callbacks = callbacks;
    };

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

            case MESSAGE_TYPE.ADD_ROUTES:
                callbacks.readAddRoutesMessage(message[1]);
                break;

            case MESSAGE_TYPE.IDENTIFY:
                callbacks.readIdentificationMessage(message[1], message[2]);
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

    Protocol.prototype.writeConnected = function (endpoint) {
        var message = [
            this.MESSAGE_TYPE.PEER_CONNECTED,
            endpoint
        ];
        this.callbacks.writeMessage(message);
    };

    Protocol.prototype.writeDisconnected = function (endpoint) {
        var message = [
            this.MESSAGE_TYPE.PEER_DICONNECTED,
            endpoint
        ];
        this.callbacks.writeMessage(message);
    };

    Protocol.prototype.writeAddRoutes = function (table) {
        var message = [
            this.MESSAGE_TYPE.ADD_ROUTES,
            table
        ];
        this.callbacks.writeMessage(message);
    };

    Protocol.prototype.writeIdentification = function (authority, endpoint) {
        var message = [
            this.MESSAGE_TYPE.IDENTIFY,
            authority,
            endpoint
        ];
        this.callbacks.writeMessage(message);
    };

    Protocol.prototype.writeRelay = function (targetEndpoint, content) {
        var message = [
            this.MESSAGE_TYPE.RELAY,
            targetEndpoint,
            content
        ];
        this.callbacks.writeMessage(message);
    };

    Protocol.prototype.writeRelayed = function (sourceEndpoint, content) {
        var message = [
            this.MESSAGE_TYPE.RELAYED,
            sourceEndpoint,
            content
        ];
        this.callbacks.writeMessage(message);
    };
    return Protocol;
})();
exports.Protocol = Protocol;
//# sourceMappingURL=protocol.js.map
