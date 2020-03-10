import {WordGroup, Word} from 'grammar/tokenizer';
import * as Normalizer from 'language/normalizer';

import Thing from './thing/thing';
import {Meaning} from './meaning';

enum Tense {
    past = 'past',
    present = 'present',
    future = 'future'
}

export default class Action extends Thing {

    _negated: boolean;
    _tense: Tense;
    _verb: string;

    protected processWords() {
        this._verb = Normalizer.disconjugateVerb(
            this._wordGroup.toString()
        );
    }
}
