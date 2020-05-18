import * as Data from 'data/data';
import StringParser from 'data/stringParser';
import {Tokenizer, WordGroup, Word} from '../grammar/tokenizer';

interface Info {
    start: number;
    end: number;
    text: string;
    category: string;
}
interface Filter {
    filterType: 'filter|sort';
    filterBy: string;
    filterByIdx: number;
    data: string;
    dataIdx: number;
}

export default class ContextAnalyser {

    _sentence: string;
    _groups: (Info|Filter)[];

    constructor(sent: string) {
        this._sentence = sent;
        this._groups = [];
    }

    private handleThing(match, index, category, weight) {
        const length = String(match).split(/\s+/).length;

        this._groups.push({
            start: index,
            end: index + length - 1,
            category: category,
            text: match
        });

        return '';
    }

    private handleSentenceType(sentence_type: string) {
        return '';
    }

    private handleFilter(filterType: ('filter'|'sort'), filterBy: string, filterByIdx: number, filtered: string, filteredIdx: number) {
        this._groups.push({
            filterType: filterType,
            filterBy: filterBy,
            filterByIdx: filterByIdx,
            data: filtered,
            dataIdx: filteredIdx
        });


        return '';
    }

    private handleReference(category: string, many?: boolean, genre?: boolean) {
        let str = 'Ref => ' + category;
        if (many !== undefined)
            str += ' ' + (many?'multi':'solo');

        if (genre !== undefined)
            str += ' ' + (genre?'F':'M');

        return '';
    }

    analyse(): {groups: (Info|Filter)[]} {
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
                    'meaning-element': (...args) => this.handleThing(...args),
                    'sentence-type':   (...args) => this.handleSentenceType(...args),
                    'reference':       (...args) => this.handleReference(...args),
                    'filter':          (...args) => this.handleFilter(...args)
                },
                true,
                parallelSet
            );

        return {
            groups: this._groups
        };
    }
}
