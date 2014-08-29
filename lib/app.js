var hub = require("./hub");
var uuid = require("node-uuid");

var guid = uuid.v4();
var instance = hub.Hub.create(guid);

var W = window;

W.hub = instance;
//# sourceMappingURL=app.js.map
