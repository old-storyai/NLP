import moment from 'moment';

import {WordGroup, Word} from 'grammar/tokenizer';
import * as Data from 'data/data';

import {Meaning} from './meaning';
import Thing from './thing/thing';
import StringParser from 'stringParser/stringParser';

export default class Time extends Thing {

    _raw: string;

    // after, before, during
    _modifiers: [string];

    _timeCode: string;

    _addition?: Meaning;

    _weekDay: string;
    _day:     string;
    _year:    string;
    _month:   string;
    _hour:    string;
    _minute:  string;
    _second:  string;

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

        console.log('_timeCode: ', this._timeCode);
    }

    private parseTimeCode() {
        let timecode = this._timeCode;
    }
}
