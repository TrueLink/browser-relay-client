// This module should be common for client and server.
var event = require("./event");

function noop(connection) {
}

var ConnectionManager = (function () {
    function ConnectionManager() {
        this.connectionMap = {};
        this.connectionList = [];
        this.onAdd = new event.Event();
        this.onRemove = new event.Event();
    }
    ConnectionManager.prototype.get = function (key) {
        if (key === undefined) {
            return this.connectionList.slice();
        }

        return this.connectionMap[key];
    };

    ConnectionManager.prototype.add = function (connection) {
        var endpoint = connection.endpoint;
        if (endpoint in this.connectionMap)
            return false;

        this.connectionMap[endpoint] = connection;
        this.connectionList.push(connection);

        this.onAdd.emit(connection);
        return true;
    };

    ConnectionManager.prototype.remove = function (connection) {
        var endpoint = connection.endpoint;
        var mappedConnection = this.connectionMap[endpoint];
        if (!mappedConnection || mappedConnection !== connection)
            return false;

        delete this.connectionMap[endpoint];

        var index = this.connectionList.indexOf(connection);
        this.connectionList.splice(index, 1);

        this.onRemove.emit(connection);
        return true;
    };

    Object.defineProperty(ConnectionManager.prototype, "length", {
        get: function () {
            return this.connectionList.length;
        },
        enumerable: true,
        configurable: true
    });
    return ConnectionManager;
})();
exports.ConnectionManager = ConnectionManager;
//# sourceMappingURL=connection-manager.js.map
