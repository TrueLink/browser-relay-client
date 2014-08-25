var event = require("./event");
exports.event = event;
var protocol = require("./protocol");
exports.protocol = protocol;
var connectionManager = require("./connection-manager");
exports.connectionManager = connectionManager;

var scope = {
    event: exports.event,
    protocol: exports.protocol,
    connectionManager: exports.connectionManager
};
//# sourceMappingURL=index.js.map
