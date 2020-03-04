import {WordGroup, Word} from 'grammar/tokenizer';

import Thing from './thing/thing';
import {Meaning} from './meaning';

import colors from 'colors';

export default class Person extends Thing {

    // Person qualifiers
    //  e.g. "The old lady who used to care for me"
    //            ===
    _modifiers: string[];

    // Extra information about this person
    //  e.g. "The old lady who used to care for me"
    //                     =======================
    _addition: Meaning;

    _personTitle: string;

    protected processWords() {
        if (/^(me|I)$/i.test(this._wordGroup.toString())) {
            this._personTitle = 'SELF';
            return;
        }

        this._personTitle = '';

        for (let word of this._wordGroup._words) {
            word = word as Word;
            if (word.isAdjective()) {
                this._modifiers.push(word.toString());
            } else {
                this._personTitle += ' ' + word.toString();
            }
        }
        this._personTitle.trim();
    }
}
