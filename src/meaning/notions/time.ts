import {WordGroup, Word} from 'grammar/tokenizer';
import * as Data from 'data/data';

import {Meaning} from './meaning';
import Thing from './thing/thing';

export default class Time extends Thing {

    _raw: string;

    // after, before, during
    _modifiers: [string];

    _addition?: Meaning;

    _weekDay: string;
    _day:     string;
    _year:    string;
    _month:   string;
    _hour:    string;
    _minute:  string;
    _second:  string;

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
                
                if (!!match.length) {
                    switch(component) {
                        case 'weekDay':
                            this._weekDay = (match);
                            break;
                        case 'day':
                            this._day = (match);
                            break;
                        case 'month':
                            this._month = (match);
                            break;
                        case 'year':
                            this._year = (match);
                            break;
                        case 'hour':
                            this._hour = (match);
                            break;
                        case 'minute':
                            this._minute = (match);
                            break;
                        case 'second':
                            this._second = (match);
                            break;
                    }
                    break;
                }
            }
        }
    }
}
