import protocol = require('./protocol');

export interface EventEmitter {
    on(event: string, listener: Function): EventEmitter;
    removeListener(event: string, listener: Function): EventEmitter;
    emit(event: string, ...args: any[]): boolean;
}

export interface EventEmitterFactory {
    new (): EventEmitter;
}

export interface API {
    address: string;
    on(event: string, listener: Function): EventEmitter;
    off(event: string, listener: Function): EventEmitter;
}

export interface IManager {
    get(destination: string): API;
}

export interface Callbacks {
    writeMessage(message: any): void;
}

export class Connection extends protocol.Protocol implements protocol.Callbacks {
    private address: string;
    private peers: IManager;
    public emitter: EventEmitter;

    static EventEmitter: EventEmitterFactory;
   
    constructor(address: string, peers: IManager) {
        super(this)
        this.address = address;
        this.peers = peers;
        this.emitter = new Connection.EventEmitter();
    }

    static create(address: string, peers: IManager): API {
        var instance = new Connection(address, peers);
        return instance.getApi();
    }

    public getApi(): API {
        return {
            address: this.address,
            on: this.emitter.on.bind(this.emitter),
            off: this.emitter.removeListener.bind(this.emitter)
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
