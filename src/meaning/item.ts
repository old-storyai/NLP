import {WordGroup, Word} from './grammar/tokenizer';

import Meaning from './meaning';
import Thing from './thing';

export default class Item extends Thing {

    _words: WordGroup;

    _modifiers: string[];

    // Extra information about this person
    //  e.g. "The bench where I usually rest
    //                  ====================
    _addition: Meaning;

    _amount: number;

    _name: string;

    constructor(wg: WordGroup) {
        super(wg);

        this._modifiers = [];
        this._name = '';
        for (let word of wg._words) {
            word = word as Word;

            if (word.isAdjective())
                this._modifiers.push(word.toString());


            if (word.isNoun() || word.is('PRP'))
                this._name += ' ' + word.toString();

        }
        this._name = this._name.trim();

    }
}
