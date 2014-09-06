import client = require('../src/index');
import event = client.event;
import chai = require("chai");
var expect = chai.expect;

describe("Event point tests", () => {
    var e: event.Event<number>;
    var log: any[];

    beforeEach(() => {
        e = new event.Event<number>();
        log = [];
    });

    afterEach(() => {
        delete e;
        delete log;
    });

    it("should run callbacks", () => {
        var cb = function (x: number) {
            log.push([this, x]);
        }

        var a: any = { "id": "A" };
        var b: any = { "id": "B" };

        e.on(cb, a);
        e.on(cb, b);
        e.emit(1);
        e.emit(2);

        expect(log).to.deep.equal([
            [a, 1],
            [b, 1],
            [a, 2],
            [b, 2],
        ]);
    });

    it("should subscribe additional callbacks", () => {
        var cb = function (x: number) {
            log.push([this, x]);
        }

        var a: any = { "id": "A" };
        var b: any = { "id": "B" };
        var c: any = { "id": "C" };

        e.on(cb, a);
        e.on(cb, b);
        e.emit(1);
        e.on(cb, c);
        e.on(cb, c);
        e.on(cb, b);
        e.emit(2);

        expect(log).to.deep.equal([
            [a, 1],
            [b, 1],
            [a, 2],
            [b, 2],
            [c, 2],
        ]);
    });

    it("should subscribe additional callbacks from callbacks", () => {
        var cb = function (x: number) {
            log.push([this, x]);
        }

        var a: any = { "id": "A" };
        var b: any = { "id": "B" };
        var c: any = { "id": "C" };

        e.on(cb, a);
        e.on(function (value) {
            cb.call(this, value);
            e.on(cb, c);
        }, b);
        e.emit(1);
        e.emit(2);
        e.emit(3);

        expect(log).to.deep.equal([
            [a, 1],
            [b, 1],
            [a, 2],
            [b, 2],
            [c, 2],
            [a, 3],
            [b, 3],
            [c, 3],
        ]);
    });

    it("should unsubscribe callbacks", () => {
        var cb = function (x: number) {
            log.push([this, x]);
        }

        var a: any = { "id": "A" };
        var b: any = { "id": "B" };
        var c: any = { "id": "C" };

        e.on(cb, a);
        e.on(cb, b);
        e.on(cb, c);
        e.emit(1);
        e.off(cb, b)
        e.emit(2);

        expect(log).to.deep.equal([
            [a, 1],
            [b, 1],
            [c, 1],
            [a, 2],
            [c, 2],
        ]);
    });

    it("should not unsubscribe callbacks from callbacks immediately", () => {
        var cb = function (x: number) {
            log.push([this, x]);
        }

        var a: any = { "id": "A" };
        var b: any = { "id": "B" };
        var c: any = { "id": "C" };
        var d: any = { "id": "C" };

        e.on(cb, a);
        e.on(function (value) {
            cb.call(this, value);
            e.off(cb, c);
        }, b);
        e.on(cb, c);
        e.on(cb, d);
        e.emit(1);
        e.emit(2);

        expect(log).to.deep.equal([
            [a, 1],
            [b, 1],
            [c, 1],
            [d, 1],
            [a, 2],
            [b, 2],
            [d, 2],
        ]);
    });

    it("should unsubscribe callbacks by function", () => {
        var cb1 = function (x: number) {
            log.push([this, x]);
        }

        var cb2 = function (x: number) {
            log.push([this, x, x]);
        }

        var a: any = { "id": "A" };
        var b: any = { "id": "B" };

        e.on(cb1, a);
        e.on(cb2, a);
        e.on(cb1, b);
        e.on(cb2, b);
        e.emit(1);
        e.off(cb1);
        e.emit(2);

        expect(log).to.deep.equal([
            [a, 1],
            [a, 1, 1],
            [b, 1],
            [b, 1, 1],
            [a, 2, 2],
            [b, 2, 2],
        ]);
    });

    it("should unsubscribe callbacks by context", () => {
        var cb1 = function (x: number) {
            log.push([this, x]);
        }

        var cb2 = function (x: number) {
            log.push([this, x, x]);
        }

        var a: any = { "id": "A" };
        var b: any = { "id": "B" };

        e.on(cb1, a);
        e.on(cb2, a);
        e.on(cb1, b);
        e.on(cb2, b);
        e.emit(1);
        e.off(null, a);
        e.emit(2);

        expect(log).to.deep.equal([
            [a, 1],
            [a, 1, 1],
            [b, 1],
            [b, 1, 1],
            [b, 2],
            [b, 2, 2],
        ]);
    });

});