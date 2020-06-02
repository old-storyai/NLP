import {WordGroup, Word} from '../../grammar/tokenizer';

import {Meaning} from './meaning';
import Info from './info/info';

export default class Location extends Info {

    // through, the other side of, before
    _modifiers: [string];

    // The place where my sister an I used to go shopping
    //                 ==================================
    _addition?: Meaning;

    _placeTitle: string;

    _latlng: [number, number];

    protected processWords() {
        
        this._placeTitle = this._wordGroup.toString();
    }
}
