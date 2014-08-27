// This module should be common for client and server. 

function notImplemented() {
    throw new Error('This method is not implemented');
}

export interface Callbacks {
    writeMessage(message: any): void;

    readPeerConnectedMessage(address: string): void;
    readPeerDisconnectedMessage(address: string): void;
    readIdentificationMessage(id: string): void;
    readRelayMessage(address: string, message: string): void;
    readRelayedMessage(address: string, message: string): void;
}

export var PROTOCOL_NAME = "p";

export class Protocol {
    MESSAGE_TYPE = {
        DIRECT: 0,
        PEER_CONNECTED: 1,
        PEER_DICONNECTED: 2,
        IDENTIFY: 3,
        RELAY: 6,
        RELAYED: 7,
    };

    private callbacks: Callbacks;

    constructor(callbacks: Callbacks) {
        this.callbacks = callbacks;
    }

    public readMessage(message: any): void {
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

            case MESSAGE_TYPE.IDENTIFY:
                callbacks.readIdentificationMessage(message[1]);
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
    }

    public writeDirect(content: string): void {
        var message = [
            this.MESSAGE_TYPE.DIRECT,
            content,
        ];
        this.callbacks.writeMessage(message);
    }

    public writeConnected(address: string): void {
        var message = [
            this.MESSAGE_TYPE.PEER_CONNECTED,
            address,
        ];
        this.callbacks.writeMessage(message);
    }

    public writeDisconnected(address: string): void {
        var message = [
            this.MESSAGE_TYPE.PEER_DICONNECTED,
            address,
        ];
        this.callbacks.writeMessage(message);
    }

    public writeIdentification(id: string): void {
        var message = [
            this.MESSAGE_TYPE.IDENTIFY,
            id,
        ];
        this.callbacks.writeMessage(message);
    }

    public writeRelay(address: string, content: string): void {
        var message = [
            this.MESSAGE_TYPE.RELAY,
            address,
            content,
        ];
        this.callbacks.writeMessage(message);
    }

    public writeRelayed(address: string, content: string): void {
        var message = [
            this.MESSAGE_TYPE.RELAYED,
            address,
            content,
        ];
        this.callbacks.writeMessage(message);
    }

}
