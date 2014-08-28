import connection = require("./connection");
import protocol = require("./protocol");
import event = require("./event");

export interface API extends connection.API {
    onOpen: event.Event<Event>;
    onError: event.Event<ErrorEvent>;
    onClose: event.Event<CloseEvent>;
}

export class WebSocketConnection extends connection.Connection {

    private _address: string;
    private webSocket: WebSocket;

    public onOpen: event.Event<Event>;
    public onError: event.Event<ErrorEvent>;
    public onClose: event.Event<CloseEvent>;

    public getEndpoint(): string {
        return this._address;
    }

    constructor(address: string, webSocket: WebSocket) {
        this._address = address;

        super(this);

        this.onOpen = new event.Event<Event>();
        this.onError = new event.Event<ErrorEvent>();
        this.onClose = new event.Event<CloseEvent>();

        this.webSocket = webSocket;

        this.webSocket.addEventListener('message', (event) => {
            this.readMessageData(event.data);
        });

        this.webSocket.addEventListener('open', (event) => {
            this.onOpen.emit(event);
        });

        this.webSocket.addEventListener('error', (event) => {
            this.onError.emit(event);
        });

        this.webSocket.addEventListener('close', (event) => {
            this.onClose.emit(event);
        });
    }

    public writeMessageData(data: string) {
        this.webSocket.send(data);
    }

    public getApi(): API {
        var api = <API>super.getApi();
        api.onOpen = this.onOpen;
        api.onError = this.onError;
        api.onClose = this.onClose;
        api.close = this.close.bind(this);
        return api;
    }

    public close(): void {
        this.webSocket.close();
    }

    static create(address: string, options: {
        PROTOCOL_NAME?: string;
    } = {}): API {
        var PROTOCOL_NAME = options.PROTOCOL_NAME || protocol.PROTOCOL_NAME;
        var webSocket = new WebSocket(address, PROTOCOL_NAME);
        var connection = new WebSocketConnection(address, webSocket);
        return connection.getApi();
    }
}
