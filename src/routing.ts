﻿// This module should be common for client and server. 

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

export interface PathSegment {
    child: string;
    parent: string;
    endpoint: string;
}

export class RoutingTable {
    private _list: Array<RoutingRow> = [];

    private _onChanged: event.Event<RoutingTable> = new event.Event<RoutingTable>();

    public get onChanged(): event.Event<RoutingTable> {
        return this._onChanged;
    }

    constructor() {
    }

    public findLinkedParents(self: string): string[] {
        var result: string[] = [];
        for (var i = 0; i < this._list.length; i++) {
            var row = this._list[i];
            if (row.self != self) continue;
            result.push(row.parent);
        }
        return result;
    }

    public findLinkedChildren(parent: string): string[] {
        var result: string[] = [];
        for (var i = 0; i < this._list.length; i++) {
            var row = this._list[i];
            if (row.parent != parent) continue;
            result.push(row.self);
        }
        return result;
    }

    public findEndpoint(self: string, parent: string): string {
        for (var i = 0; i < this._list.length; i++) {
            var row = this._list[i];
            if (row.self != self) continue;
            if (row.parent != parent) continue;
            return row.endpoint;
        }
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

    public get children(): string[] {
        var result: string[] = [];
        for (var i = 0; i < this._list.length; i++) {
            var row = this._list[i];
            if (result.indexOf(row.self) >= 0) continue;
            result.push(row.self);
        }
        return result;
    }

    public get parents(): string[]{
        var result: string[] = [];
        for (var i = 0; i < this._list.length; i++) {
            var row = this._list[i];
            if (result.indexOf(row.parent) >= 0) continue;
            result.push(row.parent);
        }
        return result;
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

    private _wave(source: string, callback: (current: string, path: PathSegment[]) => boolean) {
        var queue: string[] = [];
        var paths: { [key: string]: PathSegment[] } = {};

        queue.push(source);
        paths[source] = [];

        while (queue.length > 0) {
            var current = queue.shift();

            if (!callback(current, paths[current])) break;

            this.findLinkedChildren(current).forEach((child) => {
                if (child in paths) return;
                queue.push(child);
                paths[child] = paths[current].concat([{
                    parent: current,
                    child: child,
                    endpoint: this.findEndpoint(child, current),
                }]);
            });

            this.findLinkedParents(current).forEach((parent) => {
                if (parent in paths) return;
                queue.push(parent);
                paths[parent] = paths[current].concat([{
                    child: current,
                    parent: parent,
                    endpoint: this.findEndpoint(parent, null),
                }]);
            });
        }
    }

    public findPath(source: string, destination: string) {
        var result: PathSegment[] = null;
        this._wave(source, (current, path) => {
            if (current == destination) {
                result = path;
                return false;
            }
            return true;
        })
        return result;
    }

    public findPaths(source: string, destinations: string[]): { [destination: string]: PathSegment[] } {
        var result: { [destination: string]: PathSegment[] } = {};
        var size = 0;
        this._wave(source, (current, path) => {
            for (var i = 0; i < destinations.length; i++) {
                var destination = destinations[i];
                if (destination in result) continue;
                if (current != destination) continue;
                size++;
                result[destination] = path;
                if (destinations.length == size) return false;
                break;
            }
            return true;
        })
        return result;
    }
}

export interface PathTreeNode<T> {
    segment: T;
    children: PathTreeNode<T>[];
    names: string[];
    ends: string[];
}

export function mergePaths<T>(paths: { [name: string]: T[] }, getkey: (item: T) => string): PathTreeNode<T>[]{
    var first: { [name: string]: T } = {};
    for (var name in paths) {
        first[name] = paths[name].shift();
    }

    var groups: {
        [key: string]: PathTreeNode<T>
    } = {};
    for (var name in first) {
        var segment = first[name];
        var key = getkey(segment);
        if (!(key in groups)) {
            groups[key] = {
                segment: segment,
                names: [],
                children: [],
                ends: [],
            };
        }
        groups[key].names.push(name);
    }

    var result: PathTreeNode<T>[] = [];
    var key: string;
    for (key in groups) {
        var group = groups[key];
        result.push(group);
        var childPaths: { [name: string]: T[] } = {};
        var count = 0;
        for (var i = 0; i < group.names.length; i++) {
            var gname = group.names[i];
            if (paths[gname].length == 0) {
                group.ends.push(gname);
            } else {
                childPaths[gname] = paths[gname];
                count++;
            }
        }
        if (count == 0) continue;
        group.children = mergePaths(childPaths, getkey);
    }

    return result;
}
