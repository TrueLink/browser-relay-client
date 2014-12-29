import connection = require("./connection");
import protocol = require("./protocol");
import event = require("./event");

export interface WebSocketConnectionAPI extends connection.ConnectionAPI {
    onOpen: event.Event<Event>;
    onError: event.Event<ErrorEvent>;
    onClose: event.Event<CloseEvent>;
}

import WebSocketClient = require('websocket');

export class NodeWebSocketConnection extends connection.Connection {

    private _address: string;
    private _webSocket: WebSocketClient.client;
    private _webSocketConnection: WebSocketClient.connection;

    public onOpen: event.Event<any> = new event.Event<any>();
    public onError: event.Event<ErrorEvent> = new event.Event<ErrorEvent>();
    public onClose: event.Event<CloseEvent> = new event.Event<CloseEvent>();

    public getEndpoint(): string {
        return this._address;
    }

    constructor(address: string, PROTOCOL_NAME: string, webSocket: WebSocketClient.client) {
        super();

        this._address = address;
        this.setTransport(this);

        this._webSocket = webSocket;

        this._webSocket.on("connect", (connection) => {
            this._webSocketConnection = connection;

            this._webSocketConnection.on('message', (message) => {
                this.readMessageData(message.utf8Data);
            });

            this._webSocketConnection.on('open', () => {
                this.onOpen.emit(event);
            });

            this._webSocketConnection.on('error', (error) => {
                this.onError.emit(null);
            });

            this._webSocketConnection.addListener('close', (code: number, desc: string) => {
                this.onClose.emit(null);
            });            
        });
        this._webSocket.connect(address, [PROTOCOL_NAME]);
    }

    public writeMessageData(data: string) {
        this._webSocketConnection.send(data);
    }

    public getApi(): WebSocketConnectionAPI {
        var api = <WebSocketConnectionAPI>super.getApi();
        api.onOpen = this.onOpen;
        api.onError = this.onError;
        api.onClose = this.onClose;
        api.close = this.close.bind(this);
        return api;
    }

    public close(): void {
        this._webSocketConnection.close();
    }

    static create(address: string, options: {
        PROTOCOL_NAME?: string;
    } = {}): WebSocketConnectionAPI {
        var PROTOCOL_NAME = options.PROTOCOL_NAME || protocol.PROTOCOL_NAME;
        var webSocket = new WebSocketClient.client();
        var connection = new NodeWebSocketConnection(address, PROTOCOL_NAME, webSocket);
        return connection.getApi();
    }
}

export class BrowserWebSocketConnection extends connection.Connection {

    private _address: string;
    private _webSocket: WebSocket;

    public onOpen: event.Event<Event> = new event.Event<Event>();
    public onError: event.Event<ErrorEvent> = new event.Event<ErrorEvent>();
    public onClose: event.Event<CloseEvent> = new event.Event<CloseEvent>();

    public getEndpoint(): string {
        return this._address;
    }

    constructor(address: string, webSocket: WebSocket) {
        super();

        this._address = address;
        this.setTransport(this);

        this._webSocket = webSocket;

        this._webSocket.addEventListener('message', (event) => {
            this.readMessageData(event.data);
        });

        this._webSocket.addEventListener('open', (event) => {
            this.onOpen.emit(event);
        });

        this._webSocket.addEventListener('error', (event) => {
            this.onError.emit(event);
        });

        this._webSocket.addEventListener('close', (event) => {
            this.onClose.emit(event);
        });
    }

    public writeMessageData(data: string) {
        this._webSocket.send(data);
    }

    public getApi(): WebSocketConnectionAPI {
        var api = <WebSocketConnectionAPI>super.getApi();
        api.onOpen = this.onOpen;
        api.onError = this.onError;
        api.onClose = this.onClose;
        api.close = this.close.bind(this);
        return api;
    }

    public close(): void {
        this._webSocket.close();
    }

    static create(address: string, options: {
        PROTOCOL_NAME?: string;
    } = {}): WebSocketConnectionAPI {
        var PROTOCOL_NAME = options.PROTOCOL_NAME || protocol.PROTOCOL_NAME;
        var webSocket = new WebSocket(address, PROTOCOL_NAME);
        var connection = new BrowserWebSocketConnection(address, webSocket);
        return connection.getApi();
    }
}

export function create(address: string, options: {
    PROTOCOL_NAME?: string;
} = {}): WebSocketConnectionAPI {
    if (!navigator) {
        return BrowserWebSocketConnection.create(address, options);
    } else {
        return NodeWebSocketConnection.create(address, options);
    }
}