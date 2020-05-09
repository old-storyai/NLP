"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meaning_1 = require("./notions/meaning");
/**
 * This class helps to read a sentence.
 * It doesn't "unserstand" anything, it just follows the reading flow.
 * See it as a finger placed under the current word, and following as you read
 */
class SentenceReader {
    constructor(wg) {
        this._words = wg;
        this._understanding = [];
        this._idx = 0;
        this._sentenceBreaks = [];
    }
    get currentWord() {
        return this._words[this._idx];
    }
    get previousWord() {
        if (this._idx - 1 >= 0)
            return this._words[this._idx - 1];
        else
            return undefined;
    }
    get nextWord() {
        if (this._idx + 1 < this._words.length)
            return this._words[this._idx + 1];
        else
            return undefined;
    }
    getWordAt(i) {
        return this._words[i];
    }
    /**
     * This gives the last mentionned Item or Person
     */
    getLastMentionnedThing() {
        let i = this._idx;
        while (i--) {
            if (this._understanding[i] instanceof meaning_1.Person)
                return this._understanding[i];
            if (this._understanding[i] instanceof meaning_1.Item)
                return this._understanding[i];
        }
    }
    verbWasUsedBefore() {
        let i = this._idx;
        while ((!this._sentenceBreaks.includes(i)) && i--)
            if (this._understanding[i] instanceof meaning_1.Action)
                return true;
        return false;
    }
    addSentenceBreak(i = this._idx) {
        if (!this._sentenceBreaks.includes(i))
            this._sentenceBreaks.push(i);
    }
    // getLastMentionnedPerson(): Person {
    //     return new Person();
    // }
    next() {
        if (this._idx < this._words.length - 1) {
            this._idx++;
            return true;
        }
        else
            return false;
    }
    prev() {
        if (this._idx > 0) {
            this._idx--;
            return true;
        }
        else
            return false;
    }
    addMeaning(meaning, i = this._idx) {
        this._understanding[i] = meaning;
    }
}
exports.default = SentenceReader;
//# sourceMappingURL=sentenceReader.js.map