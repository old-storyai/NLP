import Meaning from './meaning';
import Thing from './thing';

import colors from 'colors';

import {WordGroup, Word, Data} from './grammar/tokenizer';

/**
 * call me as soon as the sun rises
 *         '---.----' '-----.-----'
 *          modifier     addition  
 */
export default class Value extends Thing {

    _amount: number;
    _unit: string;
    _modifier: string;

    constructor(wg: WordGroup, precedingSeparators: Word[]) {
        super(wg);

        if (precedingSeparators.length) {

            const modifiers = Data.getData('value_modifiers');
            const blob = precedingSeparators.map(sep=>sep.toString()).join(' ');

            for (const modifier of Object.keys(modifiers)) {
                const matchingWords = modifiers[modifier];

                for (const matchingWord of matchingWords) {
                    if (new RegExp(matchingWord).test(blob))
                        this._modifier = modifier;
                }
            }
        }

        console.log('var: ', wg.toString());

        let matches = wg.toString().match(/[\d.,]+/);
        if (matches.length)
            this._amount = Number.parseInt(matches[0]);

        matches = wg.toString().match(/[\d.,]+([\w\s]+)|([\w]+)\s*$/);
        console.log('matches: ', matches);
        if (matches.length > 1)
            this._unit = matches[1].trim();
    }
}
