"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const balance_1 = __importDefault(require("balance/balance"));
const Data = __importStar(require("data/data"));
const tokenizer_1 = require("grammar/tokenizer");
const sentenceReader_1 = __importDefault(require("./sentenceReader"));
const meaning_1 = require("./notions/meaning");
/**
 * This class helps to understand a sentence
 */
class SentenceAnalyser {
    constructor(str) {
        this._separatorQueue = [];
        const t = new tokenizer_1.Tokenizer();
        const wg = t.groupWords(str);
        console.log('' + wg.toNiceString());
        this._reader = new sentenceReader_1.default(wg.words);
    }
    createMeanings() {
        this._separatorQueue = [];
        this._allMeanings = [];
        this._currentMeaning = new meaning_1.Meaning();
        this.startNewSubsentence();
        do {
            const word = this._reader.currentWord;
            switch (word.group) {
                case 'G_NN':
                    this.analyseNounGroup();
                    break;
                case 'G_VB':
                    const a = new meaning_1.Action(word, this._separatorQueue);
                    this._currentMeaning._action = a;
                    this._reader.addMeaning(a);
                    break;
                case 'G_RB':
                    // Just assign it to meaning.modifiers
                    break;
                default:
                    // non-group: separator word
                    this._separatorQueue.push(word);
                    this.analyseSeparator();
            }
            if (word.group.slice(0, 2) === 'G_')
                this._separatorQueue = [];
        } while (this._reader.next());
        this._allMeanings.push(this._currentMeaning);
        console.log('\n\nall_meanings: \n' + this._allMeanings.map(m => m.toString()).join('\n\n'));
    }
    analyseSeparator() {
        const word = this._reader.currentWord;
        if (['and', 'if', 'when'].includes(word.toString()) || word.isPunctuation())
            this.startNewSubsentence();
        if (word.toString() === 'of' &&
            this._reader.nextWord.group === 'G_NN' &&
            this._reader.previousWord.group === 'G_NN') {
            this._reader.next();
            this.analyseNounGroup();
            this._reader.prev();
            // this._reader.
        }
    }
    analyseNounGroup() {
        const word = this._reader.currentWord;
        const category = this.guessGNNCategory();
        switch (category) {
            case 'time':
                if (!this._currentMeaning._time) {
                    const t = new meaning_1.Time(word, this._separatorQueue);
                    this._currentMeaning._time = t;
                }
                else {
                    this._currentMeaning._time.addWords(word, this._separatorQueue);
                }
                this._reader.addMeaning(this._currentMeaning._time);
                break;
            case 'value':
                const value = new meaning_1.Value(word, this._separatorQueue);
                this._currentMeaning._value = value;
                this._reader.addMeaning(value);
                break;
            case 'item':
                const item = new meaning_1.Item(word, this._separatorQueue);
                if (this._reader.verbWasUsedBefore()) {
                    this._currentMeaning._item = item;
                }
                else {
                    this._currentMeaning._subject = item;
                }
                this._reader.addMeaning(item);
                break;
            case 'location':
                const loc = new meaning_1.Location(word, this._separatorQueue);
                this._currentMeaning._location = loc;
                this._reader.addMeaning(loc);
                break;
            case 'person':
                const person = new meaning_1.Person(word, this._separatorQueue);
                if (this._reader.verbWasUsedBefore()) {
                    this._currentMeaning._target = person;
                }
                else {
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
            !!prevWord && (prevWord.group === 'MD' ||
            prevWord.group === 'G_VB' && ['do', 'is', 'are'].includes(prevWord.toString()))) {
            this._currentMeaning._type = 'question';
        }
    }
    startNewSubsentence() {
        this._allMeanings.push(this._currentMeaning);
        this._currentMeaning = new meaning_1.Meaning();
        if (this._reader.currentWord.group === 'G_VB')
            this._currentMeaning._type = 'order';
        if (/when|if/gi.test(this._reader.currentWord.toString()))
            this._currentMeaning._type = 'condition';
    }
    guessGNNCategory() {
        const balanceConfig = Data.getData('nounGroupsMeanings');
        const b = new balance_1.default(balanceConfig);
        const rigWeights = {};
        if (this._separatorQueue.length) {
            //
            // Infering meaning from the connectors prior to this group.
            //   e.g. "from my place"
            //
            const strPrec = this._separatorQueue.map(sep => sep.toString()).join(' ');
            const b2 = new balance_1.default(Data.getData('connectorMeanings'));
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
            const b2 = new balance_1.default(Data.getData('verbMeaningInference'));
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
exports.default = SentenceAnalyser;
//# sourceMappingURL=sentenceAnalyser.js.map