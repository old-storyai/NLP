import TimeComponent from './timeComponent';
import DurationComponent from './durationComponent';
import DateComponent from './dateComponent';

const TIME_UNITS = [ 's', 'm', 'h', 'D', 'M', 'Y' ];

/**
 * Represents a repetition, or an event that occurs multiple times at regular intervals.
 * For exmample, a birthday, christmas, the first monday of the year, etc...
 */
export default class RepetitionComponent implements TimeComponent {
    delta: DurationComponent;
    _dateSample: DateComponent;
    amount?: number;
    _event?: RepetitionComponent;

    // date is considered not fixed if it's choosen by default (not set in the
    // input text)
    dateFixed: boolean;

    /**
     * Builds a RepetitionComponent from a raw string
     *
     * @param {string} rawIn: The input string, should look like:
     *                        '@<SAMPLE-DATE>#<PRECISION>%<REPETITION-DELTA>'  (e.g. '@2000-12-25#D%Y~1' for christmas)
     */
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
    
    /**
     * @param delta0 The duration between each event (e.g. 1 year for christmas)
     * @param date   A date sample (can be any of the repetition occurences)
     */
    constructor(delta0: DurationComponent, date?: DateComponent) {
        this.delta = delta0;

        if (!date) {
            date = DateComponent.now();
            this.dateFixed = false;
        } else
            this.dateFixed = true;

        this._dateSample = date;
    }

    get dateSample(): DateComponent { return this._dateSample; }
    set dateSample(sample: DateComponent) {
        this.dateFixed = true;
        if (!!this.dateSample)
            this._dateSample.mergeWith(sample);
        else
            this._dateSample = sample;

        this._dateSample.unfixedValuesToDefault();
    }

    get event(): RepetitionComponent { return this._event; }
    set event(ev: RepetitionComponent) {
        if (!!this._event)
            this._event.event = ev;
        else
            this._event = ev;
    }

    /**
     * Adds precisions to the sample date
     *
     * @param date The date to take informations from
     * @return False if it couldn't take all the informations from the given date
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

                this.dateSample.setUnit(unit, date.getUnit(unit), false);
            }
        }
        this.dateSample = date;
        return true;
    }

    /**
     * Gives the next occurence of the repetition after the given date
     *
     * @param startDate The date to begin from. Now if not given.
     *
     * @return The date of the found occurence
     */
    getNextOccurence(startDate?: DateComponent): DateComponent {
        return this.getNOccurencesAfter(1, startDate);
    }

    /**
     * Gives the last occurence of the repetition vefore the given date
     *
     * @param startDate The date to begin from. Now if not given.
     *
     * @return The date of the found occurence
     */
    getLastOccurence(startDate?: DateComponent): DateComponent {
        return this.getNOccurencesAfter(-1, startDate);
    }
    
    /**
     * Finds the date N occurences of this repetition after/before the given date
     *
     * @param amount    The amount of occurences to go through (can be negative to go before the startDate)
     * @param startDate The date to begin from. Now if not given.
     *
     * @return The date of the found occurence
     */
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
