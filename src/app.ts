import hub = require("./hub")

var serverAddress = 'ws://127.0.0.1:20500/';

var instance = hub.Hub.create();

console.log(instance);

instance.connect(serverAddress);