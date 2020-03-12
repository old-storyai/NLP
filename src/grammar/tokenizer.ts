import pos from 'pos';
import * as Data from 'data/data';
import {WordGroup, Word} from './wordGroup/wordGroup';

export {WordGroup, Word};

/**
 * Allows to tokenize a sentence, only based on its gramatical composition, no
 * meaning involved
 */
export class Tokenizer {

    static getData = Data.getData;


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
    static groupWords(sentence: string): WordGroup {
        const wordGroup = Tokenizer.wordPerWord(sentence);
        const rules = Tokenizer.getData('grammarGroupRules');

        console.log('wordGroup: ', wordGroup);

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
    static wordPerWord(sentence: string): WordGroup {
        const tagger = new pos.Tagger();
        sentence = sentence.replace(/(['])/g, ' $1');
        sentence = sentence.replace(/([.,;?!])/g, ' $1 ');

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
        taggedWords = taggedWords.map(([word, tag]) => {
            if(/^::\d+::$/.test(word)) {
                const i = word.replace(/^::|::$/g, '') as number;
                return replacements[i];
            }
            return [word, tag];
        });

        // Creating Word instances
        let words = taggedWords.map(w => new Word(w[0], w[1]));

        words = Tokenizer.correctPosErrors(words);

        return new WordGroup(words);
    }

    /**
     * Corrects errors that the POS tagger might have done
     */
    private static correctPosErrors(words: [Word]) {

        // Verb right after determiner is impossible, it has to be an adjective
        // e.g. the Heating system, Heating = JJ
        for (let i=1 ; i<words.length ; i++) {
            const word = words[i];
            const prevWord = words[i-1];
            if (word.isVerb() && (prevWord.isDeterminer() || prevWord.isAdjective())) {
                words[i].tag = 'JJ';
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
                        words[i].tag = 'POS';
                        break;
                    }

                }
            }
        }

        // do ... open => open is a verb!
        //   This is an error from the POS tager...
        let doEncounter = false;
        for (let i=0 ; i<words.length-1 ; i++) {
            const word = words[i];

            if (doEncounter) {
                if (!word.isAdverb())
                    doEncounter = false;

                if(word.str === 'open') {
                    word.tag = 'VB';
                }
            }

            if (word.str.toLowerCase() === 'do')
                doEncounter = true;
        }

        // Jeffrey Pollisvky
        //   ⤷ Pollisvky is a NNP
        let prevWord = words[0];
        for (let i=0 ; i<words.length-1 ; i++) {
            const word = words[i];

            if (prevWord.is('NNP') && 
                word.is('NN') &&
                /^[A-Z]/.test(word.toString().charAt(0))
            ) {
                word.tag = 'NNP';
            }

            prevWord = word;
        }

        // DT JJ !NN
        //  ⤷ JJ is most likely a NN 
        //   e.g. send a present to my mom
        //             . '--.--' '' 
        //            DT   JJ    TO
        let dtEncounter = false;
        for (let i=0 ; i<words.length-1 ; i++) {
            const word = words[i];

            if (dtEncounter &&
                !word.isAdjective() &&
                !word.isNoun() &&
                prevWord.isAdjective()
            ) {
                prevWord.tag = 'NN';
            }

            if (word.isDeterminer())
                dtEncounter = true;
            else if (!word.isAdjective())
                dtEncounter = false;

            prevWord = word;
        }

        return words;
    }
}
