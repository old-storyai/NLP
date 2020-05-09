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
var pos_1 = __importDefault(require("pos"));
var Data = __importStar(require("../data/data"));
var wordGroup_1 = require("./wordGroup/wordGroup");
exports.WordGroup = wordGroup_1.WordGroup;
exports.Word = wordGroup_1.Word;
var stringParser_1 = __importDefault(require("../data/stringParser"));
/**
 * Allows to tokenize a sentence, only based on its gramatical composition, no
 * meaning involved
 */
var Tokenizer = /** @class */ (function () {
    function Tokenizer() {
    }
    /**
     *
     * Identify sub-sentence groups and tags:
     * "Turn off the old stove next to the washing machine"
     *   => {
     *        "Turn off": "G_VV",
     *        "the old stove": "G_NN",
     *        "next to": "PRP",
     *        "the washing machine": "G_NN"
     *      }
     */
    Tokenizer.groupWords = function (sentence) {
        var wordGroup = Tokenizer.wordPerWord(sentence);
        // console.log('wordGroup: ', wordGroup);
        var rules = Tokenizer.getData('grammarGroupRules');
        wordGroup.tokenize(rules);
        return wordGroup;
    };
    /**
     * Identify the genre of each word of the sentence
     *   "Turn on the heating system"
     *     -> {
     *        "Turn on": "VB",
     *        "the": "DT",
     *        "heating": "NN",
     *        "system": "NN"
     *     }
     */
    Tokenizer.wordPerWord = function (sentence) {
        var tagger = new pos_1.default.Tagger();
        sentence = sentence.replace(/(['])/g, ' $1');
        sentence = sentence.replace(/([.,;?!])/g, ' $1 ');
        //
        // Extending the lexic with our words
        // 
        var extension = Data.getData('lexicExtension');
        var words = [];
        new stringParser_1.default(extension).parseString(sentence, function (match, tag) {
            words.push(new wordGroup_1.Word(match, tag));
        }, function (unmatch) {
            tagger.tag(unmatch.trim().split(/[^\w':;,.]+/)).forEach(function (_a) {
                var word = _a[0], tag = _a[1];
                words.push(new wordGroup_1.Word(word, tag));
            });
        }, [], false);
        words = Tokenizer.correctPosErrors(words);
        return new wordGroup_1.WordGroup(words);
    };
    /**
     * Corrects errors that the POS tagger might have done
     */
    Tokenizer.correctPosErrors = function (words) {
        // Verb right after determiner is impossible, it has to be an adjective
        // e.g. the Heating system, Heating = JJ
        for (var i = 1; i < words.length; i++) {
            var word = words[i];
            var prevWord_1 = words[i - 1];
            if (word.isVerb() && (prevWord_1.isDeterminer() || prevWord_1.isAdjective())) {
                words[i].tag = 'JJ';
            }
        }
        // "'s" before a noun is a possessive ending, not a verb
        for (var i = 0; i < words.length - 1; i++) {
            var word = words[i];
            if (word.str === '\'s') {
                for (var j = i + 1; j < words.length; j++) {
                    var nextWord = words[j];
                    if (!nextWord.isNoun() && !nextWord.isAdjective()) // it's a verb
                        break;
                    if (nextWord.isNoun()) { // it's a possessive ending
                        words[i].tag = 'POS';
                        break;
                    }
                }
            }
        }
        // do ... open => open is a verb!
        //   This is an error from the POS tager...
        var doEncounter = false;
        for (var i = 0; i < words.length - 1; i++) {
            var word = words[i];
            if (doEncounter) {
                if (!word.isAdverb())
                    doEncounter = false;
                if (word.str === 'open') {
                    word.tag = 'VB';
                }
            }
            if (word.str.toLowerCase() === 'do')
                doEncounter = true;
        }
        // Jeffrey Pollisvky
        //   ⤷ Pollisvky is a NNP
        var prevWord = words[0];
        for (var i = 0; i < words.length - 1; i++) {
            var word = words[i];
            if (prevWord.is('NNP') &&
                word.is('NN') &&
                /^[A-Z]/.test(word.toString().charAt(0))) {
                word.tag = 'NNP';
            }
            prevWord = word;
        }
        // DT JJ !NN
        //  ⤷ JJ is most likely a NN 
        //   e.g. send a present to my mom
        //             ' '--.--' '' 
        //            DT   JJ    TO
        var dtEncounter = false;
        for (var i = 0; i < words.length - 1; i++) {
            var word = words[i];
            if (dtEncounter &&
                !word.isAdjective() &&
                !word.isNoun() &&
                prevWord.isAdjective()) {
                prevWord.tag = 'NN';
            }
            if (word.isDeterminer())
                dtEncounter = true;
            else if (!word.isAdjective())
                dtEncounter = false;
            prevWord = word;
        }
        return words;
    };
    Tokenizer.getData = Data.getData;
    return Tokenizer;
}());
exports.Tokenizer = Tokenizer;
//# sourceMappingURL=tokenizer.js.map