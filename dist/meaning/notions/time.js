"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var moment_1 = __importDefault(require("moment"));
var tokenizer_1 = require("../../grammar/tokenizer");
var Data = __importStar(require("../../data/data"));
var thing_1 = __importDefault(require("./thing/thing"));
var stringParser_1 = __importDefault(require("../../data/stringParser"));
var durationComponent_1 = __importDefault(require("./timeComponents/durationComponent"));
exports.DurationComponent = durationComponent_1.default;
var dateComponent_1 = __importDefault(require("./timeComponents/dateComponent"));
exports.DateComponent = dateComponent_1.default;
var repetitionComponent_1 = __importDefault(require("./timeComponents/repetitionComponent"));
exports.RepetitionComponent = repetitionComponent_1.default;
var operatorComponent_1 = __importDefault(require("./timeComponents/operatorComponent"));
exports.OperatorComponent = operatorComponent_1.default;
var timeInfos_1 = __importDefault(require("./timeComponents/timeInfos"));
exports.TimeInfos = timeInfos_1.default;
var Time = /** @class */ (function (_super) {
    __extends(Time, _super);
    function Time() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Time.prototype.processWords = function () {
        this.findDate();
    };
    Time.prototype.findDate = function () {
        var _this = this;
        this._timeCode = '';
        var str = new tokenizer_1.WordGroup(__spreadArrays(this._conns, this._wordGroup.words), '').toString();
        new stringParser_1.default(Data.getData('timeComponents'))
            .parseString(str, function (_, timeMeaning) {
            _this._timeCode += ' ' + timeMeaning;
        }, function () { }, [
            function (unit, delta, modifier) {
                var m = moment_1.default().add(delta, unit);
                if (modifier === 'start')
                    m = m.startOf(unit);
                if (modifier === 'end')
                    m = m.endOf(unit);
                return m.format();
            }
        ]);
        this._timeCode = this._timeCode.trim();
        this.parseTimeCode();
    };
    Time.prototype.parseTimeCode = function () {
        var _a;
        var _this = this;
        this.timeInfos = new timeInfos_1.default();
        var prevComps = [];
        var pendingNumber = null;
        var pendingStr = '';
        //
        // Grouping the time elements, and creating instances
        //
        this._timeCode.split(/\s+/).forEach(function (timePart) {
            var comp = _this.parseTimeCodeComponent(timePart);
            if (typeof comp === 'number') {
                if (pendingStr.length)
                    comp = _this.parseTimeCodeComponent(pendingStr + "~" + comp);
                else {
                    pendingNumber = comp;
                    return;
                }
            }
            if (typeof comp === 'string') {
                if (pendingNumber !== null)
                    comp = _this.parseTimeCodeComponent(comp + "~" + pendingNumber);
                else {
                    pendingStr = comp;
                    return;
                }
            }
            var prev = prevComps[0];
            if (prev instanceof dateComponent_1.default && comp instanceof dateComponent_1.default) {
                prev.mergeWith(comp);
                return;
            }
            if (comp instanceof durationComponent_1.default) {
                if (prev instanceof operatorComponent_1.default &&
                    prev.isAddition()) {
                    prevComps.shift(); // We take it off because it makes no sense
                    prev = prevComps[0];
                }
                if (prev instanceof durationComponent_1.default) {
                    prev.mergeWith(comp);
                    return;
                }
            }
            if (comp instanceof repetitionComponent_1.default) {
                if (pendingNumber !== null)
                    comp.amount = pendingNumber;
                // If the prev is just a day, it's probably an amount for the event ("3rd monday")
                if (prev instanceof dateComponent_1.default) {
                    var units = prev.fixedUnits;
                    if (units.length === 1 && units[0] === 'D') {
                        comp.amount = prev.moment.date();
                        prevComps.shift();
                        prev = prevComps[0];
                    }
                }
            }
            prevComps.unshift(comp);
            pendingNumber = null;
            pendingStr = '';
        });
        prevComps = prevComps.filter(function (comp) { return !!comp; }).reverse();
        //
        // Some more elements grouping
        //
        for (var idx = 0; idx < prevComps.length; idx++) {
            var elem = prevComps[idx];
            if (elem instanceof repetitionComponent_1.default) {
                if (prevComps[idx - 1] instanceof dateComponent_1.default) {
                    // e.g. 6pm on Christmas
                    var date = prevComps[idx - 1];
                    if (date.fixedUnits.includes('D')) {
                        elem.amount = date.getUnit('D');
                        date.removeUnit('D');
                    }
                    elem.event = date.toRepetition();
                    prevComps.splice(idx - 1, 1);
                    idx--;
                }
                else if (prevComps[idx + 1] instanceof dateComponent_1.default) {
                    // e.g. Christmas 2021
                    var date = prevComps[idx + 1];
                    date.minimize();
                    if (!elem.addSamplePrecisions(date)) {
                        elem = elem.getNOccurencesAfter(elem.amount, date);
                    }
                    prevComps.splice(idx + 1, 1);
                }
            }
            prevComps[idx] = elem;
        }
        prevComps = prevComps.filter(function (comp) { return !!comp; });
        var prevs = [];
        var nexts = prevComps.slice(0);
        //
        // Actual calculations with operators
        //
        while (nexts.length) {
            var curr = nexts.shift();
            if (curr instanceof operatorComponent_1.default)
                _a = curr.operate(prevs, nexts, this.timeInfos), prevs = _a[0], nexts = _a[1];
            else
                prevs.push(curr);
        }
        prevs.forEach(function (remainingComp) {
            if (remainingComp instanceof dateComponent_1.default) {
                if (!remainingComp.hasConsistentFixedUnits()) {
                    remainingComp = remainingComp.toRepetition().getNextOccurence(_this.timeInfos.start ? _this.timeInfos.start : undefined);
                }
                if (!_this.timeInfos.exactDate)
                    _this.timeInfos.exactDate = remainingComp;
                else
                    _this.timeInfos.exactDate.mergeWith(remainingComp);
            }
        });
        prevs.forEach(function (remainingComp) {
            if (remainingComp instanceof repetitionComponent_1.default) {
                var newDate = remainingComp.getNOccurencesAfter(remainingComp.amount || 1, _this.timeInfos.start || _this.timeInfos.exactDate || undefined);
                if (!_this.timeInfos.exactDate)
                    _this.timeInfos.exactDate = newDate;
                else
                    _this.timeInfos.exactDate.mergeWith(newDate);
            }
        });
        if (!!this.timeInfos.repetitionDelta && !this.timeInfos.start) {
            this.timeInfos.start = dateComponent_1.default.now();
        }
        if (!!this.timeInfos.exactDate)
            this.timeInfos.exactDate.toDefaultIfPrecisionAbove('D');
        if (!!this.timeInfos.start)
            this.timeInfos.start.minimize();
        if (!!this.timeInfos.end)
            this.timeInfos.end.maximize();
    };
    Time.prototype.parseTimeCodeComponent = function (rawIn) {
        rawIn = rawIn.trim();
        if (/^~-?\d+$/.test(rawIn)) {
            return Number(rawIn.slice(1));
        }
        else if (/^~\w$/.test(rawIn)) {
            return rawIn.slice(1);
        }
        else if (/^[?\w]=/.test(rawIn)) {
            var unit = rawIn[0];
            var num = rawIn.match(/^[?\w]=(.*)$/)[1];
            return new dateComponent_1.default(unit, num);
        }
        else if (/^[?\w]~/.test(rawIn)) {
            var unit = rawIn[0];
            var num = rawIn.match(/^[?\w]~(.*)$/)[1];
            var arg = {};
            arg[unit] = num;
            return new durationComponent_1.default(arg);
        }
        else if (/^@/.test(rawIn))
            return repetitionComponent_1.default.from(rawIn);
        else
            return new operatorComponent_1.default(rawIn);
        return undefined;
    };
    return Time;
}(thing_1.default));
exports.Time = Time;
//# sourceMappingURL=time.js.map