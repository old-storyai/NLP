
import Meaning from './meaning';

/**
 * call me as soon as the sun rises
 *         '---.----' '-----.-----'
 *          modifier     addition  
 */
export default class Time {

    _raw: string;

    // after, before, during
    _modifiers: [string];

    _additions?: Meaning;

    _date: Date;
}
