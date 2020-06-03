"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TimeInfos = /** @class */ (function () {
    function TimeInfos() {
    }
    Object.defineProperty(TimeInfos.prototype, "start", {
        get: function () { return this._start; },
        set: function (s) {
            if (!!this._start)
                this._start.mergeWith(s);
            else
                this._start = s;
            if (!!this.end) {
                this.duration = this.start.diff(this.end);
            }
            else if (!!this.duration) {
                this.end = this.start.addTime(this.duration, true);
            }
            if (!!this.repetitionDelta && !this.repetitionDelta.dateFixed)
                this.repetitionDelta.dateSample = this.start;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TimeInfos.prototype, "end", {
        get: function () { return this._end; },
        set: function (e) {
            if (!!this._end)
                this._end.mergeWith(e);
            else
                this._end = e;
            if (!!this.start) {
                this.duration = this.start.diff(this.end);
            }
            else if (!!this.duration) {
                this.start = this.end.addTime(this.duration, false);
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TimeInfos.prototype, "repetitionDelta", {
        get: function () { return this._repetitionDelta; },
        set: function (r) {
            this._repetitionDelta = r;
            if (!this.repetitionDelta.dateFixed && !!this.start)
                this.repetitionDelta.dateSample = this.start;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TimeInfos.prototype, "exactDate", {
        get: function () { return this._exactDate; },
        set: function (d) {
            if (!this._exactDate)
                this._exactDate = d;
            else
                this._exactDate.mergeWith(d);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TimeInfos.prototype, "duration", {
        get: function () { return this._duration; },
        set: function (d) {
            if (!this.duration)
                this._duration = d;
            else
                this._duration.mergeWith(d);
            if (!!this.start && !this.end) {
                this.end = this.start.addTime(this.duration, true);
            }
            else if (!!this.end && !this.start) {
                this.start = this.end.addTime(this.duration, false);
            }
        },
        enumerable: false,
        configurable: true
    });
    TimeInfos.prototype.toString = function () {
        var out = '';
        if (!!this.start)
            out += '\r\nStart: ' + this.start.toString();
        if (!!this.end)
            out += '\r\nEnd: ' + this.end.toString();
        if (!!this.repetitionDelta) {
            out += '\r\nRepetitionDelta: ' + this.repetitionDelta.toString();
            out += '\r\n\t next => ' + this.repetitionDelta.getNextOccurence(this.start ? this.start : undefined);
            out += '\r\n\t 2next => ' + this.repetitionDelta.getNOccurencesAfter(2, this.start ? this.start : undefined);
        }
        if (!!this.exactDate)
            out += '\r\nExactDate: ' + this.exactDate.toString();
        if (!!this.duration)
            out += '\r\nDuration: ' + this.duration.toString();
        return out;
    };
    return TimeInfos;
}());
exports.default = TimeInfos;
//# sourceMappingURL=timeInfos.js.map