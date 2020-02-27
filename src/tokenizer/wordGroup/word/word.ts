

export default class Word {
    _str: string;
    _group: string;

    constructor(str0, group0) {
        // Using the setters
        this.str = str0;
        this.group = group0;
    }

    get str(): string   { return this._str; }
    set str(str:string) { this._str = str; }

    get group(): string { return this._group.replace('$', 'S'); }
    set group(grp:string) { this._group = grp; }

    is(grp: string): boolean {
        return grp === this._group;
    }

    isVerb(): boolean {
        return this.group.slice(0, 2) === 'VB';
    }

    isPunctuation(): boolean {
        return /[.,?!;:]/.test(this.group);
    }

    isDeterminer(): boolean {
        /**
         * will match:
         *  - DT:  Classic determiner (the, some)
         *  - PDT: Pre-determiner (all, both)
         *  - WDT: Wh-determiner (which, that)
         */
        return this.group.slice(-2) === 'DT';
    }

    isAdjective(): boolean {
        /**
         * will match:
         *  - JJ:  Classic adjective (big)
         *  - JJR: Comparative adj (bigger)
         *  - JJS: Superlative adj (biggest)
         */
        return this.group.slice(0,2) === 'JJ';
    }

    isNoun(): boolean {
        /**
         * will match:
         *  - NN:   Noun, sing. or mass (dog)
         *  - NNS:  Noun, plural (dogs)
         *  - NNP:  Proper noun, sing. (Edinburgh)
         *  - NNPS: Proper noun, plural (Smiths)
         */
        return this.group.slice(0,2) === 'NN';
    }

    toString() {
        return this.str;
    }
}
