"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TreeParser = /** @class */ (function () {
    function TreeParser(settings0) {
        if (Array.isArray(settings0) || typeof settings0 !== 'object')
            throw new Error('Can\'t create a TreeParser with those settings');
        for (var _i = 0, _a = Object.keys(settings0); _i < _a.length; _i++) {
            var key = _a[_i];
            var child = settings0[key];
            if (!Array.isArray(child))
                throw new Error('All childs need to be Arrays');
            for (var _b = 0, child_1 = child; _b < child_1.length; _b++) {
                var subChild = child_1[_b];
                if (typeof subChild !== 'string')
                    throw new Error('All childs should contain only Strings');
            }
        }
        this._tree = settings0;
    }
    TreeParser.prototype.findParentOfMatching = function (str) {
        for (var _i = 0, _a = Object.keys(this._tree); _i < _a.length; _i++) {
            var key = _a[_i];
            var children = this._tree[key];
            for (var _b = 0, children_1 = children; _b < children_1.length; _b++) {
                var child = children_1[_b];
                if (new RegExp(child, 'gi').test(str))
                    return key;
            }
        }
    };
    TreeParser.prototype.findChildrenOfMatching = function (str) {
        for (var _i = 0, _a = Object.keys(this._tree); _i < _a.length; _i++) {
            var key = _a[_i];
            var children = this._tree[key];
            if (new RegExp(key, 'gi').test(str))
                return children;
        }
    };
    TreeParser.prototype.findParentOfMatched = function (rx) {
        for (var _i = 0, _a = Object.keys(this._tree); _i < _a.length; _i++) {
            var key = _a[_i];
            var children = this._tree[key];
            for (var _b = 0, children_2 = children; _b < children_2.length; _b++) {
                var child = children_2[_b];
                if (rx.test(child))
                    return key;
            }
        }
    };
    TreeParser.prototype.findChildrenOfMatched = function (rx) {
        for (var _i = 0, _a = Object.keys(this._tree); _i < _a.length; _i++) {
            var key = _a[_i];
            var children = this._tree[key];
            if (rx.test(key))
                return children;
        }
    };
    return TreeParser;
}());
exports.default = TreeParser;
//# sourceMappingURL=treeParser.js.map