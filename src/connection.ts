import connectionManager = require("connection-manager");
import events = require("events");
import protocol = require("./protocol");

export interface API {
    address: string;
    on(event: string, listener: Function): events.EventEmitter;
    removeListener(event: string, listener: Function): events.EventEmitter;
}

export class Connection extends protocol.Protocol implements protocol.Callbacks {
    private address: string;
    private peers: connectionManager.ConnectionManager;
    private connection: WebSocket;
    public emitter: events.EventEmitter;
   
    constructor(address: string, peers: connectionManager.ConnectionManager) {
        super(this)
        this.address = address;
        this.peers = peers;
        this.emitter = new events.EventEmitter();
    }

    static create(address: string, peers: connectionManager.ConnectionManager): API {
        var instance = new Connection(address, peers);
        return instance.getApi();
    }

    public getApi(): API {
        return {
            address: this.address,
            on: this.emitter.on.bind(this.emitter),
            removeListener: this.emitter.removeListener.bind(this.emitter)
        };
    }

    public readMessageData(data: string): void {
        var message = JSON.parse(data);
        this.readMessage(message);
    }

    public writeMessage(message: any): void {
        var stringified = JSON.stringify(message.getData());
        this.connection.send(stringified);
    }

    public readPeerConnectedMessage(destination: string): void {
        
    }

    public readPeerDisconnectedMessage(destination: string): void {
        
    }

    public readRelayMessage(destination: string, message: any): void {
        throw new Error("client can't relay messages at the moment");
    }

    public readRelayedMessage(destination: string, message: any): void {
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
