import TimeComponent from './timeComponent';
import DurationComponent from './durationComponent';
import DateComponent from './dateComponent';

const TIME_UNITS = [ 's', 'm', 'h', 'D', 'M', 'Y' ];


export default class RepetitionComponent implements TimeComponent {
    delta: DurationComponent;
    _dateSample: DateComponent;
    amount?: number;
    _event?: RepetitionComponent;

    // date is considered not fixed if it's choosen by default (not set in the
    // input text)
    dateFixed: boolean;

    static from(rawIn: string): RepetitionComponent {
        const res = rawIn.match(/^@([^~]+)#(\w)%(\w)~(\d+)$/);

        if (res === null || res.length !== 5)
            throw new Error (`Failed to parse string ${rawIn} into a RepetitionComponent`);

        const [, sample, precision, deltaUnit, deltaNum] = res;

        const arg = {};
        arg[deltaUnit] = Number(deltaNum);

        return new RepetitionComponent(
            new DurationComponent(arg),
            new DateComponent(precision, sample)
        );
    }

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
        if (!!this.dateSample)
            this._dateSample.mergeWith(sample);
        else
            this._dateSample = sample;

        this._dateSample.unfixedValuesToDefault();
    }

    /**
     * @return {boolean} false if it couldn't take all the informations from the given date
     */
    addSamplePrecisions(date: DateComponent): boolean {
        if (!this.dateSample) {
            this.dateSample = date;
            return true;
        }
        let dateUnitsEncounter = false;
        let sampleUnitsEncounter = false;
        for (let idx=0 ; idx<TIME_UNITS.length ; idx++) {
            const unit = TIME_UNITS[idx];

            if (this.dateSample.fixedUnits.includes(unit)) {
                sampleUnitsEncounter = true;
                if (!dateUnitsEncounter) return false;
            }

            if (date.fixedUnits.includes(unit)) {
                dateUnitsEncounter = true;
                if (sampleUnitsEncounter) return false;

                this.dateSample.addUnit(unit, date.getUnit(unit), false);
            }
        }
        this.dateSample = date;
        return true;
    }

    get event(): RepetitionComponent { return this._event; }
    set event(ev: RepetitionComponent) {
        if (!!this._event)
            this._event.event = ev;
        else
            this._event = ev;
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

        if (!this.delta || this.delta.isEmpty()) {
            
            if (!!this._event)
                return this._event.getNOccurencesAfter(amount, startDate);
            throw new Error('Cannot calculate next occurence as repetition doesn\'t have any duration');
        }

        let date = this.dateSample;

        let goingForward = true;
        if (date.isAfter(startDate))
            goingForward = false;
        
        while (
            !goingForward && date.isAfter(startDate) ||
            goingForward && startDate.isAfter(date)
        ) {
            date = date.addTime(this.delta, goingForward);
        }

        if (!goingForward)
            date = date.addTime(this.delta);

        // Now date is the next occurence
        
        if (amount > 0) amount--;

        date = date.addTime(this.delta.multiplyBy(amount));

        if (this._event)
            date = this._event.getNextOccurence(date);

        return date;
    }

    toString() {
        return this.dateSample + ' - Every ' + this.delta.duration.humanize() + ' || @' + this._event;
    }
}
