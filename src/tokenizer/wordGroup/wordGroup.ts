
import colors from 'colors/safe';

import Word from './word/word';

export class WordGroup {
    _words: [Word];
    _meanings: object = {};
    /**
     * Noun group
     * Action group
     * Preposition?
     */
    _group: string;

    constructor(words: [Word]) {
        this._words = words;
    }

    findMeaning(): string {
        return 'time';
    }

    addMeaningSupposition(meaning: string, weight: number): void {
        if (meaning in this._meanings) {
            this._meanings[meaning] += weight;
        } else {
            this._meanings[meaning] = weight;
        }
    }

    /**
     * Allows to look for specific grammar formation in a word group
     *
     * For the sentence "The big dog and the cat are swimming", and the gramex /DT( JJ)? NN/
     * The result will be:
     * [
     *   [0, 2], // The big dog
     *   [4, 5]  // the cat
     * ]
     */
    findGrammar(gramex: string): [[number, number]] {
        let synth = this._words.map(w => w.group).join(' ');
        synth = ` ${synth} `;
        synth = synth.replace(new RegExp(gramex+'\\b', 'g'), match => {
            return `(${match})`;
        });

        synth = synth
            .replace(/\( /g, ' (')
            .replace(/ \)/g, ') ');

        const parts = synth.split(/\s+/);

        const matches = [];
        let inMatch = false;
        for (let i=0 ; i<parts.length ; i++) {
            if (/^\(/g.test(parts[i])) {
                // Beggining of a match
                inMatch = true;
                matches.push([i]);
            }

            if (/\)$/g.test(parts[i])) {
                // End of match
                matches[matches.length-1].push(i);
                inMatch = false;
            }
        }

        let strReslut = '';
        let inParenthesis = false; 

        for (let i=0 ; i<this._words.length ; i++) {
            const word = this._words[i];
            for (const range of matches)
                if (range[0] === i+1)
                    strReslut += '(';

            // if (inParenthesis)
            //     strReslut += colors.red(word.str);
            // else
            //     strReslut += colors.red(word.str);

            for (const range of matches)
                if (range[1] === i+1)
                    strReslut += ')';

            strReslut += ' ';
        }

        console.log('synth: ', synth);
        console.log('strReslut: ', strReslut);
        return matches as [[number, number]];
    }
}

export {Word};
