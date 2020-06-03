"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var durationComponent_1 = __importDefault(require("./durationComponent"));
var dateComponent_1 = __importDefault(require("./dateComponent"));
var TIME_UNITS = ['s', 'm', 'h', 'D', 'M', 'Y'];
/**
 * Represents a repetition, or an event that occurs multiple times at regular intervals.
 * For exmample, a birthday, christmas, the first monday of the year, etc...
 */
var RepetitionComponent = /** @class */ (function () {
    /**
     * @param delta0 The duration between each event (e.g. 1 year for christmas)
     * @param date   A date sample (can be any of the repetition occurences)
     */
    function RepetitionComponent(delta0, date) {
        this.delta = delta0;
        if (!date) {
            date = dateComponent_1.default.now();
            this.dateFixed = false;
        }
        else
            this.dateFixed = true;
        this._dateSample = date;
    }
    /**
     * Builds a RepetitionComponent from a raw string
     *
     * @param {string} rawIn: The input string, should look like:
     *                        '@<SAMPLE-DATE>#<PRECISION>%<REPETITION-DELTA>'  (e.g. '@2000-12-25#D%Y~1' for christmas)
     */
    RepetitionComponent.from = function (rawIn) {
        var res = rawIn.match(/^@([^~]+)#(\w)%(\w)~(\d+)$/);
        if (res === null || res.length !== 5)
            throw new Error("Failed to parse string " + rawIn + " into a RepetitionComponent");
        var sample = res[1], precision = res[2], deltaUnit = res[3], deltaNum = res[4];
        var arg = {};
        arg[deltaUnit] = Number(deltaNum);
        return new RepetitionComponent(new durationComponent_1.default(arg), new dateComponent_1.default(precision, sample));
    };
    Object.defineProperty(RepetitionComponent.prototype, "dateSample", {
        get: function () { return this._dateSample; },
        set: function (sample) {
            this.dateFixed = true;
            if (!!this.dateSample)
                this._dateSample.mergeWith(sample);
            else
                this._dateSample = sample;
            this._dateSample.unfixedValuesToDefault();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RepetitionComponent.prototype, "event", {
        get: function () { return this._event; },
        set: function (ev) {
            if (!!this._event)
                this._event.event = ev;
            else
                this._event = ev;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Adds precisions to the sample date
     *
     * @param date The date to take informations from
     * @return False if it couldn't take all the informations from the given date
     */
    RepetitionComponent.prototype.addSamplePrecisions = function (date) {
        if (!this.dateSample) {
            this.dateSample = date;
            return true;
        }
        var dateUnitsEncounter = false;
        var sampleUnitsEncounter = false;
        for (var idx = 0; idx < TIME_UNITS.length; idx++) {
            var unit = TIME_UNITS[idx];
            if (this.dateSample.fixedUnits.includes(unit)) {
                sampleUnitsEncounter = true;
                if (!dateUnitsEncounter)
                    return false;
            }
            if (date.fixedUnits.includes(unit)) {
                dateUnitsEncounter = true;
                if (sampleUnitsEncounter)
                    return false;
                this.dateSample.setUnit(unit, date.getUnit(unit), false);
            }
        }
        this.dateSample = date;
        return true;
    };
    /**
     * Gives the next occurence of the repetition after the given date
     *
     * @param startDate The date to begin from. Now if not given.
     *
     * @return The date of the found occurence
     */
    RepetitionComponent.prototype.getNextOccurence = function (startDate) {
        return this.getNOccurencesAfter(1, startDate);
    };
    /**
     * Gives the last occurence of the repetition vefore the given date
     *
     * @param startDate The date to begin from. Now if not given.
     *
     * @return The date of the found occurence
     */
    RepetitionComponent.prototype.getLastOccurence = function (startDate) {
        return this.getNOccurencesAfter(-1, startDate);
    };
    /**
     * Finds the date N occurences of this repetition after/before the given date
     *
     * @param amount    The amount of occurences to go through (can be negative to go before the startDate)
     * @param startDate The date to begin from. Now if not given.
     *
     * @return The date of the found occurence
     */
    RepetitionComponent.prototype.getNOccurencesAfter = function (amount, startDate) {
        if (!startDate)
            startDate = dateComponent_1.default.now();
        if (!this.delta || this.delta.isEmpty()) {
            if (!!this._event)
                return this._event.getNOccurencesAfter(amount, startDate);
            throw new Error('Cannot calculate next occurence as repetition doesn\'t have any duration');
        }
        var date = this.dateSample;
        var goingForward = true;
        if (date.isAfter(startDate))
            goingForward = false;
        while (!goingForward && date.isAfter(startDate) ||
            goingForward && startDate.isAfter(date)) {
            date = date.addTime(this.delta, goingForward);
        }
        if (!goingForward)
            date = date.addTime(this.delta);
        // Now date is the next occurence
        if (amount > 0)
            amount--;
        date = date.addTime(this.delta.multiplyBy(amount));
        if (this._event)
            date = this._event.getNextOccurence(date);
        return date;
    };
    RepetitionComponent.prototype.toString = function () {
        return this.dateSample + ' - Every ' + this.delta.duration.humanize() + ' || @' + this._event;
    };
    return RepetitionComponent;
}());
exports.default = RepetitionComponent;
//# sourceMappingURL=repetitionComponent.js.map