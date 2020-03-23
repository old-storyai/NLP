import moment from 'moment';
import TimeComponent from './timeComponent';
import DurationComponent from './durationComponent';
import RepetitionComponent from './repetitionComponent';

const DEFAULT_TIME = ['01-01T09:00:00.000', 'DD-MMThh:mm:ss:SSS'];
const TIME_UNITS = [ 's', 'm', 'h', 'D', 'M', 'Y' ];

export default class DateComponent implements TimeComponent {
    moment: moment.Moment;
    fixedUnits: string[];

    /**
     * Gives a DateComponent pointing to the present moment
     *
     * @return A DateComponent pointing to the present moment
     */
    static now(): DateComponent {
        const dc = new DateComponent();
        dc.moment = moment();
        return dc;
    }

    /**
     * Gives a moment representing the default Date
     *
     * @return A moment instance pointed at the default Date
     * @see DEFAULT_TIME
     */
    private get defaultMoment(): moment.Moment {
        const m = moment(...DEFAULT_TIME);
        return m;
    }
    static get default(): DateComponent {
        const dc = new DateComponent();
        dc.unfixedValuesToDefault();
        return dc;
    }

    private static verifyTimeStr(timeStr: string): boolean {
        return /\d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\d/.test(timeStr);
    }

    /**
     * @param unit    A unit to add upon construction
     * @param timeStr Can be a full date, or a simple number corresponding to the given unit
     *
     * @example 
     *      ('h', 12) => noon
     *      ('M', 0) => january
     *      ('D', '1997-12-18T00:00:00') => 18th of december 1997 (hour gets lost because precision is Day)
     */
    constructor(unit: string='', timeStr: string|number = '') {
        this.fixedUnits = [];
        if (unit === '?') {
            if (DateComponent.verifyTimeStr(timeStr as string))
                this.moment = moment(timeStr);
            else
                throw new Error('Can\'t use the "?" operator with non complete date! ('+timeStr+')');
        } else {

            if (!!unit && !!timeStr) {
                if (DateComponent.verifyTimeStr(timeStr as string))
                    this.moment = moment(timeStr);
                else
                    this.moment = this.defaultMoment;
                this.addInfo(unit, timeStr);
            } else {
                this.moment = moment();
            }
        }
    }

    /**
     * Sets all unfixed units (units that were not explicitly set) to their
     * default values
     *
     * @see fixedUnits
     * @see DEFAULT_TIME
     */
    unfixedValuesToDefault() {
        const m = this.defaultMoment;
        for (let i=0 ; i<TIME_UNITS.length ; i++) {
            const unit = TIME_UNITS[i];
            if (this.fixedUnits.includes(unit))
                return;

            this.moment.set(unit as any, m.get(unit as any));
        }
    }

    /**
     * Tells whether or not this date has unfixed units in between its fixed units
     */
    hasConsistentFixedUnits(): boolean {
        let unitsFound = false;
        for (let i=0 ; i<TIME_UNITS.length ; i++) {
            const unit = TIME_UNITS[i];
            if (this.fixedUnits.includes(unit))
                unitsFound = true;
            else if (unitsFound)
                return false;
        }
        return true;
    }

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
    toRepetition(): RepetitionComponent {
        if (this.hasConsistentFixedUnits())
            return undefined;
        
        let highestunit = '';
        for (let i=0 ; i<TIME_UNITS.length ; i++) {
            const unit = TIME_UNITS[i];
            if (this.fixedUnits.includes(unit))
                highestunit = TIME_UNITS[i+1];
        }

        const arg = {};
        arg[highestunit] = 1;

        return new RepetitionComponent(
            new DurationComponent(arg),
            this
        );
    }

    /**
     * Set all non fixed units as high as possible
     */
    maximize() {
        for (let i=0 ; i<TIME_UNITS.length ; i++) {
            if (this.fixedUnits.includes(TIME_UNITS[i])) {
                if (i==0) return;
                this.moment = this.moment.endOf(TIME_UNITS[i] as any);
                return;
            }
        }
    }

    /**
     * Set all non fixed units as low as possible
     */
    minimize() {
        for (let i=0 ; i<TIME_UNITS.length ; i++) {
            if (this.fixedUnits.includes(TIME_UNITS[i])) {
                if (i==0) return;
                this.moment = this.moment.startOf(TIME_UNITS[i] as any);
                return;
            }
        }
    }

    /**
     * Transforms all unfixed values to their default values if the lowest fixed unit
     * of this date is above the given unit
     */
    toDefaultIfPrecisionAbove(limit: string) {
        for (const unit of TIME_UNITS) {
            if (limit === unit)
                break;
            if (this.fixedUnits.includes(unit))
                return;
        }
        this.unfixedValuesToDefault();
    }

    toObject(displayReady:boolean = false): {Y: number|string, M: number|string, D: number|string, h: number|string, m: number|string, s: number|string } {
        const buildResult = (num: number, requiredCharsAmount:number = 2): string|number => {
            if (!displayReady) return num;
            let out = String(num);
            out = '0'.repeat(requiredCharsAmount - out.length) + out;
            return out;
        };
        return {
            Y: buildResult(this.moment.year(),    4),
            M: buildResult(this.moment.month(),   2),
            D: buildResult(this.moment.date(),    2),
            h: buildResult(this.moment.hour(),    2),
            m: buildResult(this.moment.minute(),  2),
            s: buildResult(this.moment.second(),  2)
        };
    }
    
    /**
     * Calculate a new date by adding the given duration to this date
     *
     * @param dur         The duration to add to this date
     * @param inFuture    Whether it should add (true) or substract (false) the duration to this date
     * @param createClone Whether to use this date as a result (false) or store the result in a new date (true)
     */
    addTime(dur: DurationComponent, inFuture: boolean = true, createClone = true): DateComponent {
        let date:DateComponent = this;
        if (createClone)
            date = this.clone();

        const timeAsObj = dur.asObject();
        for (let unit of Object.keys(timeAsObj)) {
            const value = timeAsObj[unit];

            unit = unit==='D'?'d':unit; // day unit has different writing for time and duration...

            date.setUnit(unit);
            if (inFuture) date.moment.add(value, unit);
            else date.moment.subtract(value, unit);
        }
        return date;
    }

    /**
     * Adds a unit to this date
     *
     * @param unit     The unit to add (e.g. 's' for seconds)
     * @param value    The amount of this unit to set
     * @param override Whether an existing value should be replaced or not
     */
    setUnit(unit: string, value?: number, override=false) {
        if (value !== undefined &&
            (override || !this.fixedUnits.includes(unit))
        )
            this.moment.set(unit as any, value);

        if (!this.fixedUnits.includes(unit))
            this.fixedUnits.push(unit);
    }

    /**
     * Removes a unit from the fixed units
     *
     * @param unit The unit to remove
     */
    removeUnit(unit: string) {
        const idx = this.fixedUnits.indexOf(unit);
        if (idx >= 0)
            this.fixedUnits.splice(idx, 1);
    }

    /**
     * Gives the value of this unit
     *
     * @param unit The unit to retrieve (e.g. 'h' for hours)
     *
     * @return The value of the unit
     */
    getUnit(unit: string): number {
        if (TIME_UNITS.includes(unit))
            return this.moment.get(unit as any);
        else return 0;
    }

    /**
     * Adds 'infos' to this date (new units values)
     *
     * @param unit The precision of the given value. All precisions equal OR 
     *              ABOVE the given precision will be fixed!
     *
     * @param num  Might be a full date, or a number representing only the
     *              value of the unit
     */
    addInfo(unit: string, num: string|number) {
        if (isNaN(Number(num))) {
            const m = moment(num);
            if (m.isValid()) {
                // It's a valid date: we keep all the dates elements on and 
                // higher than the precision
                let i = TIME_UNITS.indexOf(unit);
                if (i === -1)
                    throw new Error('Trying to add wrong unit: ' + unit);

                this.setUnit(TIME_UNITS[i], m.get(TIME_UNITS[i] as any), true);
                while ((++i) < TIME_UNITS.length)
                    this.setUnit(TIME_UNITS[i], m.get(TIME_UNITS[i] as any), false);

            } else
                throw new Error(`Invalid Date '${num}'`);
        } else {
            num = Number(num);
            this.moment.set(unit as any, num);
        }
        if (!this.fixedUnits.includes(unit))
            this.fixedUnits.push(unit);
    }

    /**
     * Gives the difference un milliseconds with another Date
     *
     * @param othet The other date
     *
     * @return The difference between the 2 dates in milliseconds
     */
    diff(other: DateComponent): DurationComponent {
        return DurationComponent.fromMilliseconds(
            this.moment.diff(other.moment)
        );
    }

    /**
     * Finds wheteher this date is after the given date or not
     *
     * @param other The date to compare ith this one
     *
     * @return True if this is after, false if the given date is after
     */
    isAfter(other: DateComponent): boolean {
        return this.moment.isAfter(other.moment);
    }

    /**
     * Merges this date with another date (this date is altered, not the given one)
     *
     * @param other         The date where we should take the information
     * @param allowOverride Whether or not the infos of the other dates should
     *                       overrite the existing infos of this date
     */
    mergeWith(other: DateComponent, allowOverride: boolean = true) {
        other.fixedUnits.forEach(unit => {
            if (allowOverride || !this.fixedUnits.includes(unit))
                this.addInfo(unit, other.moment.get(unit as any));
        });
    }
    
    /**
     * Clones this date
     *
     * @return A perfect replica of this DateComponent
     */
    clone(): DateComponent {
        const dc = new DateComponent();
        dc.moment = this.moment.clone();
        dc.fixedUnits = this.fixedUnits.slice(0);
        return dc;
    }


    toString(): string {
        return this.moment.format('YYYY/MM/DD HH:mm:ss') + ' || ' + this.fixedUnits;
    }
}
