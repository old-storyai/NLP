"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var balance_1 = __importDefault(require("../data/balance"));
var treeParser_1 = __importDefault(require("../data/treeParser"));
var Data = __importStar(require("../data/data"));
var Normalizer = __importStar(require("../language/normalizer"));
var tokenizer_1 = require("../grammar/tokenizer");
var sentenceReader_1 = __importDefault(require("./sentenceReader"));
var meaning_1 = require("../infos/meaning");
/**
 * This class helps to understand a sentence
 */
var SentenceAnalyser = /** @class */ (function () {
    function SentenceAnalyser(str) {
        str = Normalizer.replaceIdioms(str);
        this._separatorQueue = [];
        var wg = tokenizer_1.Tokenizer.groupWords(str);
        console.log(wg.toNiceString());
        this._reader = new sentenceReader_1.default(wg.words);
    }
    SentenceAnalyser.prototype.createMeanings = function () {
        var allMeanings = [];
        do {
            var meaning = this.getOneMeaning();
            allMeanings.push(meaning);
        } while (this._reader.next());
        return allMeanings.filter(function (m) { return !m.isEmpty(); });
    };
    /**
     * Search for one meaning on the sentence, when this meaning seems to end,
     * it stops and returns the found meaning
     */
    SentenceAnalyser.prototype.getOneMeaning = function () {
        this._separatorQueue = [];
        var meaning = new meaning_1.Meaning();
        var endOfSentence = false;
        this._reader.beginSubsentence();
        if (this._reader.currentWord.tag === 'G_VB')
            meaning._type = 'order';
        if (/when|if/gi.test(this._reader.currentWord.toString()))
            meaning._type = 'condition';
        do {
            var word = this._reader.currentWord;
            switch (word.tag) {
                case 'G_NN':
                    meaning = this.analyseNounGroup(meaning);
                    break;
                case 'G_VB':
                    this.handleComposedVerb();
                    if (!meaning._action) {
                        var a = new meaning_1.Action(word, this._separatorQueue);
                        meaning._action = a;
                        this._reader.addMeaning(a);
                    }
                    else {
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
                    this._separatorQueue.push(word);
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
    };
    SentenceAnalyser.prototype.analyseSeparator = function () {
        var word = this._reader.currentWord;
        var prev = this._reader.inCurrentSubSentence.previousWord || new tokenizer_1.Word('', '');
        var next = this._reader.inCurrentSubSentence.nextWord || new tokenizer_1.Word('', '');
        if (!this._reader.isAtFirstWordOfSubSentence() && (['if', 'when'].includes(word.toString()) ||
            (word.isSoftPunctuation() || word.toString() === 'and') && (!prev.isNoun() || !next.isNoun()) ||
            word.isHardPunctuation())) {
            this._reader.prev();
            return false;
        }
        if (['and', 'of'].includes(word.toString()) &&
            !!prev && prev.isNoun() &&
            !!next && next.isNoun()) {
            var info = this._reader.inWholeDocument.getLastMentionnedInfo();
            info.addWords(next, this._separatorQueue);
            this._reader.next();
            this._separatorQueue = [];
            this._reader.addMeaning(info);
        }
        //
        // Handling subsentences!
        //
        // the lady who used to do that
        if (word.isInterrogativeWord() &&
            !!prev && prev.isNoun() &&
            !!next && next.isVerb()) {
            var info = this._reader.inWholeDocument.getLastMentionnedInfo();
            info._addition = this.getOneMeaning();
        }
        return true;
    };
    SentenceAnalyser.prototype.analyseNounGroup = function (meaning) {
        if (!this._reader.currentWord.isGroup() || !this._reader.currentWord.isNoun())
            throw new Error('Trying to analyse an innapropriate word');
        var word = this._reader.currentWord;
        var category = this.guessGNNCategory();
        switch (category) {
            case 'time':
                if (!meaning._time) {
                    var t = new meaning_1.Time(word, this._separatorQueue);
                    meaning._time = t;
                }
                else {
                    meaning._time.addWords(word, this._separatorQueue);
                }
                this._reader.addMeaning(meaning._time);
                break;
            case 'value':
                var value = new meaning_1.Value(word, this._separatorQueue);
                meaning._value = value;
                this._reader.addMeaning(value);
                break;
            case 'item':
                var item = new meaning_1.Item(word, this._separatorQueue);
                if (this._reader.inCurrentSubSentence.verbWasUsedBefore()) {
                    meaning._item = item;
                }
                else {
                    meaning._subject = item;
                }
                this._reader.addMeaning(item);
                break;
            case 'location':
                if (!!meaning._location) {
                    meaning._location.addWords(word, this._separatorQueue);
                }
                else {
                    var loc = new meaning_1.Location(word, this._separatorQueue);
                    meaning._location = loc;
                }
                this._reader.addMeaning(meaning._location);
                break;
            case 'person':
                var person = new meaning_1.Person(word, this._separatorQueue);
                if (this._reader.inCurrentSubSentence.verbWasUsedBefore()) {
                    meaning._target = person;
                }
                else {
                    meaning._subject = person;
                }
                this._reader.addMeaning(person);
                break;
        }
        var prevWord = this._reader.inCurrentSubSentence.previousWord;
        if (['person', 'item'].includes(category) &&
            !!prevWord && (prevWord.tag === 'MD' ||
            prevWord.tag === 'G_VB' && ['be', 'do'].includes(this._reader.getLastAction()._verb))) {
            meaning._type = 'question';
        }
        return meaning;
    };
    /**
     * Verbs composed of multiple words
     *
     * TODO: Handle harder cases like:
     *          "Turn the coffee maker on the counter on"
     */
    SentenceAnalyser.prototype.handleComposedVerb = function () {
        if (!this._reader.currentWord.isGroup() || !this._reader.currentWord.isVerb())
            throw new Error('Trying to analyse an innapropriate word');
        var words = this._reader.currentWord;
        var tp = new treeParser_1.default(Data.getData('composedVerbs'));
        var secondParts = tp.findChildrenOfMatching(words.toString());
        if (!!secondParts) {
            var expectedWord = new RegExp('\\b' + secondParts.join('|') + '\\b', 'gi');
            var _a = this._reader.findRegexAfter(expectedWord), index = _a[0], match = _a[1];
            if (index >= 0) {
                this._reader.deleteWord(index);
                words.append([match]);
            }
        }
    };
    SentenceAnalyser.prototype.guessGNNCategory = function () {
        if (!this._reader.currentWord.isGroup() || !this._reader.currentWord.isNoun())
            throw new Error('Trying to guess G_NN meaning for non G_NN word');
        var b = new balance_1.default(Data.getData('nounGroupsMeanings'));
        var rigWeights = {};
        if (this._separatorQueue.length) {
            //
            // Infering meaning from the connectors prior to this group.
            //   e.g. "from my place"
            //
            var strPrec = this._separatorQueue.map(function (sep) { return sep.toString(); }).join(' ');
            var b2 = new balance_1.default(Data.getData('connectorMeanings'));
            var sepRig = b2.getWeightDetails(strPrec);
            for (var _i = 0, _a = Object.keys(sepRig); _i < _a.length; _i++) {
                var cat_1 = _a[_i];
                rigWeights[cat_1] = (rigWeights[cat_1] || 0) + sepRig[cat_1];
            }
        }
        if ((!!this._reader.inCurrentSubSentence.previousWord) && this._reader.inCurrentSubSentence.previousWord.tag === 'G_VB') {
            //
            // Infering meaning from the preceding verb
            //   e.g. "call my brother"
            //
            var lastVerb = this._reader.getLastAction()._verb;
            var b2 = new balance_1.default(Data.getData('verbMeaningInference'));
            var verbRig = b2.getWeightDetails(lastVerb);
            for (var _b = 0, _c = Object.keys(verbRig); _b < _c.length; _b++) {
                var cat_2 = _c[_b];
                rigWeights[cat_2] = (rigWeights[cat_2] || 0) + verbRig[cat_2];
            }
        }
        b.rig(rigWeights);
        var cat = b.categorize(this._reader.currentWord.toString());
        return cat;
    };
    return SentenceAnalyser;
}());
exports.default = SentenceAnalyser;
//# sourceMappingURL=sentenceAnalyser.js.map