import {WordGroup, Word} from '../grammar/tokenizer';
import * as Normalizer from '../language/normalizer';

import Info from './info/info';
import {Meaning} from './meaning';

enum Tense {
    past = 'past',
    present = 'present',
    future = 'future'
}

export default class Action extends Info {

    _negated: boolean;
    _tense: Tense;
    _verb: string;

    protected processWords() {
        this._verb = Normalizer.disconjugateVerb(
            this._wordGroup.toString()
        );
    }
}
