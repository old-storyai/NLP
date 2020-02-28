
import Meaning from './meaning';

/**
 * Example:
 *
 *  Tell the son of the old lady who used to care for me to call me
 *
 *    Person{
 *      name: 'son'
 *      addition: Meaning{
 *        person: Person{
 *          name: 'lady',
 *          modifiers: ['old'],
 *          addition: Meaning{
 *            action: "care for",
 *            person: Person{
 *              name: "SELF"
 *            }
 *          }
 *        }
 *      }
 *    }
 *
 *
 */
export default class Person {

    _raw: string;

    _modifiers: [string];

    // Extra information about this person
    //  e.g. "The old lady who used to care for me"
    //                     =======================
    _addition: Meaning;

    _name: string;
}
