import moment from 'moment';

import {WordGroup, Word} from 'grammar/tokenizer';
import * as Data from 'data/data';

import {Meaning} from './meaning';
import Thing from './thing/thing';
import StringParser from 'stringParser/stringParser';

const TIME_UNITS = [ 's', 'm', 'h', 'D', 'M', 'Y' ];
const DURATION_UNITS = [ 's', 'm', 'h', 'd', 'M', 'Y' ];

export default class Time extends Thing {

    _raw: string;

    _timeCode: string;

    _addition?: Meaning;

    start: DateComponent;
    end: DateComponent;
    repetitionDelta: TimeRepetition;
    exactDate: DateComponent;


    protected processWords() {
        this.findDate();
    }

    private findDate() {
        this._timeCode = '';

        const str = new WordGroup([...this._conns, ...this._wordGroup.words] as [Word], '').toString();

        const timeComps = Data.getData('timeComponents');
        new StringParser(timeComps)
            .parseString(
                str,
                (_, timeMeaning) => {
                    this._timeCode += ' ' + timeMeaning;
                },
                () => {},
                [
                    (unit, delta, modifier) => {
                        let m = moment().add(delta, unit);
                        if (modifier === 'start')
                            m = m.startOf(unit);

                        if (modifier === 'end')
                            m = m.endOf(unit);


                        return m.format();
                    }
                ]
            );
        this._timeCode = this._timeCode.trim();

        this.parseTimeCode();
    }

    private parseTimeCode() {
        let prevComps: (DurationComponent|DateComponent|OperatorComponent)[] = [];

        //
        // Grouping the time elements, and creating instances
        //
        this._timeCode.split(/\s+/).forEach(timePart => {
            const comp = parseTimeCodeComponent(timePart);

            if (prevComps[0] instanceof DateComponent && comp instanceof DateComponent) {
                prevComps[0].mergeWith(comp);
                return;
            }
            if (comp instanceof DurationComponent) {
                if (prevComps[0] === OperatorComponent.less ||
                    prevComps[0] === OperatorComponent.more
                )
                    prevComps.shift(); // We take it off because it makes no sense


                if (prevComps[0] instanceof DurationComponent) {
                    prevComps[0].mergeWith(comp);
                    return;
                }
            }

            prevComps.unshift(comp);
        });
        prevComps = prevComps.filter(comp => !!comp);

        let pendingEndOfRange:DurationComponent;

        for (let idx=prevComps.length-1 ; idx>0 ; idx--) {
            console.log('________________________________________________');
            console.log(prevComps.map(comp=>comp.toString()).join('\r\n'));
            const timeComp = prevComps[idx];
            const prev = prevComps[idx+1];
            const next = prevComps[idx-1];

            if (timeComp === OperatorComponent.more ||
                timeComp === OperatorComponent.less
            ) {
                if (next instanceof DateComponent) {
                    if (prev instanceof DurationComponent) {
                        this.exactDate = next.addTime(
                            prev,
                            timeComp === OperatorComponent.more
                        );
                    } else {
                        if (timeComp === OperatorComponent.more)
                            this.start = next as DateComponent;
                        else
                            this.end = next as DateComponent;
                    }
                } else { /* This shouldn't happen......*/ }
                delete prevComps[idx+1];
                delete prevComps[idx];
                delete prevComps[idx-1];
                idx--;
                continue;
            }
            if (timeComp === OperatorComponent.repetition) {
                if (next instanceof DurationComponent) {
                    this.repetitionDelta = new TimeRepetition(next);

                    delete prevComps[idx];
                    delete prevComps[idx-1];
                    idx--;
                } else {
                    // TODO Handle special events, like every Christmas, every monday...
                }
                continue;
            }
            if (timeComp === OperatorComponent.fromStart) {
                if (next instanceof DurationComponent) {
                    pendingEndOfRange = next;

                    delete prevComps[idx];
                    delete prevComps[idx-1];
                    idx--;
                } else { /* This shouldn't happen..... */}
                continue;
            }
        }

        if (!!pendingEndOfRange) {
            if (!this.start)
                this.start = DateComponent.now();

            this.end = this.start.addTime(pendingEndOfRange);
        }

        if (!!this.start && !!this.repetitionDelta && !this.repetitionDelta.dateFixed)
            this.repetitionDelta.dateSample = this.start;

        // console.log(`: ${this.repetitionDelta.getNextOccurence()}`);
    }
}

function parseTimeCodeComponent(rawIn: string): (DurationComponent|DateComponent|OperatorComponent) {
    rawIn = rawIn.trim();
    if (/^\w=/.test(rawIn)) {
        const unit = rawIn[0];
        const num  = rawIn.match(/^\w=(.*)$/)[1];
        return new DateComponent(unit, num);
    } else if (/^\w~/.test(rawIn)) {
        const unit = rawIn[0];
        const num  = rawIn.match(/^\w~(.*)$/)[1];
        const arg = {};
        arg[unit] = num;
        return new DurationComponent(arg);
    } else {
        return parseOperator(rawIn);
    }

    return undefined;
}

enum OperatorComponent {
    'more' = '<++',
    'less' = '<--',
    'repetition' = '%',
    'fromStart' = '$',
}
function parseOperator(rawIn: string): OperatorComponent {
    return {
        '<++': OperatorComponent.more,
        '<--': OperatorComponent.less,
        '%'  : OperatorComponent.repetition,
        '$'  : OperatorComponent.fromStart
    }[rawIn] || undefined;
}

class DateComponent {
    moment: moment.Moment;
    fixedUnits: string[];

    static now(): DateComponent {
        let dc = new DateComponent();
        dc.moment = moment();
        return dc;
    }

    constructor(unit: string='', timeStr: string|number = '') {
        this.moment = moment('2000-01-01T00:00:00.000Z');
        this.fixedUnits = [];
        if (!!unit && !!timeStr)
            this.addInfo(unit, timeStr);
    }
    addTime(dur: DurationComponent, inFuture: boolean = true): DateComponent {
        const clone = new DateComponent();
        clone.mergeWith(this);
        const timeAsObj = dur.asObject();
        for (const unit of Object.keys(timeAsObj)) {
            const value = timeAsObj[unit];
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

    isAfter(other: DateComponent): boolean {
        return this.moment > other.moment;
    }

    mergeWith(other: DateComponent) {
        other.fixedUnits.forEach(unit => {
            this.addInfo(unit, other.moment.get(unit as any));
        });
    }

    toString(): string {
        return this.moment.format('YYYY/MM/DD hh:mm:ss') + ' || ' + this.fixedUnits;
    }
}
class DurationComponent {
    duration: moment.Duration;

    constructor(
        dur: {
            s?: number, m?: number, h?: number,
            D?: number, W?: number, M?: number, Y?: number,
            seconds?: number, minutes?: number, hours?: number,
            days?: number, weeks?: number, months?: number, years?: number,
        }
    ) { 
        this.duration = moment.duration(dur);
    }

    mergeWith(other: DurationComponent) {
        DURATION_UNITS.forEach(timeUnit => {
            if (other.duration.get(timeUnit as any) !== 0) {
                this.duration.subtract(this.duration.get(timeUnit as any), timeUnit as any);
                this.duration.add(other.duration.get(timeUnit as any), timeUnit as any);
            }
        });
    }

    multiplyBy(num: number): DurationComponent {
        const out = new DurationComponent({});

        DURATION_UNITS.forEach(timeUnit => {
            out.duration.add(
                this.duration.get(timeUnit as any)*num, timeUnit as any
            );
        });

        return out;
    }

    asObject(): {seconds?: number, minutes?: number, hours?: number,
            days?: number, weeks?: number, months?: number, years?: number}
    {
        const out = {};

        if(this.duration.years()>0)   out['Y'] = this.duration.years();
        if(this.duration.months()>0)  out['M'] = this.duration.months();
        if(this.duration.days()>0)    out['D'] = this.duration.days();
        if(this.duration.minutes()>0) out['m'] = this.duration.minutes();
        if(this.duration.hours()>0)   out['h'] = this.duration.hours();
        if(this.duration.seconds()>0) out['s'] = this.duration.seconds();

        return out;
    }

    toString() {
        let out = '';
        DURATION_UNITS.forEach(timeUnit => {
            const amount = this.duration.get(timeUnit as any);
            if (amount>0)
                out += `${timeUnit}${amount} `;
        });

        return out.trim();
    }
}

class TimeRepetition {
    delta: DurationComponent;
    _dateSample: DateComponent;

    // date is considered not fixed if it's choosen by default (not set in the
    // input text)
    dateFixed: boolean;

    constructor(delta0: DurationComponent, date?: DateComponent) {
        this.delta = delta0;

        if (!date) {
            date = DateComponent.now();
            this.dateFixed = false;
        } else
            this.dateFixed = true;

        this._dateSample = date;
    }

    get dateSample(): DateComponent {
        return this._dateSample;
    }
    set dateSample(sample: DateComponent) {
        this.dateFixed = true;
        this._dateSample = sample;
    }

    getNextOccurence(startDate?: DateComponent): DateComponent {
        return this.getNOccurencesAfter(1, startDate);
    }
    getLastOccurence(startDate?: DateComponent): DateComponent {
        return this.getNOccurencesAfter(-1, startDate);
    }

    getNOccurencesAfter(amount: number, startDate?: DateComponent): DateComponent {
        if (!startDate)
            startDate = DateComponent.now();

        let date = this.dateSample;

        let goingForward = true;
        if (!startDate.isAfter(date))
            goingForward = false;
        
        while (
            goingForward && date.isAfter(startDate) ||
            !goingForward && startDate.isAfter(date)
        ) {
            date = date.addTime(this.delta, goingForward);
        }

        if (!goingForward)
            date = date.addTime(this.delta);

        // Now date is the next occurence

        if (amount > 0) amount--;

        date = date.addTime(this.delta.multiplyBy(amount));

        return date;
    }

    toString() {
        return this.dateSample + ' - Every ' + this.delta.duration.humanize();
    }
}
