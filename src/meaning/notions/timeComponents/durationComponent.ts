import TimeComponent from './timeComponent';
import moment from 'moment';

const DURATION_UNITS = [ 's', 'm', 'h', 'd', 'M', 'Y' ];

export default class DurationComponent implements TimeComponent {
    duration: moment.Duration;

    static fromMilliseconds(mills: number): DurationComponent {
        mills *= mills<0?-1:1;
        const dc = new DurationComponent({});
        dc.duration = moment.duration(mills);
        return dc;
    }

    constructor(
        dur: {
            s?: number, m?: number, h?: number,
            D?: number, d?: number, W?: number, M?: number, Y?: number,
            seconds?: number, minutes?: number, hours?: number,
            days?: number, weeks?: number, months?: number, years?: number,
        }
    ) { 
        if ('D' in dur) {
            dur['d'] = dur['D'];
            delete dur['D'];
        }
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
        const obj = this.asObject(true);

        DURATION_UNITS.forEach(timeUnit => {
            if (timeUnit in obj && obj[timeUnit] !== 0)
                out.duration.add(obj[timeUnit]*num, timeUnit as any);
        });

        return out;
    }

    asObject(durationUnits:boolean = false): {seconds?: number, minutes?: number, hours?: number,
            days?: number, weeks?: number, months?: number, years?: number}
    {
        const out = {};

        if(this.duration.years()!==0)   out['Y'] = this.duration.years();
        if(this.duration.months()!==0)  out['M'] = this.duration.months();
        if(this.duration.days()!==0)    out[durationUnits?'d':'D'] = this.duration.days();
        if(this.duration.minutes()!==0) out['m'] = this.duration.minutes();
        if(this.duration.hours()!==0)   out['h'] = this.duration.hours();
        if(this.duration.seconds()!==0) out['s'] = this.duration.seconds();

        return out;
    }

    eraseUnits(units) {
        for (let unit of units) {
            if (unit) {
                unit = unit==='D'?'d':unit;

                if (DURATION_UNITS.includes(unit)) {
                    this.duration.subtract(this.duration.get(unit as any), unit as any);
                }
            }
        }
    }

    isEmpty(): boolean {
        return this.duration.asSeconds() === 0;
    }

    toString() {
        let out = '';
        DURATION_UNITS.forEach(timeUnit => {
            const amount = this.duration.get(timeUnit as any);
            if (amount!==0)
                out += `${timeUnit}=${amount} `;
        });

        return out.trim();
    }
}

