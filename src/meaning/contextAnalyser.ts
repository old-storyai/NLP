import * as Data from 'data/data';
import StringParser from 'data/stringParser';
import {Tokenizer, WordGroup, Word} from '../grammar/tokenizer';

export default class ContextAnalyser {

    _sentence: string

    constructor(sent: string) {
        this._sentence = sent;
    }

    private handleThing(match, index, category, weight) {
        console.log(category, '=>', match, `(${index})`);

        const length = String(match).split(/\s+/).length;

        return '';
    }

    private handleSentenceType(sentence_type: string) {
        console.log('type = ', sentence_type);

        return '';
    }

    private handleFilter(filterName: string, filterType: ('filter'|'name')) {
        console.log('filter => ', filterType, filterName);

        return '';
    }

    private handleReference(category: string, many?: boolean, genre?: boolean) {
        let str = 'Ref => ' + category;
        if (many !== undefined)
            str += ' ' + (many?'multi':'solo');

        if (genre !== undefined)
            str += ' ' + (genre?'F':'M');

        console.log(str);

        return '';
    }

    createGroups() {
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

        console.log(sentence);
        console.log(parallelSet);

        new StringParser(matches, definitions)
            .parseString(
                sentence.join(' '),
                (match, replacement) => {
                },
                () => {},
                {
                    'meaning-element': this.handleThing,
                    'sentence-type': this.handleSentenceType,
                    'reference': this.handleReference,
                    'filter': this.handleFilter
                },
                true,
                parallelSet
            );
    }
}
