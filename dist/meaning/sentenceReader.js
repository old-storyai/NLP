"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var range_1 = __importDefault(require("./range/range"));
var meaning_1 = require("./notions/meaning");
var SearchScope;
(function (SearchScope) {
    SearchScope[SearchScope["local"] = 0] = "local";
    SearchScope[SearchScope["global"] = 1] = "global";
})(SearchScope || (SearchScope = {}));
/**
 * This class helps to read a sentence.
 * It doesn't "unserstand" anything, it just follows the reading flow.
 * See it as a finger placed under the current word, and following as you read
 */
var SentenceReader = /** @class */ (function () {
    function SentenceReader(wg) {
        this._words = wg;
        this._understanding = [];
        this._idx = 0;
        this._sentenceBreaks = [];
        this._sentencesRangesTree = new range_1.default(0, undefined);
    }
    Object.defineProperty(SentenceReader.prototype, "currentWord", {
        get: function () {
            return this._words[this._idx];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SentenceReader.prototype, "previousWord", {
        get: function () {
            var stop = 0;
            if (this._searchScope === SearchScope.local)
                stop = this.currentSubsentence.start;
            if (this._idx - 1 >= stop)
                return this._words[this._idx - 1];
            else
                return undefined;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SentenceReader.prototype, "nextWord", {
        get: function () {
            var stop = this._words.length;
            if (this._searchScope === SearchScope.local)
                stop = this.currentSubsentence.end || stop;
            if (this._idx + 1 < stop)
                return this._words[this._idx + 1];
            else
                return undefined;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SentenceReader.prototype, "inWholeDocument", {
        get: function () {
            this._searchScope = SearchScope.global;
            return this;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SentenceReader.prototype, "inCurrentSubSentence", {
        get: function () {
            this._searchScope = SearchScope.local;
            return this;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SentenceReader.prototype, "currentSubsentence", {
        get: function () {
            return this._sentencesRangesTree.getLowestChildForPos(this._idx);
        },
        enumerable: true,
        configurable: true
    });
    SentenceReader.prototype.beginSubsentence = function (i) {
        if (i === void 0) { i = this._idx; }
        // console.log('Starting SUB: '+ this._words[this._idx]);
        this._sentencesRangesTree.startNewSubRange(i);
    };
    SentenceReader.prototype.endSubsentence = function (i) {
        if (i === void 0) { i = this._idx; }
        // console.log('Ending SUB: '+ this._words[this._idx]);
        this._sentencesRangesTree.endRangeForLowestChild(i);
    };
    SentenceReader.prototype.isAtFirstWordOfSubSentence = function () {
        return this.currentSubsentence.start === this._idx;
    };
    SentenceReader.prototype.getWordAt = function (i) {
        return this._words[i];
    };
    /**
     * This gives the last understood element
     */
    SentenceReader.prototype.getLastMentionnedThing = function () {
        var i = this._idx;
        var stop = 0;
        if (this._searchScope === SearchScope.local)
            stop = this.currentSubsentence.start;
        while (stop < i--) {
            if (this._understanding[i] instanceof meaning_1.Person)
                return this._understanding[i];
            if (this._understanding[i] instanceof meaning_1.Item)
                return this._understanding[i];
            if (this._understanding[i] instanceof meaning_1.Location)
                return this._understanding[i];
            if (this._understanding[i] instanceof meaning_1.Time)
                return this._understanding[i];
            if (this._understanding[i] instanceof meaning_1.Value)
                return this._understanding[i];
        }
    };
    SentenceReader.prototype.getLastAction = function () {
        var i = this._idx;
        var stop = 0;
        if (this._searchScope === SearchScope.local)
            stop = this.currentSubsentence.start;
        while (stop < i--)
            if (this._understanding[i] instanceof meaning_1.Action)
                return this._understanding[i];
        return undefined;
    };
    SentenceReader.prototype.verbWasUsedBefore = function () {
        var i = this._idx;
        var stop = 0;
        if (this._searchScope === SearchScope.local)
            stop = this.currentSubsentence.start;
        while (stop < i--)
            if (this._understanding[i] instanceof meaning_1.Action)
                return true;
        return false;
    };
    /**
     * TODO Replace with ranges mechanism
     */
    SentenceReader.prototype.addSentenceBreak = function (i) {
        if (i === void 0) { i = this._idx; }
        if (!this._sentenceBreaks.includes(i))
            this._sentenceBreaks.push(i);
    };
    // Returns [index, word] | [-1, undefined]
    SentenceReader.prototype.findRegexAfter = function (regex) {
        var stop = this._words.length;
        if (this._searchScope === SearchScope.local)
            stop = this.currentSubsentence.end;
        for (var i = this._idx; i < stop; i++) {
            if (regex.test(this._words[i].toString()))
                return [i, this._words[i]];
        }
        return [-1, undefined];
    };
    SentenceReader.prototype.deleteWord = function (i) {
        if (i === void 0) { i = this._idx; }
        this._words.splice(i, 1);
        if (i in this._understanding)
            this._understanding.splice(i, 1);
    };
    SentenceReader.prototype.hasFinished = function () {
        return this._idx === this._words.length - 1;
    };
    SentenceReader.prototype.next = function () {
        if (this._idx < this._words.length - 1) {
            this._idx++;
            return true;
        }
        else
            return false;
    };
    SentenceReader.prototype.prev = function () {
        if (this._idx > 0) {
            this._idx--;
            return true;
        }
        else
            return false;
    };
    SentenceReader.prototype.addMeaning = function (meaning, i) {
        if (i === void 0) { i = this._idx; }
        this._understanding[i] = meaning;
    };
    return SentenceReader;
}());
exports.default = SentenceReader;
//# sourceMappingURL=sentenceReader.js.map