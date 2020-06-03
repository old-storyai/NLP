"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Range = /** @class */ (function () {
    function Range(start0, parent0) {
        this.start = start0;
        this.parent = parent0;
        this.children = [];
    }
    Range.prototype.getLowestChildForPos = function (pos) {
        if (this.start > pos || this.end < pos)
            return undefined;
        var out = this.children.reduce(function (acc, kid) { return kid.getLowestChildForPos(pos) || acc; }, undefined);
        return out || this;
    };
    Range.prototype.getLowestUnclosedChildForPos = function (pos) {
        if (this.start > pos || !!this.end)
            return undefined;
        var out = this.children.reduce(function (acc, kid) { return kid.getLowestUnclosedChildForPos(pos) || acc; }, undefined);
        return out || this;
    };
    Range.prototype.startNewSubRange = function (startPos, endPos) {
        if (endPos === void 0) { endPos = undefined; }
        var p = this;
        while (p !== undefined) {
            if (!!p.end && startPos > p.end)
                throw new Error('Cannot start a range after the end of one of its parent');
            p = p.parent;
        }
        var properParent = this.getLowestChildForPos(startPos);
        var r = new Range(startPos, properParent);
        if (!!endPos)
            r.endRange(endPos);
        properParent.children.push(r);
        return r;
    };
    Range.prototype.endRangeForLowestChild = function (pos) {
        var r = this.getLowestUnclosedChildForPos(pos);
        if (!r)
            throw new Error('No opened range can be closed at that position');
        r.endRange(pos);
    };
    Range.prototype.endRange = function (pos) {
        if (pos < this.start)
            throw new Error('Cannot end a range before or at its starting point');
        var p = this.parent;
        while (p !== undefined) {
            if (!!p.end && pos > p.end)
                throw new Error('Cannot end a range after the end of one of its parent');
            p = p.parent;
        }
        if (!!this.end)
            throw new Error('This range already has a defined end');
        this.children.forEach(function (kid) {
            if (!!kid.end && pos < kid.end)
                throw new Error('Cannot close a range before the end of one of its kids');
        });
        this.end = pos;
        return this.parent;
    };
    Range.prototype.toString = function () {
        var kidsIndex = {};
        this.children.forEach(function (kid) {
            kidsIndex[kid.start] = kid;
        });
        var out = '';
        for (var i = this.start; true; i++) {
            if (i in kidsIndex) {
                out += kidsIndex[i].toString();
                i = kidsIndex[i].end;
                delete kidsIndex[i];
            }
            else
                out += ' ';
            if ((!!this.end && i >= this.end) || (!this.end && Object.keys(kidsIndex).length > 0))
                break;
        }
        return "(" + out.slice(1, -1) + ")";
    };
    return Range;
}());
exports.default = Range;
//# sourceMappingURL=range.js.map