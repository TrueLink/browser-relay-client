import protocol = require('./protocol');
import event = require("./event");

export interface IdentificationData {
    authority: string;
    endpoint: string;
}

export interface RelayData {
    destination: string;
    message: any;
}

export interface ConnectionAPI {
    endpoint: string;
    close(): void;
    connected(endpoint: string): void;
    disconnected(endpoint: string): void;
    addroutes(routes: any): void;
    relay(targetEndpoint: string, content: any): void;
    relay(targetEndpoint: string[], content: any): void;
    relayed(endpoint: string, message: string): void;
    onIdentified: event.Event<IdentificationData>;
    onConnected: event.Event<string>;
    onDisconnected: event.Event<string>;
    onRelay: event.Event<RelayData>;
    onRoutesReceived: event.Event<any>;
}

export interface Callbacks {
    writeMessageData(message: any): void;
    getEndpoint(): string;
}

export class Connection extends protocol.Protocol implements protocol.Callbacks {
    private _endpoint: string;

    private _transport: Callbacks;

    private _onIdentified: event.Event<IdentificationData> = new event.Event<IdentificationData>();
    private _onConnected: event.Event<string> = new event.Event<string>();
    private _onDisconnected: event.Event<string> = new event.Event<string>();
    private _onRelay: event.Event<RelayData> = new event.Event<RelayData>();
    private _onRoutesReceived: event.Event<any> = new event.Event<any>();
   
    constructor() {
        super();
        this.setReactions(this);
    }

    public setTransport(transport: Callbacks) {
        this._transport = transport;
        this._endpoint = transport.getEndpoint();
    }

    public getApi(): ConnectionAPI {
        return {
            endpoint: this._endpoint,
            close: () => { throw new Error("AbstractMethod"); },
            connected: this.writeConnected.bind(this),
            disconnected: this.writeDisconnected.bind(this),
            addroutes: this.writeAddRoutes.bind(this),
            relay: this.writeRelay.bind(this),
            relayed: this.writeRelayed.bind(this),
            onIdentified: this._onIdentified,
            onConnected: this._onConnected,
            onDisconnected: this._onDisconnected,
            onRelay: this._onRelay,
            onRoutesReceived: this._onRoutesReceived,
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
        this._onConnected.emit(endpoint);
    }

    public readPeerDisconnectedMessage(endpoint: string): void {
        this._onDisconnected.emit(endpoint);
    }

    public readAddRoutesMessage(table: any): void {
        this._onRoutesReceived.emit(table);
    }

    public readIdentificationMessage(authority: string, endpoint: string): void {
        this._onIdentified.emit({
            authority: authority,
            endpoint: endpoint,
        });
    }

    public readRelayMessage(targetEndpoint: string, message: any): void {
        this._onRelay.emit({
            destination: targetEndpoint,
            message: message
        })
    }

    public readRelayedMessage(sourceEndpoint: string, message: any): void {
        console.warn("processing relayed message", message);
        var MESSAGE_TYPE = this.MESSAGE_TYPE;
        var messageType = message[0];

        switch (messageType) {
            case MESSAGE_TYPE.RELAY: 
                this.readRelayMessage(message[1], message[2]);
                break;
        }	


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
