import Time from './time';
import Person from './person';
import Location from './location';
import Value from './value';
import Item from './item';
import Action from './action';

export {Time, Person, Location, Value, Item, Action};

import {WordGroup, Word} from 'grammar/tokenizer';

export class Meaning {

    // Might be:
    //   description, order, question, condition
    _type: string;

    // "Call me now"
    //  ====
    _action: Action;

    // "I really need to arrive early to class"
    //    ======
    _modifier: [string];

    // "Give a call to Bernard when I get home"
    //              ==========
    _target?: Person;

    // "I am the head butler in this manor"
    //  =
    _subject?: Person|Item;

    // "Pour me a cup of coffee"
    //          ===============
    _item?: Item;

    _value?: Value;

    // "join me on the 5th avenue"
    //          =================
    _location?: Location;

    // "I'll be there before 4PM"
    //                ========== 
    _time?: Time;

    // "I really need to arrive early to class"
    //                ======================== 
    _purpose?: Meaning|string;

    isEmpty(): boolean {
        let res = true;
        for (const prop of Object.getOwnPropertyNames(this))
            res = res && (!this[prop]);

        return res;
    }

    toString(): string {
        let out = '';

        for (const prop of Object.keys(this)) {
            out += `${prop.replace(/^_+/, '').replace(/^\w/, c=>c.toUpperCase())}:\n` +
                `\t${this[prop].toString().replace(/\n/g, '\n\t')}\n`;
        }

        return out;
    }
}
