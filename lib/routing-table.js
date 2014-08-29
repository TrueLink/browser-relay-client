// This module should be common for client and server.
var event = require("./event");

var RoutingRow = (function () {
    function RoutingRow(self, parent, endpoint) {
        this._self = self;
        this._parent = parent;
        this._endpoint = endpoint;
    }
    Object.defineProperty(RoutingRow.prototype, "self", {
        get: function () {
            return this._self;
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(RoutingRow.prototype, "parent", {
        get: function () {
            return this._parent;
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(RoutingRow.prototype, "endpoint", {
        get: function () {
            return this._endpoint;
        },
        enumerable: true,
        configurable: true
    });

    RoutingRow.prototype.equals = function (row) {
        if (this._self != row._self)
            return false;
        if (this._parent != row._parent)
            return false;
        if (this._endpoint != row._endpoint)
            return false;
        return true;
    };

    RoutingRow.prototype.serialize = function () {
        return [this._self, this._parent, this._endpoint];
    };

    RoutingRow.deserialize = function (data) {
        return new RoutingRow(data[0], data[1], data[2]);
    };
    return RoutingRow;
})();
exports.RoutingRow = RoutingRow;

var RoutingTable = (function () {
    function RoutingTable() {
        this._list = [];
        this.onAdd = new event.Event();
    }
    RoutingTable.prototype.add = function (row) {
        this._list.push(row);
    };

    RoutingTable.prototype.contains = function (row) {
        for (var i = 0; i < this._list.length; i++) {
            if (this._list[i].equals(row)) {
                return true;
            }
        }

        return false;
    };

    RoutingTable.prototype.update = function (other) {
        for (var i = 0; i < other._list.length; i++) {
            var row = other._list[i];
            if (this.contains(row))
                continue;
            this.add(row);
        }
    };

    RoutingTable.prototype.subtract = function (other) {
        var remaining = [];
        for (var i = 0; i < this._list.length; i++) {
            var row = this._list[i];
            if (other.contains(row))
                continue;
            remaining.push(row);
        }
        this._list = remaining;
    };

    Object.defineProperty(RoutingTable.prototype, "length", {
        get: function () {
            return this._list.length;
        },
        enumerable: true,
        configurable: true
    });

    RoutingTable.prototype.serialize = function () {
        var data = [];
        for (var i = 0; i < this._list.length; i++) {
            var row = this._list[i];
            data.push(row.serialize());
        }
        return data;
    };

    RoutingTable.deserialize = function (data) {
        var table = new RoutingTable();
        for (var i = 0; i < data.length; i++) {
            var item = data[i];
            table._list.push(RoutingRow.deserialize(item));
        }
        return table;
    };
    return RoutingTable;
})();
exports.RoutingTable = RoutingTable;
//# sourceMappingURL=routing-table.js.map
