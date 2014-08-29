// This module should be common for client and server.
var event = require("./event");

function noop(connection) {
}

var ConnectionManager = (function () {
    function ConnectionManager() {
        this._connectionMap = {};
        this._connectionList = [];
        this.onAdd = new event.Event();
        this.onRemove = new event.Event();
    }
    ConnectionManager.prototype.get = function (key) {
        if (key === undefined) {
            return this._connectionList.slice();
        }

        return this._connectionMap[key];
    };

    ConnectionManager.prototype.add = function (connection) {
        var endpoint = connection.endpoint;
        if (endpoint in this._connectionMap)
            return false;

        this._connectionMap[endpoint] = connection;
        this._connectionList.push(connection);

        this.onAdd.emit(connection);
        return true;
    };

    ConnectionManager.prototype.remove = function (connection) {
        var endpoint = connection.endpoint;
        var mappedConnection = this._connectionMap[endpoint];
        if (!mappedConnection || mappedConnection !== connection)
            return false;

        delete this._connectionMap[endpoint];

        var index = this._connectionList.indexOf(connection);
        this._connectionList.splice(index, 1);

        this.onRemove.emit(connection);
        return true;
    };

    Object.defineProperty(ConnectionManager.prototype, "length", {
        get: function () {
            return this._connectionList.length;
        },
        enumerable: true,
        configurable: true
    });
    return ConnectionManager;
})();
exports.ConnectionManager = ConnectionManager;
//# sourceMappingURL=connection-manager.js.map
