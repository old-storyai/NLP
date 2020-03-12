
export default class Word {
    _str: string;
    _tag: string;

    constructor(str0, tag0) {
        // Using the setters
        this.str = str0;
        this.tag = tag0;
    }

    get str(): string   { return this._str; }
    set str(str:string) { this._str = str; }

    get tag(): string { return this._tag.replace('$', 'S'); }
    set tag(tag:string) { this._tag = tag; }

    isGroup(): boolean {
        return false;
    }

    is(tag: string): boolean {
        return tag === this._tag;
    }

    isVerb(): boolean {
        return this.tag.slice(0, 2) === 'VB';
    }

    isSoftPunctuation(): boolean {
        return /[,;:]/.test(this.tag);
    }

    isHardPunctuation(): boolean {
        return /[.?!]/.test(this.tag);
    }

    isPunctuation(): boolean {
        return /[.,?!;:]/.test(this.tag);
    }

    isDeterminer(): boolean {
        /**
         * will match:
         *  - DT:  Classic determiner (the, some)
         *  - PDT: Pre-determiner (all, both)
         */
        return this.tag.slice(-2) === 'DT' && this.tag.slice(0,1) !== 'W';
    }

    isInterrogativeWord(): boolean {
        /**
         * will match:
         *  - WDT: Wh-determiner (which,that)
         *  - WP:  Wh pronoun (who,what)
         *  - WPS: Possessive (whose)
         *  - WRB: Wh-adverb (how,where)
         */
        return this.tag.slice(0, 1) === 'W';
    }

    isAdjective(): boolean {
        /**
         * will match:
         *  - JJ:  Classic adjective (big)
         *  - JJR: Comparative adj (bigger)
         *  - JJS: Superlative adj (biggest)
         */
        return this.tag.slice(0,2) === 'JJ';
    }

    isAdverb(): boolean {
        /**
         * will match:
         *  - RB:  Classic adverb (quickly)
         *  - RBR: Comparative adv (faster)
         *  - RBS: Superlative adv (fastest)
         */
        return this.tag.slice(0,2) === 'RB';
    }

    isNoun(): boolean {
        /**
         * will match:
         *  - NN:   Noun, sing. or mass (dog)
         *  - NNS:  Noun, plural (dogs)
         *  - NNP:  Proper noun, sing. (Edinburgh)
         *  - NNPS: Proper noun, plural (Smiths)
         */
        return this.tag.slice(0,2) === 'NN';
    }

    toString() {
        return this.str;
    }
}
