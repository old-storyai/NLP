import Meaning from './meaning';
import Thing from './thing';

import {Data, WordGroup, Word} from './grammar/tokenizer';

/**
 * all the times category:
 *
 *   - range (from september 4th to february 2nd)
 *
 *   - from / until
 *
 *   - simple date
 *
 *   - repetition (every day at 5AM)
 *
 *       - repetition + range: (the first monday of each month for 2 year)
 *
 *   each: repetiton
 *   for: range
 *
 *   X of each Y: X is a precision of the repetition 
 *
 *
 *   {
 *     repetiton: {
 *       nature: {
 *         weekDay: 0 => On monday
 *       },
 *       delta: {
 *         month: 1 => every 1 month
 *       }
 *     },
 *     range: [
 *       now(),
 *       now() + 2 years
 *     ]
 *   }
 */
export default class Time extends Thing {

    _raw: string;

    // after, before, during
    _modifiers: [string];

    _additions?: Meaning;

    _weekDay: number;
    _day: number;
    _month: number;
    _year: number;

    _isRepetition: boolean;

    protected processWords() {
        this.findDate();
    }

    private findDate() {
        const components = Data.getData('timeComponents');

        for (const component of Object.keys(components)) {
            const possibleMatches = components[component];

            for (const possibleMatch of Object.keys(possibleMatches)) {
                const result = possibleMatches[possibleMatch];
                let match = '';
                if (/\$\d/.test(result)) {
                    match = this._wordGroup.toString().replace(new RegExp('^.*'+possibleMatch+'.*$', 'gi'), result);
                    if (match === this._wordGroup.toString())
                        match = '';
                } else {
                    const tmp = this._wordGroup.toString().match(new RegExp(possibleMatch, 'gi'));
                    if (tmp !== null && tmp.length > 0)
                        match = result;
                }

                if (!!match) {
                    switch(component) {
                        case 'weekDay':
                            this._weekDay = Number(match);
                            break;
                        case 'day':
                            this._day = Number(match);
                            break;
                        case 'month':
                            this._month = Number(match);
                            break;
                        case 'year':
                            this._year = Number(match);
                            break;
                    }
                    break;
                }
            }
        }
    }
}
