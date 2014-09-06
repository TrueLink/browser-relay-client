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
});