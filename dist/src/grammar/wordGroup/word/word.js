"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Word {
    constructor(str0, group0) {
        // Using the setters
        this.str = str0;
        this.group = group0;
    }
    get str() { return this._str; }
    set str(str) { this._str = str; }
    get group() { return this._group.replace('$', 'S'); }
    set group(grp) { this._group = grp; }
    is(grp) {
        return grp === this._group;
    }
    isVerb() {
        return this.group.slice(0, 2) === 'VB';
    }
    isPunctuation() {
        return /[.,?!;:]/.test(this.group);
    }
    isDeterminer() {
        /**
         * will match:
         *  - DT:  Classic determiner (the, some)
         *  - PDT: Pre-determiner (all, both)
         *  - WDT: Wh-determiner (which, that)
         */
        return this.group.slice(-2) === 'DT';
    }
    isAdjective() {
        /**
         * will match:
         *  - JJ:  Classic adjective (big)
         *  - JJR: Comparative adj (bigger)
         *  - JJS: Superlative adj (biggest)
         */
        return this.group.slice(0, 2) === 'JJ';
    }
    isAdverb() {
        /**
         * will match:
         *  - RB:  Classic adverb (quickly)
         *  - RBR: Comparative adv (faster)
         *  - RBS: Superlative adv (fastest)
         */
        return this.group.slice(0, 2) === 'RB';
    }
    isNoun() {
        /**
         * will match:
         *  - NN:   Noun, sing. or mass (dog)
         *  - NNS:  Noun, plural (dogs)
         *  - NNP:  Proper noun, sing. (Edinburgh)
         *  - NNPS: Proper noun, plural (Smiths)
         */
        return this.group.slice(0, 2) === 'NN';
    }
    toString() {
        return this.str;
    }
}
exports.default = Word;
//# sourceMappingURL=word.js.map