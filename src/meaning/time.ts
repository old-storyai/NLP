import Meaning from './meaning';
import Thing from './thing';

import {WordGroup, Word} from './grammar/tokenizer';

/**
 * call me as soon as the sun rises
 *         '---.----' '-----.-----'
 *          modifier     addition  
 */
export default class Time extends Thing {

    _raw: string;

    // after, before, during
    _modifiers: [string];

    _additions?: Meaning;

    _date: Date;
}
