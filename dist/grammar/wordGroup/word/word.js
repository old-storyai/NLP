"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Word = /** @class */ (function () {
    function Word(str0, tag0) {
        // Using the setters
        this.str = str0;
        this.tag = tag0;
    }
    Object.defineProperty(Word.prototype, "str", {
        get: function () { return this._str; },
        set: function (str) { this._str = str; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Word.prototype, "tag", {
        get: function () { return this._tag.replace('$', 'S'); },
        set: function (tag) { this._tag = tag; },
        enumerable: false,
        configurable: true
    });
    Word.prototype.getSimplifiedTag = function () {
        if (this.isDeterminer())
            return 'DT';
        return this.tag.slice(0, 2);
    };
    Word.prototype.isGroup = function () {
        return false;
    };
    Word.prototype.is = function (tag) {
        return tag === this._tag;
    };
    Word.prototype.isVerb = function () {
        return this.tag.slice(0, 2) === 'VB';
    };
    Word.prototype.isSoftPunctuation = function () {
        return /[,;:]/.test(this.tag);
    };
    Word.prototype.isHardPunctuation = function () {
        return /[.?!]/.test(this.tag);
    };
    Word.prototype.isPunctuation = function () {
        return /[.,?!;:]/.test(this.tag);
    };
    Word.prototype.isDeterminer = function () {
        /**
         * will match:
         *  - DT:  Classic determiner (the, some)
         *  - PDT: Pre-determiner (all, both)
         */
        return this.tag.slice(-2) === 'DT' && this.tag.slice(0, 1) !== 'W';
    };
    Word.prototype.isInterrogativeWord = function () {
        /**
         * will match:
         *  - WDT: Wh-determiner (which,that)
         *  - WP:  Wh pronoun (who,what)
         *  - WPS: Possessive (whose)
         *  - WRB: Wh-adverb (how,where)
         */
        return this.tag.slice(0, 1) === 'W';
    };
    Word.prototype.isAdjective = function () {
        /**
         * will match:
         *  - JJ:  Classic adjective (big)
         *  - JJR: Comparative adj (bigger)
         *  - JJS: Superlative adj (biggest)
         */
        return this.tag.slice(0, 2) === 'JJ';
    };
    Word.prototype.isAdverb = function () {
        /**
         * will match:
         *  - RB:  Classic adverb (quickly)
         *  - RBR: Comparative adv (faster)
         *  - RBS: Superlative adv (fastest)
         */
        return this.tag.slice(0, 2) === 'RB';
    };
    Word.prototype.isNoun = function () {
        /**
         * will match:
         *  - NN:   Noun, sing. or mass (dog)
         *  - NNS:  Noun, plural (dogs)
         *  - NNP:  Proper noun, sing. (Edinburgh)
         *  - NNPS: Proper noun, plural (Smiths)
         */
        return this.tag.slice(0, 2) === 'NN';
    };
    Word.prototype.toString = function () {
        return this.str;
    };
    return Word;
}());
exports.default = Word;
//# sourceMappingURL=word.js.map