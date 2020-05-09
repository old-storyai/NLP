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
const pos_1 = __importDefault(require("pos"));
const Data = __importStar(require("data/data"));
const wordGroup_1 = require("./wordGroup/wordGroup");
exports.WordGroup = wordGroup_1.WordGroup;
exports.Word = wordGroup_1.Word;
/**
 * Allows to tokenize a sentence, only based on its gramatical composition, no
 * meaning involved
 */
class Tokenizer {
    /**
     *
     * Identify sub-sentence groups:
     * "Turn off the old stove next to the washing machine"
     *   => {
     *        "Turn off": "G_VV",
     *        "the old stove": "G_NN",
     *        "next to": "PRP",
     *        "the washing machine": "G_NN"
     *      }
     */
    groupWords(sentence) {
        const wordGroup = this.wordPerWord(sentence);
        const rules = Data.getData('grammarGroupRules');
        wordGroup.tokenize(rules);
        return wordGroup;
    }
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
    wordPerWord(sentence) {
        const tagger = new pos_1.default.Tagger();
        sentence = sentence.replace(/(['])/g, ' $1');
        sentence = sentence.replace(/([.,;?!])/g, ' $1 ');
        //
        // Extending the lexic with our words
        //
        // Replacing matches with placeholders
        const extension = Data.getData('lexicExtension');
        const replacements = [];
        let idx = 0;
        Object.keys(extension).forEach(word => {
            sentence = sentence.replace(new RegExp(word, 'gi'), match => {
                replacements[idx] = [match, extension[word]];
                return `::${idx++}::`;
            });
        });
        // Tagging the words
        let taggedWords = tagger.tag(sentence.trim().split(/[^\w':;,.]+/));
        // Placing back the extended words in their placeholders
        taggedWords = taggedWords.map(([word, grp]) => {
            if (/^::\d+::$/.test(word)) {
                const i = word.replace(/^::|::$/g, '');
                return replacements[i];
            }
            return [word, grp];
        });
        // Creating Word instances
        const words = taggedWords.map(w => new wordGroup_1.Word(w[0], w[1]));
        //
        // Exceptions!
        //
        // Verb right after determiner is impossible, it has to be an adjective
        // e.g. the Heating system, Heating = JJ
        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const lastWord = words[i - 1];
            if (word.isVerb() && (lastWord.isDeterminer() || lastWord.isAdjective())) {
                words[i].group = 'JJ';
            }
        }
        // "'s" before a noun is a possessive ending, not a verb
        for (let i = 0; i < words.length - 1; i++) {
            const word = words[i];
            if (word.str === '\'s') {
                for (let j = i + 1; j < words.length; j++) {
                    const nextWord = words[j];
                    if (!nextWord.isNoun() && !nextWord.isAdjective()) // it's a verb
                        break;
                    if (nextWord.isNoun()) { // it's a possessive ending
                        words[i].group = 'POS';
                        break;
                    }
                }
            }
        }
        // do ... open => open is a verb!
        //   This is an error from the POS tager...
        let doEncounter = false;
        for (let i = 0; i < words.length - 1; i++) {
            const word = words[i];
            if (doEncounter) {
                if (!word.isAdverb())
                    doEncounter = false;
                if (word.str === 'open') {
                    word.group = 'VB';
                }
            }
            if (word.str.toLowerCase() === 'do')
                doEncounter = true;
        }
        return new wordGroup_1.WordGroup(words);
    }
}
exports.Tokenizer = Tokenizer;
//# sourceMappingURL=tokenizer.js.map