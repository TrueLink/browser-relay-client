import connection = require("./connection");
import protocol = require("./protocol");
import event = require("./event");

export interface API extends connection.API {
    onOpen: event.Event<Event>;
    onError: event.Event<ErrorEvent>;
    onClose: event.Event<CloseEvent>;
}

export class WebSocketConnection extends connection.Connection {

    private webSocket: WebSocket;

    public onOpen: event.Event<Event>;
    public onError: event.Event<ErrorEvent>;
    public onClose: event.Event<CloseEvent>;

    constructor(address: string, peers: connection.ConnectionsManager, webSocket: WebSocket) {
        super(this, address, peers);

        this.onOpen = new event.Event<Event>();
        this.onError = new event.Event<ErrorEvent>();
        this.onClose = new event.Event<CloseEvent>();

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
        this.onOpen.emit(event);
    }

    private wsErrorHandler(event: ErrorEvent) {
        this.onError.emit(event);
    }

    private wsCloseHandler(event: CloseEvent): void {
        this.onClose.emit(event);
    }

    public getApi(): API {
        var api = <API>super.getApi();
        api.onOpen = this.onOpen;
        api.onError = this.onError;
        api.onClose = this.onClose;
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
