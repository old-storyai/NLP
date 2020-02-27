import pos from 'pos';
import * as Data from './data';
import {WordGroup, Word} from './wordGroup/wordGroup';


/**
 * This is the tokenizer, it can tokenize on different levels:
 *
 * - Split a whole sentence:
 *     "Lower the house temperature when I'm not home" -> ["Lower the house temperature", "when I'm not home"]
 *
 */
export default class Tokenizer {


    /**
     *
     * Identify sub-sentence groups:
     *   "Lower the house temperature at 5PM"
     *     -> [
     *        "action": "lower",
     *        "what": "the house temperature",
     *        "when": "at 5PM"
     *     ]
     */
    subSentences(sentence: string): object {
        const wordGroup = this.wordPerWord(sentence);
        const rules = Data.getData('grammarGroupRules');
        // const matches = {};
        console.log('wordGroup: ', wordGroup);
        // const allRanges = {};
        // for (const category of Object.keys(rules)) {
        //     console.log('\ncategory: ', category);
        //     const rule = rules[category];
        // }

        wordGroup.tokenize(rules);

        return {};
    }

    /**
     * Identify the sentence word per word:
     *   "Turn on the heating system"
     *     -> {
     *        "Turn on": "VB",
     *        "the": "DT",
     *        "heating": "NN",
     *        "system": "NN"
     *     }
     */
    wordPerWord(sentence: string): WordGroup {
        const tagger = new pos.Tagger();
        sentence = sentence.replace(/(['.,;?!])/g, ' $1 ');

        //
        // Extending the lexic with our words
        //
        // Replacing matches with placeholders
        const extension = Data.getData('lexicExtension');
        const replacements = [];
        let idx=0;
        Object.keys(extension).forEach(word => {
            sentence = sentence.replace(
                new RegExp(word, 'gi'),
                match => {
                    replacements[idx] = [match, extension[word]];
                    return `::${idx++}::`;
                }
            );
        });

        // Tagging the words
        let taggedWords = tagger.tag(
            sentence.trim().split(/[^\w':;,.]+/)
        );

        // Placing back the extended words in their placeholders
        taggedWords = taggedWords.map(([word, grp]) => {
            if(/^::\d+::$/.test(word)) {
                const i = word.replace(/^::|::$/g, '') as number;
                return replacements[i];
            }
            return [word, grp];
        });

        // Creating proper "Word" instances
        const words = taggedWords.map(w => new Word(w[0], w[1]));

        // Verb right after determiner is impossible, it has to be an adjective
        // e.g. the Heating system, Heating = JJ
        for (let i=1 ; i<words.length ; i++) {
            const word = words[i];
            const lastWord = words[i-1];
            if (word.isVerb() && (lastWord.isDeterminer() || lastWord.isAdjective())) {
                words[i].group = 'JJ';
            }
        }

        // "'s" before a noun is a possessive ending, not a verb
        for (let i=0 ; i<words.length-1 ; i++) {
            const word = words[i];
            if (word.str === '\'s') {
                for (let j=i+1 ; j<words.length ; j++) {
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

        return new WordGroup(words);
    }
}
