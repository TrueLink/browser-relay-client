import connection = require("./connection");
import protocol = require("./protocol");

interface API extends connection.API {
}

class WebSocketConnection extends connection.Connection {

    private webSocket: WebSocket;

    constructor(address: string, peers: connection.ConnectionsManager, webSocket: WebSocket) {
        super(this, address, peers);

        this.webSocket = webSocket;

        this.webSocket.addEventListener('message', this.wsMessageHandler.bind(this));
        this.webSocket.addEventListener('open', this.wsOpenHandler.bind(this));
        this.webSocket.addEventListener('error', this.wsErrorHandler.bind(this));
        this.webSocket.addEventListener('close', this.wsCloseHandler.bind(this));
    }

    public writeMessageData(data: string) {
        this.webSocket.send(data);
    }

    private wsMessageHandler(message: MessageEvent) {
        this.readMessageData(message.data);
    }

    private wsOpenHandler(event: Event) {
        this.emitter.emit('open', event);
    }

    private wsErrorHandler(event: ErrorEvent) {
        this.emitter.emit('error', event);
    }

    private wsCloseHandler(event: CloseEvent): void {
        this.emitter.emit('close', event);
    }

    public getApi(): API {
        var api = <API>super.getApi();
        return api;
    }

    static create(address: string, peers: connection.ConnectionsManager, options: {
        PROTOCOL_NAME?: string;
    } = {}): API {
        var PROTOCOL_NAME = options.PROTOCOL_NAME || protocol.PROTOCOL_NAME;
        var webSocket = new WebSocket(address, PROTOCOL_NAME);
        var connection = new WebSocketConnection(address, peers, webSocket);
        return connection.getApi();
    }
}
