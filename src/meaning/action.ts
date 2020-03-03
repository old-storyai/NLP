import colors from 'colors';

import {WordGroup, Word} from './grammar/tokenizer';

import Thing from './thing';
import Meaning from './meaning';

enum Tense {
    past = 'past',
    present = 'present',
    future = 'future'
}

export default class Action extends Thing {

    _negated: boolean;
    _tense: Tense;
    _verb: string;

    constructor(wg: WordGroup) {
        super(wg);

        this.findTime();

        for (let word of wg._words) {
            word = word as Word;
            if (word.isVerb()) {
                this._verb = word.toString();
            }
        }
    }

    findTime() {
        const mainWord = this._wordGroup.words[0].toString();

        if (mainWord.slice(-1) === 'ed') {
            this._tense = Tense.past;
            return;
        }

        if (/will/gi.test(this._wordGroup.toString())) {
            this._tense = Tense.future;
            return;
        }
    }
}
