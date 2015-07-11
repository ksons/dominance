var dominance = require("..");
var assert = require("assert");
var Set = require("analyses").Set;

function addEdge(from, to) {
    from.next = from.next || [];
    from.prev = from.prev || [];
    if (!Array.isArray(to)) {
        to = [to];
    }
    to.forEach(function (target) {
        target.next = target.next || [];
        target.prev = target.prev || [];

        from.next.push(target);
        target.prev.push(from);
    })
}

describe('Dominance algorithm', function () {


    it("wiki example", function () {
        var n1 = {}, n2 = {}, n3 = {}, n4 = {}, n5 = {}, n6 = {};
        addEdge(n1, n2);
        addEdge(n2, [n3, n4, n6]);
        addEdge(n3, n5);
        addEdge(n4, n5);
        addEdge(n5, n2);

        var nodes = [n1, n2, n3, n4, n5, n6].map(function (n, i) {
            n.name = "n" + (i + 1);
            return n
        });
        var cfg = [n1, n6, nodes];

        var result = dominance.dom(cfg);
        nodes.forEach(function (n) {
            var s = result.get(n);
            // All have n1 as dominator
            assert.ok(s.has(n1));
            // All have themselevs as dominator
            assert.ok(s.has(n));
        });
    });

    it("irreducable graph", function () {
        var n1 = {}, n2 = {}, n3 = {}, n4 = {}, n5 = {};
        addEdge(n1, n2);
        addEdge(n2, n1);
        addEdge(n3, n2);
        addEdge(n4, n1);
        addEdge(n5, [n3, n4]);

        var nodes = [n1, n2, n3, n4, n5].map(function (n, i) {
            n.name = "n" + (i + 1);
            return n
        });
        var cfg = [n5, n5, nodes];

        var result = dominance.dom(cfg);
        nodes.forEach(function (n) {
            var s = result.get(n);
            // All have n5 as dominator
            assert.ok(s.has(n5));
            // All have themselevs as dominator
            assert.ok(s.has(n));

            n !== n5 && assert.equal(2, s.size);
            n == n5 && assert.equal(1, s.size);

        });

        result = dominance.sdom(cfg);
        nodes.forEach(function (n) {
            var s = result.get(n);
            // All but n5 have n5 as dominator
            n !== n5 && assert.ok(s.has(n5));
            // None has itself as dominator
            assert.ok(!s.has(n));

            n !== n5 && assert.equal(1, s.size);
            n == n5 && assert.equal(0, s.size);

        });
    });


    it("cse graph", function () {
        var n0 = {}, n1 = {}, n2 = {}, n3 = {}, n4 = {}, n5 = {}, n6 = {}, n7 = {}, n8 = {};
        addEdge(n0, n1);
        addEdge(n1, [n2, n5]);
        addEdge(n2, n3);
        addEdge(n3, [n4, n1]);
        //addEdge(n4, n1);
        addEdge(n5, [n6, n8]);
        addEdge(n6, n7);
        addEdge(n7, n3);
        addEdge(n8, n7);


        var nodes = [n0, n1, n2, n3, n4, n5, n6, n7, n8].map(function (n, i) {
            n.name = "" + (i);
            return n
        });
        var cfg = [n0, n4, nodes];

        var doms = [[n0], [n0, n1], [n0, n1, n2], [n0, n1, n3], [n0, n1, n3, n4], [n0, n1, n5], [n0, n1, n5, n6], [n0, n1, n5, n7], [n0, n1, n5, n8]];
        var result = dominance.dom(cfg);
        nodes.forEach(function (n, i) {
            var s = result.get(n);
            // All have n0 as dominator
            assert.ok(s.has(n0));
            // All have themselves as dominator
            assert.ok(s.has(n));

            assert(Set.equals(new Set(doms[i]), s));
        });


        var idom = dominance.idom(cfg);
        var expected = [null, n0, n1, n1, n3, n1, n5, n5, n5];
        nodes.forEach(function (n, i) {
            assert.strictEqual(expected[i], idom.get(n));
        });

        var tree = dominance.dominator_tree(cfg);

    });


});
