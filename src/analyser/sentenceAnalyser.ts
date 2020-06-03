import colors from 'colors';
import Balance from '../data/balance';
import TreeParser from '../data/treeParser';
import * as Data from '../data/data';
import * as Normalizer from '../language/normalizer';
import {Tokenizer, WordGroup, Word} from '../grammar/tokenizer';

import SentenceReader from './sentenceReader';
import {Time, Person, Location, Item, Action, Meaning, Value} from '../infos/meaning';


/**
 * This class helps to understand a sentence
 */
export default class SentenceAnalyser {

    _reader: SentenceReader;
    _currentMeaning: Meaning;
    _allMeanings: Meaning[];
    _separatorQueue: Word[];

    constructor(str: string) {

        str = Normalizer.replaceIdioms(str);

        this._separatorQueue = [];

        const wg: WordGroup = Tokenizer.groupWords(str);

        console.log(wg.toNiceString());
        
        this._reader = new SentenceReader(wg.words);
    }

    createMeanings(): Meaning[] {

        const allMeanings = [];

        do {
            const meaning = this.getOneMeaning();
            allMeanings.push(meaning);

        } while (this._reader.next());

        return allMeanings.filter(m => !m.isEmpty()) as Meaning[];
    }

    /**
     * Search for one meaning on the sentence, when this meaning seems to end,
     * it stops and returns the found meaning
     */
    getOneMeaning(): Meaning {
        this._separatorQueue = [];
        let meaning = new Meaning();

        let endOfSentence = false;

        this._reader.beginSubsentence();

        if (this._reader.currentWord.tag === 'G_VB')
            meaning._type = 'order';

        if (/when|if/gi.test(this._reader.currentWord.toString()))
            meaning._type = 'condition';

        do {
            const word = this._reader.currentWord;

            switch (word.tag) {
                case 'G_NN':
                    meaning = this.analyseNounGroup(meaning);
                    break;
                case 'G_VB':
                    this.handleComposedVerb();
                    if (!meaning._action) {
                        const a = new Action(word as WordGroup, this._separatorQueue);
                        meaning._action = a;
                        this._reader.addMeaning(a);
                    } else {
                        this._reader.prev(); // To go back, we don't want this word in this sentence
                        this._reader.prev(); // To cancel the next() bellow
                        endOfSentence = true;
                    }
                    break;
                case 'G_RB':

                    // Just assign it to meaning.modifiers
                    break;
                default:
                    // non-group: separator word
                    this._separatorQueue.push(word as Word);
                    if (!this.analyseSeparator())
                        endOfSentence = true;
            }
            if (word.tag.slice(0, 2) === 'G_')
                this._separatorQueue = [];

        } while (this._reader.next() && !endOfSentence);

        if (endOfSentence)
            this._reader.prev();


        this._reader.endSubsentence();

        return meaning;
    }

    private analyseSeparator(): boolean {

        const word = this._reader.currentWord as Word;
        const prev = this._reader.inCurrentSubSentence.previousWord || new Word('', '');
        const next = this._reader.inCurrentSubSentence.nextWord || new Word('', '');

        if (!this._reader.isAtFirstWordOfSubSentence() && (
            ['if', 'when'].includes(word.toString()) ||
            (word.isSoftPunctuation() || word.toString() === 'and') && (!prev.isNoun() || !next.isNoun()) ||
            word.isHardPunctuation()
        )) {
            this._reader.prev();
            return false;
        }


        if (['and', 'of'].includes(word.toString()) &&
            !!prev && prev.isNoun() &&
            !!next && next.isNoun()
        ) {
            const info = this._reader.inWholeDocument.getLastMentionnedInfo();
            info.addWords(next, this._separatorQueue);
            this._reader.next();
            this._separatorQueue = [];
            this._reader.addMeaning(info);
        }


        //
        // Handling subsentences!
        //
        // the lady who used to do that
        if ( word.isInterrogativeWord() &&
            !!prev && prev.isNoun() &&
            !!next && next.isVerb()
        ) {
            const info = this._reader.inWholeDocument.getLastMentionnedInfo();
            info._addition = this.getOneMeaning();
        }

        return true;
    }

    private analyseNounGroup(meaning: Meaning): Meaning {
        if (!this._reader.currentWord.isGroup() || !this._reader.currentWord.isNoun())
            throw new Error('Trying to analyse an innapropriate word');

        const word = this._reader.currentWord as WordGroup;

        const category = this.guessGNNCategory();

        switch(category) {

            case 'time':
                if (!meaning._time) {
                    const t = new Time(word as WordGroup, this._separatorQueue);
                    meaning._time = t;
                } else {
                    meaning._time.addWords(word, this._separatorQueue);
                }
                this._reader.addMeaning(meaning._time);
                break;

            case 'value':
                const value = new Value(word, this._separatorQueue);
                meaning._value = value;
                this._reader.addMeaning(value);
                break;

            case 'item':
                const item = new Item(word, this._separatorQueue);
                if (this._reader.inCurrentSubSentence.verbWasUsedBefore()) {
                    meaning._item = item;
                } else {
                    meaning._subject = item;
                }
                this._reader.addMeaning(item);
                break;

            case 'location':
                if (!!meaning._location) {
                    meaning._location.addWords(word, this._separatorQueue);
                } else {
                    const loc = new Location(word, this._separatorQueue);
                    meaning._location = loc;
                }
                this._reader.addMeaning(meaning._location);
                break;

            case 'person':
                const person = new Person(word, this._separatorQueue);

                if (this._reader.inCurrentSubSentence.verbWasUsedBefore()) {
                    meaning._target = person;
                } else {
                    meaning._subject = person;
                }
                this._reader.addMeaning(person);
                break;
        }

        const prevWord = this._reader.inCurrentSubSentence.previousWord;
        if (['person', 'item'].includes(category) &&
            !!prevWord && (
            prevWord.tag === 'MD' ||
            prevWord.tag === 'G_VB' && ['be', 'do'].includes(this._reader.getLastAction()._verb)
        )) {
            meaning._type = 'question';
        }

        return meaning;
    }

    /**
     * Verbs composed of multiple words
     *
     * TODO: Handle harder cases like:
     *          "Turn the coffee maker on the counter on"
     */
    private handleComposedVerb() {
        if (!this._reader.currentWord.isGroup() || !this._reader.currentWord.isVerb())
            throw new Error('Trying to analyse an innapropriate word');

        const words = this._reader.currentWord as WordGroup;
        const tp = new TreeParser(Data.getData('composedVerbs'));
        const secondParts = tp.findChildrenOfMatching(words.toString());

        if (!!secondParts) {
            const expectedWord = new RegExp(
                '\\b' + secondParts.join('|') + '\\b', 'gi'
            );

            const [index, match] = this._reader.findRegexAfter(expectedWord);

            if (index>=0) {
                this._reader.deleteWord(index);
                words.append([match]);
            }
        }
    }

    private guessGNNCategory(): string {
        if (!this._reader.currentWord.isGroup() || !this._reader.currentWord.isNoun())
            throw new Error('Trying to guess G_NN meaning for non G_NN word');

        const b = new Balance(Data.getData('nounGroupsMeanings'));

        const rigWeights = {};
        if (this._separatorQueue.length) {
            //
            // Infering meaning from the connectors prior to this group.
            //   e.g. "from my place"
            //

            const strPrec = this._separatorQueue.map(sep=>sep.toString()).join(' ');
            const b2 = new Balance(Data.getData('connectorMeanings'));
            const sepRig = b2.getWeightDetails(strPrec);

            for (const cat of Object.keys(sepRig))
                rigWeights[cat] = (rigWeights[cat] || 0) + sepRig[cat];
        }

        if ((!!this._reader.inCurrentSubSentence.previousWord) && this._reader.inCurrentSubSentence.previousWord.tag === 'G_VB') {
            //
            // Infering meaning from the preceding verb
            //   e.g. "call my brother"
            //

            const lastVerb = this._reader.getLastAction()._verb;
            const b2 = new Balance(Data.getData('verbMeaningInference'));
            const verbRig = b2.getWeightDetails(lastVerb);

            for (const cat of Object.keys(verbRig))
                rigWeights[cat] = (rigWeights[cat] || 0) + verbRig[cat];
        }


        b.rig(rigWeights);
        const cat = b.categorize(this._reader.currentWord.toString());

        return cat;
    }
}
