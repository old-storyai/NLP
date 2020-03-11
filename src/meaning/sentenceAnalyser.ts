import Balance from 'balance/balance';
import * as Data from 'data/data';
import * as Normalizer from 'language/normalizer';
import {Tokenizer, WordGroup, Word} from 'grammar/tokenizer';

import SentenceReader from './sentenceReader';
import {Time, Person, Location, Value, Item, Action, Meaning} from './notions/meaning';


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

        this._allMeanings = [];
        const allMeanings = [];

        console.log('\n\nall_meanings: \n' + this._allMeanings.map(m=>m.toString()).join('\n\n'));

        do {
            const meaning = this.getOneMeaning();
            allMeanings.push(meaning);

        } while (this._reader.next());

        return this._allMeanings.filter(m => !m.isEmpty());
    }

    /**
     * Search for one meaning on the sentence, when this meaning seems to end,
     * it stops and returns the found meaning, and what remains of the sentence
     */
    getOneMeaning(): Meaning {
        this._separatorQueue = [];
        let meaning = new Meaning();

        let endOfAnalysis = false;

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
                    const a = new Action(word as WordGroup, this._separatorQueue);
                    meaning._action = a;
                    this._reader.addMeaning(a);
                    break;
                case 'G_RB':

                    // Just assign it to meaning.modifiers
                    break;
                default:
                    // non-group: separator word
                    this._separatorQueue.push(word as Word);
                    if (this.analyseSeparator())
                        endOfAnalysis = true;
            }
            if (word.tag.slice(0, 2) === 'G_')
                this._separatorQueue = [];

        } while (this._reader.next() && !endOfAnalysis);

        console.log('meaning: ', meaning);

        return meaning;
    }

    private analyseSeparator(): boolean {

        const word = this._reader.currentWord as Word;

        if (['and', 'if', 'when'].includes(word.toString()) || word.isPunctuation()) {
            // Should finish the current meaning
            this._reader.addSentenceBreak();
            return false;
        }

        if ( word.isInterrogativeWord() &&
            this._reader.previousWord.isNoun() &&
            this._reader.nextWord.isVerb()
        ) {
            // we begin a submeaning
            console.log('=> SUBMEANING <=');
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
                if (this._reader.verbWasUsedBefore()) {
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
                if (this._reader.verbWasUsedBefore()) {
                    meaning._target = person;
                } else {
                    meaning._subject = person;
                }
                this._reader.addMeaning(person);
                break;
        }

        const prevWord = this._reader.previousWord;
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

        const word = this._reader.currentWord as WordGroup;
        const composedVerbs = Data.getData('composedVerbs');

        let expectedWord: RegExp;

        for (const composedVerb of Object.keys(composedVerbs)) {
            if (new RegExp(composedVerb, 'gi').test(word.toString())) {
                expectedWord = new RegExp(
                    '\\b' + composedVerbs[composedVerb].join('|') + '\\b', 'gi'
                );
            }
        }

        if (!!expectedWord) {
            const [index, match] = this._reader.findRegexAfter(expectedWord);

            if (index>=0) {
                this._reader.deleteWord(index);
                word.append([match]);
            }
        }
    }

    private guessGNNCategory(): string {
        if (!this._reader.currentWord.isGroup() || !this._reader.currentWord.isNoun())
            throw new Error('Trying to guess G_NN meaning for non G_NN word');

        const balanceConfig = Data.getData('nounGroupsMeanings');
        const b = new Balance(balanceConfig);

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

        if ((!!this._reader.previousWord) && this._reader.previousWord.tag === 'G_VB') {
            //
            // Infering meaning from the preceding verb
            //   e.g. "call my brother"
            //

            console.log('this._reader._understanding: ', this._reader._understanding);
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
