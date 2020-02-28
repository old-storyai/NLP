
import Meaning from './meaning';

export default class Location {

    _raw: string;

    // through, the other side of, before
    _modifiers: [string];

    // The place where my sister an I used to go shopping
    //                 ==================================
    _additions?: Meaning;

    _latlng: [number, number];
}
