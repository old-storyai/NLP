
import Time from './time'
import Person from './person'
import Location from './location'

import {Tokenizer, WordGroup, Word} from './grammar/tokenizer'

export default class Meaning {

    _raw: string;

    // Might be:
    //   description, order, question
    _type: string;

    // "Call me now"
    //  ====
    _action: string;

    _negated: boolean;

    // "He jumped in the puddle barefoot"
    //                          ======== 
    _additions?: [string];

    // "I really need to arrive early to class"
    //    ======
    _modifier: [string];

    // "Give a call to Bernard when I get home"
    //              ==========
    _person?: Person;

    // "join me on the 5th avenue"
    //          =================
    _location?: Location;

    // "I'll be there before 4PM"
    //                ========== 
    _time?: Time;

    // "I really need to arrive early to class"
    //                ======================== 
    _purpose?: Meaning|string;

    static from(str: string) {
        const t = new Tokenizer();

        let wg: WordGroup = t.subSentences(str);

        console.log(''+ wg);


        const all_meanings:Meaning[] = [];
        const m = new Meaning();

        for (const word of wg.words) {
            switch (word.group) {
                case 'G_NN':
                    break;
                case 'G_VB':
                    break;
                default:
            }
        }
    }
}
