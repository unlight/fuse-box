"use strict";
class ASTTraverse {
    static traverse(root, options) {
        options = options || {};
        let pre = options.pre;
        let post = options.post;
        let skipProperty = options.skipProperty;
        let visit = (node, parent, prop, idx) => {
            if (!node || typeof node.type !== "string") {
                return;
            }
            if (node._visited) {
                return;
            }
            let res = undefined;
            if (pre) {
                res = pre(node, parent, prop, idx);
            }
            node._visited = true;
            if (res !== false) {
                for (let prop in node) {
                    if (skipProperty ? skipProperty(prop, node) : prop[0] === "$") {
                        continue;
                    }
                    let child = node[prop];
                    if (Array.isArray(child)) {
                        for (let i = 0; i < child.length; i++) {
                            visit(child[i], node, prop, i);
                        }
                    }
                    else {
                        visit(child, node, prop);
                    }
                }
            }
            if (post) {
                post(node, parent, prop, idx);
            }
        };
        visit(root, null);
    }
}
exports.ASTTraverse = ASTTraverse;
