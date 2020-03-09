import {WordGroup, Word} from 'grammar/tokenizer';

import {Time, Person, Location, Item, Action, Meaning} from './notions/meaning';

/**
 * This class helps to read a sentence. 
 * It doesn't "unserstand" anything, it just follows the reading flow.
 * See it as a finger placed under the current word, and following as you read
 */
export default class SentenceReader {
    _understanding: any[];
    _words: (Word|WordGroup)[];
    _idx: number;
    _sentenceBreaks: number[];

    constructor(wg: (WordGroup|Word)[]) {
        this._words = wg;
        this._understanding = [];
        this._idx = 0;
        this._sentenceBreaks = [];
    }

    get currentWord(): (Word|WordGroup) {
        return this._words[this._idx];
    }

    get previousWord(): (Word|WordGroup) {
        if (this._idx-1 >= 0)
            return this._words[this._idx-1];
        else
            return undefined;
    }

    get nextWord(): (Word|WordGroup) {
        if (this._idx+1 < this._words.length)
            return this._words[this._idx+1];
        else
            return undefined;
    }

    getWordAt(i: number): any {
        return this._words[i];
    }

    /**
     * This gives the last mentionned Item or Person
     */
    getLastMentionnedThing(): Person|Item {
        let i = this._idx;

        while (i--) {
            if (this._understanding[i] instanceof Person)
                return this._understanding[i] as Person;

            if (this._understanding[i] instanceof Item)
                return this._understanding[i] as Item;
        }
    }

    getLastAction(): Action {
        let i = this._idx;

        while ((!this._sentenceBreaks.includes(i)) && i--)
            if (this._understanding[i] instanceof Action)
                return this._understanding[i] as Action;

        return undefined;
    }

    verbWasUsedBefore(): boolean {
        let i = this._idx;

        while ((!this._sentenceBreaks.includes(i)) && i--)
            if (this._understanding[i] instanceof Action)
                return true;

        return false;
    }
    
    addSentenceBreak(i:number = this._idx) {
        if (!this._sentenceBreaks.includes(i)) 
            this._sentenceBreaks.push(i);
    }

    // Returns [index, word] | [-1, undefined]
    findRegexAfter(regex: RegExp): [number, Word|WordGroup] {
        for (let i=this._idx ; i<this._words.length ; i++) {
            if (regex.test(this._words[i].toString()))
                return [i, this._words[i]];
        }

        return [-1, undefined];
    }

    deleteWord(i:number = this._idx): void { 
        this._words.splice(i, 1);

        if (i in this._understanding)
            this._understanding.splice(i, 1);
    }

    next(): boolean {
        if (this._idx < this._words.length-1) {
            this._idx++;
            return true;
        } else
            return false;
    }

    prev(): boolean {
        if (this._idx > 0) {
            this._idx--;
            return true;
        } else
            return false;
    }

    addMeaning(meaning: any, i: number = this._idx) {
        this._understanding[i] = meaning;
    }

}
