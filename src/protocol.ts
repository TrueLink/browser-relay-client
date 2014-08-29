// This module should be common for client and server. 

function notImplemented() {
    throw new Error('This method is not implemented');
}

export interface Callbacks {
    writeMessage(message: any): void;

    readPeerConnectedMessage(endpoint: string): void;
    readPeerDisconnectedMessage(endpoint: string): void;
    readAddRoutesMessage(table: any): void;
    readIdentificationMessage(authority: string, endpoint: string): void;
    readRelayMessage(targetEndpoint: string, message: string): void;
    readRelayedMessage(sourceEndpoint: string, message: string): void;
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
        ADD_ROUTES: 100,
    };

    private callbacks: Callbacks;

    constructor() {
    }

    public setReactions(callbacks: Callbacks) {
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
    }

    public writeDirect(content: string): void {
        var message = [
            this.MESSAGE_TYPE.DIRECT,
            content,
        ];
        this.callbacks.writeMessage(message);
    }

    public writeConnected(endpoint: string): void {
        var message = [
            this.MESSAGE_TYPE.PEER_CONNECTED,
            endpoint,
        ];
        this.callbacks.writeMessage(message);
    }

    public writeDisconnected(endpoint: string): void {
        var message = [
            this.MESSAGE_TYPE.PEER_DICONNECTED,
            endpoint,
        ];
        this.callbacks.writeMessage(message);
    }

    public writeAddRoutes(table: any): void {
        var message = [
            this.MESSAGE_TYPE.ADD_ROUTES,
            table,
        ];
        this.callbacks.writeMessage(message);
    }

    public writeIdentification(authority: string, endpoint: string): void {
        var message = [
            this.MESSAGE_TYPE.IDENTIFY,
            authority,
            endpoint,
        ];
        this.callbacks.writeMessage(message);
    }

    public writeRelay(targetEndpoint: string, content: string): void {
        var message = [
            this.MESSAGE_TYPE.RELAY,
            targetEndpoint,
            content,
        ];
        this.callbacks.writeMessage(message);
    }

    public writeRelayed(sourceEndpoint: string, content: string): void {
        var message = [
            this.MESSAGE_TYPE.RELAYED,
            sourceEndpoint,
            content,
        ];
        this.callbacks.writeMessage(message);
    }

}
