// This module should be common for client and server. 

import event = require("./event");

export interface IConnection {
    endpoint: string;
}

function noop(connection: IConnection): void {
}

export class ConnectionManager<T extends IConnection> {
    private _connectionMap: { [key: string]: T; } = {};
    private _connectionList: Array<T> = [];

    private _onAdd: event.Event<T> = new event.Event<T>();
    private _onRemove: event.Event<T> = new event.Event<T>();

    public get onAdd(): event.Event<T> {
        return this._onAdd;
    }

    public get onRemove() {
        return this._onRemove;
    }

    constructor() {
    }

    public get(): Array<T>;
    public get(key: string): T;
    public get(key?: string): any {
        if (key === undefined) {
            return this._connectionList.slice();
        }

        return this._connectionMap[key];
    }

    public add(connection: T) {
        var endpoint = connection.endpoint;
        if (endpoint in this._connectionMap) return false;

        this._connectionMap[endpoint] = connection;
        this._connectionList.push(connection);

        this._onAdd.emit(connection);
        return true;
    }

    public remove(connection: T) {
        var endpoint = connection.endpoint;
        var mappedConnection = this._connectionMap[endpoint];
        if (!mappedConnection || mappedConnection !== connection) return false;

        delete this._connectionMap[endpoint];

        var index = this._connectionList.indexOf(connection);
        this._connectionList.splice(index, 1);

        this._onRemove.emit(connection);
        return true;
    }

    public get length(): number {
        return this._connectionList.length;
    }
}