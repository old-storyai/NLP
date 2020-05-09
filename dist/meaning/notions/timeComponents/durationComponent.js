"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var moment_1 = __importDefault(require("moment"));
var DURATION_UNITS = ['s', 'm', 'h', 'd', 'M', 'Y'];
/**
 * Represents a duration. (e.g. 3 months, 2 days, 6 hours and 49 seconds)
 */
var DurationComponent = /** @class */ (function () {
    /**
     * @param dur An object containing all the duration informations (e.g. {'d': 7, 'h': 5})
     */
    function DurationComponent(dur) {
        if ('D' in dur) {
            dur['d'] = dur['D'];
            delete dur['D'];
        }
        this.duration = moment_1.default.duration(dur);
    }
    /**
     * Creates a new DurationComponent that equals this amount of milliseconds
     *
     * @param millis The amount of milliseconds
     * @return The created DurationComponent
     */
    DurationComponent.fromMilliseconds = function (mills) {
        mills *= mills < 0 ? -1 : 1;
        var dc = new DurationComponent({});
        dc.duration = moment_1.default.duration(mills);
        return dc;
    };
    /**
     * Take informations from another duration
     *
     * @param other The duration to take infos from
     *
     * @note All the overlapping informations of this duration will be overwritten by the infos of the new one
     */
    DurationComponent.prototype.mergeWith = function (other) {
        var _this = this;
        DURATION_UNITS.forEach(function (timeUnit) {
            if (other.duration.get(timeUnit) !== 0) {
                _this.duration.subtract(_this.duration.get(timeUnit), timeUnit);
                _this.duration.add(other.duration.get(timeUnit), timeUnit);
            }
        });
    };
    /**
     * Multiplies this duration, and gives the result as a new duration
     *
     * @param num The factor by which this duration shoujld be multiplied
     * @return The newly created duration
     */
    DurationComponent.prototype.multiplyBy = function (num) {
        var out = new DurationComponent({});
        var obj = this.asObject(true);
        DURATION_UNITS.forEach(function (timeUnit) {
            if (timeUnit in obj && obj[timeUnit] !== 0)
                out.duration.add(obj[timeUnit] * num, timeUnit);
        });
        return out;
    };
    /**
     * Get an object representation of this duration
     *
     * @param durationUnits Should the result be given with duration type units ('d' instead of 'D' for days)
     * @return An object representing this duration
     */
    DurationComponent.prototype.asObject = function (durationUnits) {
        if (durationUnits === void 0) { durationUnits = false; }
        var out = {};
        if (this.duration.years() !== 0)
            out['Y'] = this.duration.years();
        if (this.duration.months() !== 0)
            out['M'] = this.duration.months();
        if (this.duration.days() !== 0)
            out[durationUnits ? 'd' : 'D'] = this.duration.days();
        if (this.duration.minutes() !== 0)
            out['m'] = this.duration.minutes();
        if (this.duration.hours() !== 0)
            out['h'] = this.duration.hours();
        if (this.duration.seconds() !== 0)
            out['s'] = this.duration.seconds();
        return out;
    };
    /**
     * Erases the given units of this duration
     *
     * @param units The units to erase
     */
    DurationComponent.prototype.eraseUnits = function (units) {
        for (var _i = 0, units_1 = units; _i < units_1.length; _i++) {
            var unit = units_1[_i];
            if (unit) {
                unit = unit === 'D' ? 'd' : unit;
                if (DURATION_UNITS.includes(unit)) {
                    this.duration.subtract(this.duration.get(unit), unit);
                }
            }
        }
    };
    /**
     * Checks if this duration is empty (less than a second)
     *
     * @return True if it's empty, false otherwise
     */
    DurationComponent.prototype.isEmpty = function () {
        return this.duration.asSeconds() === 0;
    };
    DurationComponent.prototype.toString = function () {
        var _this = this;
        var out = '';
        DURATION_UNITS.forEach(function (timeUnit) {
            var amount = _this.duration.get(timeUnit);
            if (amount !== 0)
                out += timeUnit + "=" + amount + " ";
        });
        return out.trim();
    };
    return DurationComponent;
}());
exports.default = DurationComponent;
//# sourceMappingURL=durationComponent.js.map