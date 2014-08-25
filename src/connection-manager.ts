// This module should be common for client and server. 

import event = require("./event");

export interface IConnection {
    address: string;
}

function noop(connection: IConnection): void {
}

export class ConnectionManager<T extends IConnection> {
    private connectionMap: { [address: string]: T; } = {};
    private connectionList: Array<T> = [];

    public onAdded: event.Event<T>;
    public onRemoved: event.Event<T>;

    constructor() {
        this.onAdded = new event.Event<T>();
        this.onRemoved = new event.Event<T>();
    }

    public get(): Array<T>;
    public get(address: string): T;
    public get(address?: string): any {
        if (address === undefined) {
            return this.connectionList.slice();
        }

        return this.connectionMap[address];
    }

    public add(connection: T) {
        var address = connection.address;
        if (address in this.connectionMap) return false;

        this.connectionMap[address] = connection;
        this.connectionList.push(connection);

        this.onAdded.emit(connection);
        return true;
    }

    public remove(connection: T) {
        var address = connection.address;

        var mappedConnection = this.connectionMap[address];
        if (!mappedConnection || mappedConnection !== connection) return false;

        delete this.connectionMap[address];

        var index = this.connectionList.indexOf(connection);
        this.connectionList.splice(index, 1);

        this.onRemoved.emit(connection);
        return true;
    }
}