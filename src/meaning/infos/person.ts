import {WordGroup, Word} from '../../grammar/tokenizer';

import Info from './info/info';
import {Meaning} from './meaning';

export default class Person extends Info {

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

        this._modifiers = [];
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
