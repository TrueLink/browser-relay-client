import hub = require("./hub")
import uuid = require("node-uuid");

var guid = uuid.v4();
var instance = hub.Hub.create(guid);

var W: any = window;

W.hub = instance;
