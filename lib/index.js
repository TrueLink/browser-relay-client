var protocol = require("./protocol");
exports.protocol = protocol;
var connectionManager = require("./connection-manager");
exports.connectionManager = connectionManager;

var scope = {
    protocol: exports.protocol,
    connectionManager: exports.connectionManager
};
//# sourceMappingURL=index.js.map
