"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var moment_1 = __importDefault(require("moment"));
var durationComponent_1 = __importDefault(require("./durationComponent"));
var repetitionComponent_1 = __importDefault(require("./repetitionComponent"));
var DEFAULT_TIME = ['01-01T09:00:00.000', 'DD-MMThh:mm:ss:SSS'];
var TIME_UNITS = ['s', 'm', 'h', 'D', 'M', 'Y'];
var DateComponent = /** @class */ (function () {
    /**
     * @param unit    A unit to add upon construction
     * @param timeStr Can be a full date, or a simple number corresponding to the given unit
     *
     * @example
     *      ('h', 12) => noon
     *      ('M', 0) => january
     *      ('D', '1997-12-18T00:00:00') => 18th of december 1997 (hour gets lost because precision is Day)
     */
    function DateComponent(unit, timeStr) {
        if (unit === void 0) { unit = ''; }
        if (timeStr === void 0) { timeStr = ''; }
        this.fixedUnits = [];
        if (unit === '?') {
            if (DateComponent.verifyTimeStr(timeStr))
                this.moment = moment_1.default(timeStr);
            else
                throw new Error('Can\'t use the "?" operator with non complete date! (' + timeStr + ')');
        }
        else {
            if (!!unit && !!timeStr) {
                if (DateComponent.verifyTimeStr(timeStr))
                    this.moment = moment_1.default(timeStr);
                else
                    this.moment = this.defaultMoment;
                this.addInfo(unit, timeStr);
            }
            else {
                this.moment = moment_1.default();
            }
        }
    }
    /**
     * Gives a DateComponent pointing to the present moment
     *
     * @return A DateComponent pointing to the present moment
     */
    DateComponent.now = function () {
        var dc = new DateComponent();
        dc.moment = moment_1.default();
        return dc;
    };
    Object.defineProperty(DateComponent.prototype, "defaultMoment", {
        /**
         * Gives a moment representing the default Date
         *
         * @return A moment instance pointed at the default Date
         * @see DEFAULT_TIME
         */
        get: function () {
            var m = moment_1.default.apply(void 0, DEFAULT_TIME);
            return m;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DateComponent, "default", {
        get: function () {
            var dc = new DateComponent();
            dc.unfixedValuesToDefault();
            return dc;
        },
        enumerable: false,
        configurable: true
    });
    DateComponent.verifyTimeStr = function (timeStr) {
        return /\d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\d/.test(timeStr);
    };
    /**
     * Sets all unfixed units (units that were not explicitly set) to their
     * default values
     *
     * @see fixedUnits
     * @see DEFAULT_TIME
     */
    DateComponent.prototype.unfixedValuesToDefault = function () {
        var m = this.defaultMoment;
        for (var i = 0; i < TIME_UNITS.length; i++) {
            var unit = TIME_UNITS[i];
            if (this.fixedUnits.includes(unit))
                return;
            this.moment.set(unit, m.get(unit));
        }
    };
    /**
     * Tells whether or not this date has unfixed units in between its fixed units
     */
    DateComponent.prototype.hasConsistentFixedUnits = function () {
        var unitsFound = false;
        for (var i = 0; i < TIME_UNITS.length; i++) {
            var unit = TIME_UNITS[i];
            if (this.fixedUnits.includes(unit))
                unitsFound = true;
            else if (unitsFound)
                return false;
        }
        return true;
    };
    /**
     * Turns this date into a repetition. Only makes sense if it has inconsistent fixed units
     *
     * @return The repetition corresponding to this date
     *
     * @example
     *     2020/03/20 06:18:37 || h,m,s
     *           v    v    v    v
     *         Every day at 06:18:37
     */
    DateComponent.prototype.toRepetition = function () {
        if (this.hasConsistentFixedUnits())
            return undefined;
        var highestunit = '';
        for (var i = 0; i < TIME_UNITS.length; i++) {
            var unit = TIME_UNITS[i];
            if (this.fixedUnits.includes(unit))
                highestunit = TIME_UNITS[i + 1];
        }
        var arg = {};
        arg[highestunit] = 1;
        return new repetitionComponent_1.default(new durationComponent_1.default(arg), this);
    };
    /**
     * Set all non fixed units as high as possible
     */
    DateComponent.prototype.maximize = function () {
        for (var i = 0; i < TIME_UNITS.length; i++) {
            if (this.fixedUnits.includes(TIME_UNITS[i])) {
                if (i == 0)
                    return;
                this.moment = this.moment.endOf(TIME_UNITS[i]);
                return;
            }
        }
    };
    /**
     * Set all non fixed units as low as possible
     */
    DateComponent.prototype.minimize = function () {
        for (var i = 0; i < TIME_UNITS.length; i++) {
            if (this.fixedUnits.includes(TIME_UNITS[i])) {
                if (i == 0)
                    return;
                this.moment = this.moment.startOf(TIME_UNITS[i]);
                return;
            }
        }
    };
    /**
     * Transforms all unfixed values to their default values if the lowest fixed unit
     * of this date is above the given unit
     */
    DateComponent.prototype.toDefaultIfPrecisionAbove = function (limit) {
        for (var _i = 0, TIME_UNITS_1 = TIME_UNITS; _i < TIME_UNITS_1.length; _i++) {
            var unit = TIME_UNITS_1[_i];
            if (limit === unit)
                break;
            if (this.fixedUnits.includes(unit))
                return;
        }
        this.unfixedValuesToDefault();
    };
    DateComponent.prototype.toObject = function (displayReady) {
        if (displayReady === void 0) { displayReady = false; }
        var buildResult = function (num, requiredCharsAmount) {
            if (requiredCharsAmount === void 0) { requiredCharsAmount = 2; }
            if (!displayReady)
                return num;
            var out = String(num);
            out = '0'.repeat(requiredCharsAmount - out.length) + out;
            return out;
        };
        return {
            Y: buildResult(this.moment.year(), 4),
            M: buildResult(this.moment.month(), 2),
            D: buildResult(this.moment.date(), 2),
            h: buildResult(this.moment.hour(), 2),
            m: buildResult(this.moment.minute(), 2),
            s: buildResult(this.moment.second(), 2)
        };
    };
    /**
     * Calculate a new date by adding the given duration to this date
     *
     * @param dur         The duration to add to this date
     * @param inFuture    Whether it should add (true) or substract (false) the duration to this date
     * @param createClone Whether to use this date as a result (false) or store the result in a new date (true)
     */
    DateComponent.prototype.addTime = function (dur, inFuture, createClone) {
        if (inFuture === void 0) { inFuture = true; }
        if (createClone === void 0) { createClone = true; }
        var date = this;
        if (createClone)
            date = this.clone();
        var timeAsObj = dur.asObject();
        for (var _i = 0, _a = Object.keys(timeAsObj); _i < _a.length; _i++) {
            var unit = _a[_i];
            var value = timeAsObj[unit];
            unit = unit === 'D' ? 'd' : unit; // day unit has different writing for time and duration...
            date.setUnit(unit);
            if (inFuture)
                date.moment.add(value, unit);
            else
                date.moment.subtract(value, unit);
        }
        return date;
    };
    /**
     * Adds a unit to this date
     *
     * @param unit     The unit to add (e.g. 's' for seconds)
     * @param value    The amount of this unit to set
     * @param override Whether an existing value should be replaced or not
     */
    DateComponent.prototype.setUnit = function (unit, value, override) {
        if (override === void 0) { override = false; }
        if (value !== undefined &&
            (override || !this.fixedUnits.includes(unit)))
            this.moment.set(unit, value);
        if (!this.fixedUnits.includes(unit))
            this.fixedUnits.push(unit);
    };
    /**
     * Removes a unit from the fixed units
     *
     * @param unit The unit to remove
     */
    DateComponent.prototype.removeUnit = function (unit) {
        var idx = this.fixedUnits.indexOf(unit);
        if (idx >= 0)
            this.fixedUnits.splice(idx, 1);
    };
    /**
     * Gives the value of this unit
     *
     * @param unit The unit to retrieve (e.g. 'h' for hours)
     *
     * @return The value of the unit
     */
    DateComponent.prototype.getUnit = function (unit) {
        if (TIME_UNITS.includes(unit))
            return this.moment.get(unit);
        else
            return 0;
    };
    /**
     * Adds 'infos' to this date (new units values)
     *
     * @param unit The precision of the given value. All precisions equal OR
     *              ABOVE the given precision will be fixed!
     *
     * @param num  Might be a full date, or a number representing only the
     *              value of the unit
     */
    DateComponent.prototype.addInfo = function (unit, num) {
        if (isNaN(Number(num))) {
            var m = moment_1.default(num);
            if (m.isValid()) {
                // It's a valid date: we keep all the dates elements on and 
                // higher than the precision
                var i = TIME_UNITS.indexOf(unit);
                if (i === -1)
                    throw new Error('Trying to add wrong unit: ' + unit);
                this.setUnit(TIME_UNITS[i], m.get(TIME_UNITS[i]), true);
                while ((++i) < TIME_UNITS.length)
                    this.setUnit(TIME_UNITS[i], m.get(TIME_UNITS[i]), false);
            }
            else
                throw new Error("Invalid Date '" + num + "'");
        }
        else {
            num = Number(num);
            this.moment.set(unit, num);
        }
        if (!this.fixedUnits.includes(unit))
            this.fixedUnits.push(unit);
    };
    /**
     * Gives the difference un milliseconds with another Date
     *
     * @param othet The other date
     *
     * @return The difference between the 2 dates in milliseconds
     */
    DateComponent.prototype.diff = function (other) {
        return durationComponent_1.default.fromMilliseconds(this.moment.diff(other.moment));
    };
    /**
     * Finds wheteher this date is after the given date or not
     *
     * @param other The date to compare ith this one
     *
     * @return True if this is after, false if the given date is after
     */
    DateComponent.prototype.isAfter = function (other) {
        return this.moment.isAfter(other.moment);
    };
    /**
     * Merges this date with another date (this date is altered, not the given one)
     *
     * @param other         The date where we should take the information
     * @param allowOverride Whether or not the infos of the other dates should
     *                       overrite the existing infos of this date
     */
    DateComponent.prototype.mergeWith = function (other, allowOverride) {
        var _this = this;
        if (allowOverride === void 0) { allowOverride = true; }
        other.fixedUnits.forEach(function (unit) {
            if (allowOverride || !_this.fixedUnits.includes(unit))
                _this.addInfo(unit, other.moment.get(unit));
        });
    };
    /**
     * Clones this date
     *
     * @return A perfect replica of this DateComponent
     */
    DateComponent.prototype.clone = function () {
        var dc = new DateComponent();
        dc.moment = this.moment.clone();
        dc.fixedUnits = this.fixedUnits.slice(0);
        return dc;
    };
    DateComponent.prototype.toString = function () {
        return this.moment.format('YYYY/MM/DD HH:mm:ss') + ' || ' + this.fixedUnits;
    };
    return DateComponent;
}());
exports.default = DateComponent;
//# sourceMappingURL=dateComponent.js.map