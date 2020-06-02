import colors from 'colors';

import {WordGroup, Word} from '../grammar/tokenizer';
import Range from '../meaning/range/range';

import {Time, Person, Location, Item, Action, Meaning, Value} from '../meaning/infos/meaning';

enum SearchScope {
    local= 0,
    global= 1
}

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

    _searchScope: SearchScope;
    _sentencesRangesTree: Range;

    constructor(wg: (WordGroup|Word)[]) {
        this._words = wg;
        this._understanding = [];
        this._idx = 0;
        this._sentenceBreaks = [];

        this._sentencesRangesTree = new Range(0, undefined);
    }

    get currentWord(): (Word|WordGroup) {
        return this._words[this._idx];
    }

    get previousWord(): (Word|WordGroup) {
        let stop = 0;
        if (this._searchScope === SearchScope.local)
            stop = this.currentSubsentence.start;

        if (this._idx-1 >= stop)
            return this._words[this._idx-1];
        else
            return undefined;
    }

    get nextWord(): (Word|WordGroup) {
        let stop = this._words.length;
        if (this._searchScope === SearchScope.local)
            stop = this.currentSubsentence.end || stop;

        if (this._idx+1 < stop)
            return this._words[this._idx+1];
        else
            return undefined;
    }

    get inWholeDocument(): SentenceReader {
        this._searchScope = SearchScope.global;
        return this;
    }

    get inCurrentSubSentence(): SentenceReader {
        this._searchScope = SearchScope.local;
        return this;
    }

    get currentSubsentence(): Range {
        return this._sentencesRangesTree.getLowestChildForPos(this._idx);
    }

    beginSubsentence(i:number = this._idx) {
        // console.log('Starting SUB: '+ this._words[this._idx]);
        this._sentencesRangesTree.startNewSubRange(i);
    }

    endSubsentence(i:number = this._idx) {
        // console.log('Ending SUB: '+ this._words[this._idx]);
        this._sentencesRangesTree.endRangeForLowestChild(i);
    }

    isAtFirstWordOfSubSentence(): boolean {
        return this.currentSubsentence.start === this._idx;
    }

    getWordAt(i: number): any {
        return this._words[i];
    }

    /**
     * This gives the last understood element
     */
    getLastMentionnedInfo(): Person|Item|Location|Time|Value {
        let i = this._idx;

        let stop = 0;
        if (this._searchScope === SearchScope.local)
            stop = this.currentSubsentence.start;

        while (stop < i--) {
            if (this._understanding[i] instanceof Person)
                return this._understanding[i] as Person;

            if (this._understanding[i] instanceof Item)
                return this._understanding[i] as Item;

            if (this._understanding[i] instanceof Location)
                return this._understanding[i] as Location;

            if (this._understanding[i] instanceof Time)
                return this._understanding[i] as Time;

            if (this._understanding[i] instanceof Value)
                return this._understanding[i] as Value;
        }
    }

    getLastAction(): Action {
        let i = this._idx;

        let stop = 0;
        if (this._searchScope === SearchScope.local)
            stop = this.currentSubsentence.start;

        while (stop < i--)
            if (this._understanding[i] instanceof Action)
                return this._understanding[i] as Action;

        return undefined;
    }

    verbWasUsedBefore(): boolean {
        let i = this._idx;

        let stop = 0;
        if (this._searchScope === SearchScope.local)
            stop = this.currentSubsentence.start;

        while (stop < i--)
            if (this._understanding[i] instanceof Action)
                return true;

        return false;
    }
    
    /**
     * TODO Replace with ranges mechanism
     */
    addSentenceBreak(i:number = this._idx) {
        if (!this._sentenceBreaks.includes(i)) 
            this._sentenceBreaks.push(i);
    }

    // Returns [index, word] | [-1, undefined]
    findRegexAfter(regex: RegExp): [number, Word|WordGroup] {

        let stop = this._words.length;
        if (this._searchScope === SearchScope.local)
            stop = this.currentSubsentence.end;

        for (let i=this._idx ; i<stop ; i++) {
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

    hasFinished(): boolean {
        return this._idx === this._words.length-1;
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
