import Time from './time';
import Person from './person';
import Location from './location';
import Value from './value';
import Item from './item';
import Action from './action';
import Meaning from './meaning';
import SentenceReader from './sentenceReader';

import Balance from './balance/balance';

import {Tokenizer, WordGroup, Word, Data} from './grammar/tokenizer';

/**
 * This class helps to understand a sentence
 */
export default class SentenceAnalyser {

    _reader: SentenceReader;
    _currentMeaning: Meaning;
    _allMeanings: Meaning[];
    _separatorQueue: Word[];

    constructor(str: string) {

        this._separatorQueue = [];

        const t = new Tokenizer();
        const wg: WordGroup = t.groupWords(str);

        console.log(''+ wg.toNiceString());
        
        this._reader = new SentenceReader(wg.words);
    }

    createMeanings() {

        this._separatorQueue = [];
        this._allMeanings = [];
        this._currentMeaning = new Meaning();

        this.startNewSubsentence();

        do {
            let word = this._reader.currentWord;

            switch (word.group) {
                case 'G_NN':
                    this.analyseNounGroup();
                    break;
                case 'G_VB':
                    const a = new Action(word as WordGroup);
                    this._currentMeaning._action = a;
                    this._reader.addMeaning(a);
                    break;
                case 'G_RB':

                    // Just assign it to meaning.modifiers
                    break;
                default:
                    // non-group: separator word
                    
                    word = word as Word;

                    this._separatorQueue.push(word);
                    
                    if (['and', 'if', 'when'].includes(word.toString()) || word.isPunctuation()) 
                        this.startNewSubsentence();

                    switch (word.toString()) {
                        case 'of':
                            break;

                        case 'and':
                            break;
                        default:
                    }
            }
            if (word.group.slice(0, 2) === 'G_') {
                this._separatorQueue = [];
            }

        } while (this._reader.next());
        this._allMeanings.push(this._currentMeaning);

        console.log('\n\nall_meanings: \n' + this._allMeanings.map(m=>m.toString()).join('\n\n'));
    }

    private analyseNounGroup() {
        const word = this._reader.currentWord as WordGroup;

        const category = this.guessGNNCategory();

        switch(category) {
            case 'time':
                const t = new Time(word as WordGroup);
                this._currentMeaning._time = t;
                this._reader.addMeaning(t);
                break;
            case 'value':
                const value = new Value(word, this._separatorQueue);
                this._currentMeaning._value = value;
                this._reader.addMeaning(value);
                break;
            case 'item':
                const item = new Item(word);
                if (this._reader.verbWasUsedBefore()) {
                    this._currentMeaning._item = item;
                } else {
                    this._currentMeaning._subject = item;
                }
                this._reader.addMeaning(item);
                break;
            case 'location':
                const loc = new Location(word);
                this._currentMeaning._location = loc;
                this._reader.addMeaning(loc);
                break;
            case 'person':
                const person = new Person(word);
                if (this._reader.verbWasUsedBefore()) {
                    this._currentMeaning._target = person;
                } else {
                    this._currentMeaning._subject = person;
                }
                this._reader.addMeaning(person);
                break;
        }

        console.log(word + ' || ' + category);

        //
        // TODO: replace the `includes` bellow by stemming!!!
        //
        const prevWord = this._reader.previousWord;
        if (['person', 'item'].includes(category) &&
            !!prevWord && (
            prevWord.group === 'MD' ||
            prevWord.group === 'G_VB' && ['do', 'is', 'are'].includes(prevWord.toString())
        )) {
            this._currentMeaning._type = 'question';
        }
    }

    private startNewSubsentence() {
        this._allMeanings.push(this._currentMeaning);
        this._currentMeaning = new Meaning();
        if (this._reader.currentWord.group === 'G_VB')
            this._currentMeaning._type = 'order';

        if (/when|if/gi.test(this._reader.currentWord.toString()))
            this._currentMeaning._type = 'condition';
    }


    private guessGNNCategory(): string {
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

        if (this._reader.previousWord.group === 'G_VB') {
            //
            // Infering meaning from the preceding verb
            //   e.g. "call my brother"
            //

            const strPrec = this._reader.previousWord.toString();
            const b2 = new Balance(Data.getData('verbMeaningInference'));
            const verbRig = b2.getWeightDetails(strPrec);

            for (const cat of Object.keys(verbRig))
                rigWeights[cat] = (rigWeights[cat] || 0) + verbRig[cat];

            console.log('verbRig: ', verbRig);
        }


        b.rig(rigWeights);
        const cat = b.categorize(this._reader.currentWord.toString());

        return cat;
    }

}
