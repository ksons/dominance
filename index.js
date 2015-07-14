var worklist = require("analyses");
var Set = worklist.Set;

var dominance = function (cfg) {
    return worklist(cfg, function (input, list) {
        var s = new Set([this]);
        var result = Set.union(input, s);
        /*console.log("result for ", this.name, ":", result.values().map(function (v) {
            return v.name;
        }).join(", "));*/
        return result;
    }, {
        direction: 'forward',
        merge: worklist.merge(Set.intersect)
    });
};

var strict_dominance = function (cfg) {
    var result = dominance(cfg);
    cfg[2].forEach(function(node) {
        var s = result.get(node);
        s.delete(node);
    });
    return result;
};

var immediate_dominator = function(cfg) {
    var sdom = strict_dominance(cfg);
    var result = new Map();

    cfg[2].forEach(function(node) {
        var dominator_nodes = sdom.get(node);
        var idom = bfs(node, function(n) {
            return dominator_nodes.has(n);
        }, "prev");
        result.set(node, idom);
        //console.log(node.name, " -> ", idom ? idom.name : idom);
    });
    return result;
};

var dominator_tree = function(cfg) {
    var idom_map = immediate_dominator(cfg);
    var tree_map = new Map();
    var root;

    cfg[2].forEach(function(node) {
        var child = { value: node.name, children: [] };
        if (tree_map.has(node))
          return;

        var idom = idom_map.get(node);
        if(idom == null) {
            root = child;
        } else {
            var parent = tree_map.get(idom);
            if (!parent) {
                parent = { value: idom.name, children: [] };
                tree_map.set(idom, parent);
            }
            parent.children.push(child);
        }
        tree_map.set(node, child);
    });
    return root;

};

function bfs(start, visit, next) {
    var queue = [start];
    var seen = new Set([start]);
    while (queue.length) {
        var x = queue.shift();
        if (visit(x)) {
            return x;
        }
        var reachable = x[next];
        for (var i = 0; i < reachable.length; i++) {
            var c = reachable[i];
            if (!seen.has(c)) {
                seen.add(c);
                queue.push(c);
            }
        }
    }
    return null;
}


module.exports = {
    dom: dominance,
    sdom: strict_dominance,
    idom: immediate_dominator,
    dominator_tree: dominator_tree
};
