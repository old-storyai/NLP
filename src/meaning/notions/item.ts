import {WordGroup, Word} from 'grammar/tokenizer';

import {Meaning} from './meaning';
import Thing from './thing/thing';

export default class Item extends Thing {

    _modifiers: string[];

    // Extra information about this person
    //  e.g. "The bench where I usually rest
    //                  ====================
    _addition: Meaning;

    _amount: number;

    _name: string;

    protected processWords() {
        this._modifiers = [];
        this._name = '';
        for (let word of this._wordGroup._words) {
            word = word as Word;

            if (word.isAdjective())
                this._modifiers.push(word.toString());


            if (word.isNoun() || word.is('PRP'))
                this._name += ' ' + word.toString();

        }
        this._name = this._name.trim();
    }
}
