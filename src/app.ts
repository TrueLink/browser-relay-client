import hub = require("./hub")

var instance = hub.Hub.create();

var W: any = window;

W.hub = instance;
