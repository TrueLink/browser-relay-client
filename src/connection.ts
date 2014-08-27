import protocol = require('./protocol');
import event = require("./event");

export interface API {
    id: string; // readonly
    address: string; // readonly
    close(): void;
    connected(remoteAddr: string): void;
    disconnected(remoteAddr: string): void;

    onIdentified: event.Event<string>; // readonly
    onConnected: event.Event<string>; // readonly
    onDisconnected: event.Event<string>; // readonly
}

// TODO: Add APIImpl
// TODO: move address field into websocket

export interface Callbacks {
    writeMessageData(message: any): void;
}

export class Connection extends protocol.Protocol implements protocol.Callbacks {
    private id: string;
    private address: string;

    private transport: Callbacks;

    private onIdentified: event.Event<string>;
    private onConnected: event.Event<string>;
    private onDisconnected: event.Event<string>;
   
    constructor(transport: Callbacks, address: string) {
        super(this)
        this.address = address;
        this.transport = transport;

        this.onIdentified = new event.Event<string>();
        this.onConnected = new event.Event<string>();
        this.onDisconnected = new event.Event<string>();
    }

    public getApi(): API {
        return {
            id: this.id,
            address: this.address,
            close: () => { throw new Error("AbstractMethod"); },
            connected: this.writeConnected.bind(this),
            disconnected: this.writeDisconnected.bind(this),
            onIdentified: this.onIdentified,
            onConnected: this.onConnected,
            onDisconnected: this.onDisconnected,
        };
    }

    public readMessageData(data: string): void {
        var message = JSON.parse(data);
        console.log("<--", message);
        this.readMessage(message);
    }

    public writeMessage(message: any): void {
        var data = JSON.stringify(message);
        console.log("-->", data);
        this.transport.writeMessageData(data);
    }

    public readPeerConnectedMessage(id: string): void {
        this.onConnected.emit(id);
    }

    public readPeerDisconnectedMessage(id: string): void {
        this.onDisconnected.emit(id);
    }

    public readIdentificationMessage(id: string): void {
        this.id = id;
        this.onIdentified.emit(id);
    }

    public readRelayMessage(destination: string, message: any): void {
        console.warn("client can't relay messages at the moment");
    }

    public readRelayedMessage(destination: string, message: any): void {
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
    }
}
