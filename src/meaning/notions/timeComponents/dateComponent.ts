import moment from 'moment';
import TimeComponent from './timeComponent';
import DurationComponent from './durationComponent';
import RepetitionComponent from './repetitionComponent';

const DEFAULT_TIME = ['01-01T09:00:00.000', 'DD-MMThh:mm:ss:SSS'];
const TIME_UNITS = [ 's', 'm', 'h', 'D', 'M', 'Y' ];

export default class DateComponent implements TimeComponent {
    moment: moment.Moment;
    fixedUnits: string[];

    static now(): DateComponent {
        const dc = new DateComponent();
        dc.moment = moment();
        return dc;
    }

    /**
     * Tomorrow at DEFAULT_TIME
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

    constructor(unit: string='', timeStr: string|number = '') {
        this.fixedUnits = [];
        if (unit === '?') {
            this.moment = moment(timeStr);
            if (!this.moment.isValid())
                throw new Error('Can\'t use the "?" operator with non complete date! ('+timeStr+')');
        } else {
            if (!!unit && !!timeStr) {
                this.moment = this.defaultMoment;
                this.addInfo(unit, timeStr);
            } else {
                this.moment = moment();
            }
        }

    }
    unfixedValuesToDefault() {
        const m = this.defaultMoment;
        for (let i=0 ; i<TIME_UNITS.length ; i++) {
            const unit = TIME_UNITS[i];
            if (this.fixedUnits.includes(unit))
                return;

            this.moment.set(unit as any, m.get(unit as any));
        }
    }
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
     * e.g. 
     *     2020/03/20 06:18:37 || h,m,s
     *      v    v    v    v    v    v
     *     Every day at 06:18:37
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
     * Set all non fixed units as high as possible
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

    addTime(dur: DurationComponent, inFuture: boolean = true): DateComponent {
        const clone = this.clone();
        const timeAsObj = dur.asObject();
        for (let unit of Object.keys(timeAsObj)) {
            const value = timeAsObj[unit];

            unit = unit==='D'?'d':unit; // day unit has different writing for time and duration...

            clone.addUnit(unit);
            if (inFuture) clone.moment.add(value, unit);
            else clone.moment.subtract(value, unit);
        }
        return clone;
    }
    addUnit(unit: string, value?: number, override=false) {
        if (value !== undefined &&
            (override || !this.fixedUnits.includes(unit))
        )
            this.moment.set(unit as any, value);

        if (!this.fixedUnits.includes(unit))
            this.fixedUnits.push(unit);
    }
    removeUnit(unit: string) {
        const idx = this.fixedUnits.indexOf(unit);
        if (idx >= 0)
            this.fixedUnits.splice(idx, 1);
    }
    getUnit(unit: string): number {
        if (TIME_UNITS.includes(unit))
            return this.moment.get(unit as any);
        else return 0;
    }
    addInfo(unit: string, num: string|number) {
        if (isNaN(Number(num))) {
            const m = moment(num);
            if (m.isValid()) {
                // It's a valid date: we keep all the dates elements on and 
                // higher than the precision
                let i = TIME_UNITS.indexOf(unit);
                if (i === -1)
                    throw new Error('Trying to add wrong unit: ' + unit);

                this.addUnit(TIME_UNITS[i], m.get(TIME_UNITS[i] as any), true);
                while ((++i) < TIME_UNITS.length)
                    this.addUnit(TIME_UNITS[i], m.get(TIME_UNITS[i] as any), false);

            } else
                throw new Error(`Invalid Date '${num}'`);
        } else {
            num = Number(num);
            this.moment.set(unit as any, num);
        }
        if (!this.fixedUnits.includes(unit))
            this.fixedUnits.push(unit);
    }

    diff(other: DateComponent): DurationComponent {
        return DurationComponent.fromMilliseconds(
            this.moment.diff(other.moment)
        );
    }

    isAfter(other: DateComponent): boolean {
        return this.moment.isAfter(other.moment);
    }

    mergeWith(other: DateComponent, alllowOverride: boolean = true) {
        other.fixedUnits.forEach(unit => {
            if (alllowOverride || !this.fixedUnits.includes(unit))
                this.addInfo(unit, other.moment.get(unit as any));
        });
    }
    
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
