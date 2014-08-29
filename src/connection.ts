import protocol = require('./protocol');
import event = require("./event");

export interface API {
    endpoint: string; // readonly
    close(): void;
    connected(remoteAddr: string): void;
    disconnected(remoteAddr: string): void;

    onIdentified: event.Event<string>; // readonly
    onConnected: event.Event<string>; // readonly
    onDisconnected: event.Event<string>; // readonly
}

// TODO: Add APIImpl

export interface Callbacks {
    writeMessageData(message: any): void;
    getEndpoint(): string;
}

export class Connection extends protocol.Protocol implements protocol.Callbacks {
    private _endpoint: string;

    private _transport: Callbacks;

    private onIdentified: event.Event<string> = new event.Event<string>();
    private onConnected: event.Event<string> = new event.Event<string>();
    private onDisconnected: event.Event<string> = new event.Event<string>();
   
    constructor() {
        super();
        this.setReactions(this);
    }

    public setTransport(transport: Callbacks) {
        this._transport = transport;
        this._endpoint = transport.getEndpoint();
    }

    public getApi(): API {
        return {
            endpoint: this._endpoint,
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
        this._transport.writeMessageData(data);
    }

    public readPeerConnectedMessage(endpoint: string): void {
        this.onConnected.emit(endpoint);
    }

    public readPeerDisconnectedMessage(endpoint: string): void {
        this.onDisconnected.emit(endpoint);
    }

    public readIdentificationMessage(endpoint: string): void {
        this.onIdentified.emit(endpoint);
    }

    public readRelayMessage(targetEndpoint: string, message: any): void {
        console.warn("client can't relay messages at the moment");
    }

    public readRelayedMessage(sourceEndpoint: string, message: any): void {
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
