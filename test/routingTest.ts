import client = require('../src/index');
import routing = client.routing;
import chai = require("chai");
var expect = chai.expect;

function WPatternTable() {
    var table = new routing.RoutingTable();

    table.add(new routing.RoutingRow("A", "B", "ramp://B/a"));
    table.add(new routing.RoutingRow("C", "B", "ramp://B/c"));
    table.add(new routing.RoutingRow("C", "D", "ramp://D/c"));
    table.add(new routing.RoutingRow("E", "D", "ramp://D/e"));
    table.add(new routing.RoutingRow("B", null, "root://B"));
    table.add(new routing.RoutingRow("D", null, "root://D"));

    return table;
}

function RandomScheme1Table() {
    var table = new routing.RoutingTable();

    table.add(new routing.RoutingRow("A", "D", "ramp://D/a"));
    table.add(new routing.RoutingRow("B", "D", "ramp://D/b"));
    table.add(new routing.RoutingRow("C", "D", "ramp://D/c"));
    table.add(new routing.RoutingRow("B", "E", "ramp://E/b"));
    table.add(new routing.RoutingRow("C", "E", "ramp://E/c"));
    table.add(new routing.RoutingRow("F", "E", "ramp://E/f"));
    table.add(new routing.RoutingRow("G", "E", "ramp://E/g"));
    table.add(new routing.RoutingRow("J", "E", "ramp://E/j"));
    table.add(new routing.RoutingRow("G", "I", "ramp://I/g"));
    table.add(new routing.RoutingRow("J", "I", "ramp://I/j"));
    table.add(new routing.RoutingRow("H", "I", "ramp://I/h"));
    table.add(new routing.RoutingRow("K", "I", "ramp://I/k"));
    table.add(new routing.RoutingRow("J", "L", "ramp://L/j"));
    table.add(new routing.RoutingRow("K", "L", "ramp://L/k"));
    table.add(new routing.RoutingRow("G", "M", "ramp://M/g"));
    table.add(new routing.RoutingRow("K", "M", "ramp://M/k"));
    table.add(new routing.RoutingRow("N", "M", "ramp://N/m"));

    table.add(new routing.RoutingRow("D", null, "root://D"));
    table.add(new routing.RoutingRow("E", null, "root://E"));
    table.add(new routing.RoutingRow("I", null, "root://I"));
    table.add(new routing.RoutingRow("M", null, "root://M"));
    table.add(new routing.RoutingRow("L", null, "root://L"));

    return table;
}

describe("Routing table basic functionality", () => {
    it("should fire onChanged when adding rows", () => {
        var table = new routing.RoutingTable();
        var fired = 0;
        table.onChanged.on(function () {
            fired++;
        });
        table.add(new routing.RoutingRow("A", "B", "ramp://A"));
        expect(fired).to.equals(1);
        table.add(new routing.RoutingRow("A", "B", "ramp://A"));
        expect(fired).to.equals(1);
        table.add(new routing.RoutingRow("B", null, "root://B"));
        expect(fired).to.equals(2);
        expect(table).to.have.lengthOf(2);
    });
});

describe("Routing path search", () => {
    it("W pattern", () => {
        var table = WPatternTable();

        expect(table.findPath("A", "E")).to.deep.equal([
            { child: 'A', parent: 'B', endpoint: 'root://B' },
            { parent: 'B', child: 'C', endpoint: 'ramp://B/c' },
            { child: 'C', parent: 'D', endpoint: 'root://D' },
            { parent: 'D', child: 'E', endpoint: 'ramp://D/e' }
        ]);
    });

    it("Random scheme #1", () => {
        var table = RandomScheme1Table();

        expect(table.findPath("N", "C")).to.deep.equal([
            { child: 'N', parent: 'M', endpoint: 'root://M' },
            { parent: 'M', child: 'G', endpoint: 'ramp://M/g' },
            { child: 'G', parent: 'E', endpoint: 'root://E' },
            { parent: 'E', child: 'C', endpoint: 'ramp://E/c' }
        ]);
    });
});

describe("Routing multiple paths search", () => {
    it("W pattern", () => {
        var table = WPatternTable();

        expect(table.findPaths("A", ["C", "E"])).to.deep.equal({
            "E": [
                { child: 'A', parent: 'B', endpoint: 'root://B' },
                { parent: 'B', child: 'C', endpoint: 'ramp://B/c' },
                { child: 'C', parent: 'D', endpoint: 'root://D' },
                { parent: 'D', child: 'E', endpoint: 'ramp://D/e' }
            ],
            "C": [
                { child: 'A', parent: 'B', endpoint: 'root://B' },
                { parent: 'B', child: 'C', endpoint: 'ramp://B/c' }
            ]
        });
    });

    it("Random scheme #1", () => {
        var table = RandomScheme1Table();

        expect(table.findPaths("N", ["C", "L"])).to.deep.equal({
            "C": [
                { child: 'N', parent: 'M', endpoint: 'root://M' },
                { parent: 'M', child: 'G', endpoint: 'ramp://M/g' },
                { child: 'G', parent: 'E', endpoint: 'root://E' },
                { parent: 'E', child: 'C', endpoint: 'ramp://E/c' }
            ],
            "L": [
                { child: "N", endpoint: "root://M", parent: "M" },
                { child: "K", endpoint: "ramp://M/k", parent: "M" },
                { child: "K", endpoint: "root://L", parent: "L" }
            ]
        });
    });
});

describe("Path merging", () => {
    it("Simple data", () => {
        var paths: {[name: string]: string[]} = {
            "A": ["1", "2", "3", "4", "5"],
            "B": ["1", "2", "6", "7", "8"],
            "C": ["1", "2", "6", "7"],
            "D": ["1", "2", "6", "7", "8", "9"],
        };

        expect(routing.mergePaths(paths, (s) => s)).to.deep.equal([
            {
                segment: "1",
                names: ["A", "B", "C", "D"],
                ends: [],
                children: [
                    {
                        segment: "2",
                        names: ["A", "B", "C", "D"],
                        ends: [],
                        children: [
                            {
                                segment: "3",
                                names: ["A"],
                                ends: [],
                                children: [
                                    {
                                        segment: "4",
                                        names: ["A"],
                                        ends: [],
                                        children: [
                                            {
                                                segment: "5",
                                                names: ["A"],
                                                ends: ["A"],
                                                children: []
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                segment: "6",
                                names: ["B", "C", "D"],
                                ends: [],
                                children: [
                                    {
                                        segment: "7",
                                        names: ["B", "C", "D"],
                                        ends: ["C"],
                                        children: [
                                            {
                                                segment: "8",
                                                names: ["B", "D"],
                                                ends: ["B"],
                                                children: [
                                                    {
                                                        segment: "9",
                                                        names: ["D"],
                                                        ends: ["D"],
                                                        children: []
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]);
    });
});