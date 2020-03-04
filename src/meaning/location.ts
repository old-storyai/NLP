import Meaning from './meaning';
import Thing from './thing';

import {WordGroup, Word} from './grammar/tokenizer';


export default class Location extends Thing {

    // through, the other side of, before
    _modifiers: [string];

    // The place where my sister an I used to go shopping
    //                 ==================================
    _additions?: Meaning;

    _placeTitle: string;

    _latlng: [number, number];

    protected processWords() {
        
        this._placeTitle = '';
        
        for (let w of this._wordGroup._words) {
            w = w as Word;
            if (!w.isDeterminer()) {
                this._placeTitle += ' ' + w.toString();
            }
        }
        this._wordGroup.toString();

    }
}
