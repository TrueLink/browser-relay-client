import event = require("./event");
export declare class RoutingRow {
    private _self;
    private _parent;
    private _endpoint;
    constructor(self: string, parent: string, endpoint: string);
    public self : string;
    public parent : string;
    public endpoint : string;
    public equals(row: RoutingRow): boolean;
}
export declare class RoutingTable {
    private _list;
    public onAdd: event.Event<RoutingRow>;
    constructor();
    public add(row: RoutingRow): void;
    public contains(row: RoutingRow): boolean;
    public update(other: RoutingTable): void;
    public subtract(other: RoutingTable): void;
    public length : number;
}
