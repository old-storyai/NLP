import {WordGroup, Word} from 'grammar/tokenizer';
import * as Normalizer from 'language/normalizer';

import Thing from './thing/thing';
import {Meaning} from './meaning';

enum Tense {
    past = 'past',
    present = 'present',
    future = 'future'
}

export default class Action extends Thing {

    _negated: boolean;
    _tense: Tense;
    _verb: string;

    protected processWords() {
        this.findTense();

        this._verb = '';
        for (let word of this._wordGroup._words) {
            word = word as Word;
            if (word.isVerb() || word.is('IN')) {
                this._verb += ' ' + Normalizer.lemmatize(word.toString().toLowerCase());
            }
        }
        this._verb = this._verb.trim();
    }

    findTense() {
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
