import connectionManager = require("connection-manager");
import events = require("events");

class Connection {
    private address: string;
    private peers: connectionManager.ConnectionManager;
    private emitter: events.EventEmitter;
    private firewall: (description: string, data: string) => boolean;
   
    constructor(address: string, peers: connectionManager.ConnectionManager, options?: {
        emitter?: events.EventEmitter;
        firewall?: (description: string, data: string) => boolean;
    }) {
        this.address = address;
        this.peers = peers;

        if (options) {
            if (options.emitter) this.emitter = options.emitter;
            if (options.firewall) this.firewall = options.firewall;
        }

        if (!this.emitter) this.emitter = new Connection.Emitter();
    }

    static Emitter: {
        new (): events.EventEmitter;
    }

    on() {
        this.emitter.on.apply(this.emitter, arguments);
        return this;

    }

    removeListener() {
        this.emitter.removeListener.apply(this.emitter, arguments);
        return this;
    }

    getPeer(address) {
        return this.peers.get(address);
    }

    addPeer(peer) {
        return this.peers.add(peer);
    }

    getPeers() {
        return this.peers.get();
    }
}

Connection.Emitter = events.EventEmitter;