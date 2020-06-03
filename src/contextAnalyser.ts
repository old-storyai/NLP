import * as Data from './data/data';
import StringParser from './data/stringParser';
import {Tokenizer, WordGroup, Word} from './grammar/tokenizer';

interface SentenceElement {
    toJSON: () => {'datatype': string, 'data': any}
    toString: () => string
}

class Info implements SentenceElement {
    start: number;
    end: number;
    text: string;
    category: string;

    constructor(start0: number, end0: number, text0: string, category0: string) {
        this.start = start0;
        this.end = end0;
        this.text = text0;
        this.category = category0;
    }

    toJSON() {
        return {
            datatype: 'info',
            data: {
                start: this.start,
                end: this.end,
                text: this.text,
                category: this.category
            }
        };
    }

    toString() {
        return `${this.category} - ${this.text}`;
    }
}
class Filter implements SentenceElement {
    filterType: 'filter|sort';
    filterBy: string;
    filterByIdx: number;
    data: string;
    dataIdx: number;

    constructor(filterType0: 'filter|sort', filterBy0: string, filterByIdx0: number, data0: string, dataIdx0: number) {
        this.filterType = filterType0;
        this.filterBy = filterBy0;
        this.filterByIdx = filterByIdx0;
        this.data = data0;
        this.dataIdx = dataIdx0;
    }

    toJSON() {
        return {
            datatype: 'filter',
            data: {
                filterType: this.filterType,
                filterBy: this.filterBy,
                filterByIdx: this.filterByIdx,
                data: this.data,
                dataIdx: this.dataIdx
            }
        };
    }

    toString() {
        return `${this.filterType} ${this.data} BY ${this.filterBy}`;
    }
}

enum SentenceType {
    'question',
    'order',
    'description',
    'condition'
}
class SentenceMeta implements SentenceElement {
    type: SentenceType

    constructor(type0: SentenceType) {
        this.type = type0;
    }

    toJSON() {
        return {
            datatype: 'sentencemeta',
            data: {
                type: this.type
            }
        };
    }

    toString() {
        return `Sentence type: ${this.type}`;
    }
}

export default class ContextAnalyser {

    _sentence: string;
    _groups: SentenceElement[];

    constructor(sent: string) {
        this._sentence = sent;
        this._groups = [];
    }

    private handleInfo(match, index, category, weight) {
        const length = String(match).split(/\s+/).length;

        this._groups.push(new Info(
            index,
            index + length - 1,
            match,
            category
        ));

        return '';
    }

    private handleSentenceType(sentence_type) {
        this._groups.push(new SentenceMeta(sentence_type));

        return '';
    }

    private handleFilter(filterType, filterBy, filterByIdx, filtered, filteredIdx) {
        this._groups.push(new Filter(
            filterType,
            filterBy,
            filterByIdx,
            filtered,
            filteredIdx
        ));


        return '';
    }

    private handleReference(category, many, genre) {
        let str = 'Ref => ' + category;
        if (many !== undefined)
            str += ' ' + (many?'multi':'solo');

        if (genre !== undefined)
            str += ' ' + (genre?'F':'M');

        return '';
    }

    analyse(): {groups: SentenceElement[]} {
        const {definitions, matches} = Data.getData('contextRules');

        const tokens = Tokenizer.wordPerWord(this._sentence);
        const sentence = [];
        const parallelSet = [];
        tokens.words.forEach(word => {
            word.toString().trim().split(/\s/).forEach(rawWord => {
                sentence.push(rawWord);
                parallelSet.push(word.getSimplifiedTag());
            });
        });

        new StringParser(matches, definitions)
            .parseString(
                sentence.join(' '),
                (match, replacement) => {
                },
                () => {},
                {
                    'meaning-element': this.handleInfo.bind(this),
                    'sentence-type':   this.handleSentenceType.bind(this),
                    'reference':       this.handleReference.bind(this),
                    'filter':          this.handleFilter.bind(this)
                },
                true,
                parallelSet
            );

        return {
            groups: this._groups
        };
    }
}
