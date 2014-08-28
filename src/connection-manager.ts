// This module should be common for client and server. 

import event = require("./event");

export interface IConnection {
    endpoint: string;
}

function noop(connection: IConnection): void {
}

export class ConnectionManager<T extends IConnection> {
    private connectionMap: { [key: string]: T; } = {};
    private connectionList: Array<T> = [];

    public onAdd: event.Event<T>;
    public onRemove: event.Event<T>;

    constructor() {
        this.onAdd = new event.Event<T>();
        this.onRemove = new event.Event<T>();
    }

    public get(): Array<T>;
    public get(key: string): T;
    public get(key?: string): any {
        if (key === undefined) {
            return this.connectionList.slice();
        }

        return this.connectionMap[key];
    }

    public add(connection: T) {
        var endpoint = connection.endpoint;
        if (endpoint in this.connectionMap) return false;

        this.connectionMap[endpoint] = connection;
        this.connectionList.push(connection);

        this.onAdd.emit(connection);
        return true;
    }

    public remove(connection: T) {
        var endpoint = connection.endpoint;
        var mappedConnection = this.connectionMap[endpoint];
        if (!mappedConnection || mappedConnection !== connection) return false;

        delete this.connectionMap[endpoint];

        var index = this.connectionList.indexOf(connection);
        this.connectionList.splice(index, 1);

        this.onRemove.emit(connection);
        return true;
    }

    public get length(): number {
        return this.connectionList.length;
    }
}