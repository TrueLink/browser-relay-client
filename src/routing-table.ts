// This module should be common for client and server. 

import event = require("./event");

export class RoutingRow {

    private _self: string; // guid
    private _parent: string; // guid
    private _endpoint: string; // url-like

    constructor(self: string, parent: string, endpoint: string) {
        this._self = self;
        this._parent = parent;
        this._endpoint = endpoint;
    }

    public get self(): string {
        return this._self;
    }

    public get parent(): string {
        return this._parent;
    }

    public get endpoint(): string {
        return this._endpoint;
    }

    public equals(row: RoutingRow): boolean {
        if (this._self != row._self) return false;
        if (this._parent != row._parent) return false;
        if (this._endpoint != row._endpoint) return false;
        return true;
    }

    public serialize(): any {
        return [this._self, this._parent, this._endpoint];
    }

    static deserialize(data: any): RoutingRow {
        return new RoutingRow(data[0], data[1], data[2]);
    } 
}

export class RoutingTable {
    private _list: Array<RoutingRow> = [];

    private _onChanged: event.Event<RoutingTable> = new event.Event<RoutingTable>();

    public get onChanged(): event.Event<RoutingTable> {
        return this._onChanged;
    }

    constructor() {
    }

    public add(row: RoutingRow): void {
        if (this.contains(row)) return;
        this._list.push(row);
        this._onChanged.emit(this);
    }

    public contains(row: RoutingRow): boolean {
        for (var i = 0; i < this._list.length; i++) {
            if (this._list[i].equals(row)) {
                return true;
            }
        }

        return false;
    }

    public update(other: RoutingTable): void {
        var changed = false;
        for (var i = 0; i < other._list.length; i++) {
            var row = other._list[i];
            if (this.contains(row)) continue;
            changed = true;
            this._list.push(row);
        }
        if (changed) {
            this._onChanged.emit(this);
        }
    }

    public subtract(other: RoutingTable): void {
        var remaining: Array<RoutingRow> = [];
        for (var i = 0; i < this._list.length; i++) {
            var row = this._list[i];
            if (other.contains(row)) continue;
            remaining.push(row);
        }
        var changed = this._list.length == remaining.length;
        this._list = remaining;
        if (changed) {
            this._onChanged.emit(this);
        }
    }

    public get length(): number {
        return this._list.length;
    }

    public serialize(): any {
        var data: any[] = [];
        for (var i = 0; i < this._list.length; i++) {
            var row = this._list[i];
            data.push(row.serialize());
        }
        return data;
    }

    static deserialize(data: any[]): RoutingTable {
        var table = new RoutingTable();
        for (var i = 0; i < data.length; i++) {
            var item = data[i];
            table._list.push(RoutingRow.deserialize(item));
        }
        return table;
    }
}
