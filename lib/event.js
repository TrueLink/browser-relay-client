var Event = (function () {
    function Event(context) {
        this._handlers = [];
        this._context = context;
    }
    Event.prototype.emit = function (value) {
        var _this = this;
        this._handlers.forEach(function (handler) {
            handler.callback.call(handler.context || _this._context, value);
        });
    };

    Event.prototype.on = function (callback, context) {
        if (arguments.length == 2) {
            for (var i = 0; i < this._handlers.length; i++) {
                var handler = this._handlers[i];
                if (handler.callback == callback && handler.context == context)
                    return;
            }
        }
        this._handlers.push({ callback: callback, context: context });
    };

    Event.prototype.off = function (callback, context) {
        var remaining = [];
        if (arguments.length == 2) {
            for (var i = 0; i < this._handlers.length; i++) {
                var handler = this._handlers[i];
                if (handler.callback != callback)
                    continue;
                if (handler.context != context)
                    continue;
                remaining.push(handler);
            }
        } else {
            for (var i = 0; i < this._handlers.length; i++) {
                var handler = this._handlers[i];
                if (handler.callback != callback)
                    continue;
                remaining.push(handler);
            }
        }
        this._handlers = remaining;
    };
    return Event;
})();
exports.Event = Event;
//# sourceMappingURL=event.js.map
