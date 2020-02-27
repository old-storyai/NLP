
import colors from 'colors/safe';

import Word from './word/word';

export class WordGroup {
    _words: (Word|WordGroup)[];
    _meanings: object = {};
    /**
     * Noun group
     * Action group
     * Preposition?
     */
    _group: string;

    constructor(words: [Word|WordGroup], group:string = 'NONE') {
        this._words = words;
        this._group = group;
    }

    /**
     * Gives a representation of the sentence, based on the words
     */
    get grammarRepresentation(): string {
        const s = this._words.map(w => w.group).join(' ');
        return ` ${s} `;
    }

    get group(): string {
        return this._group;
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
        let synth = this.grammarRepresentation;
        synth = synth.replace(new RegExp(gramex+'\\b', 'g'), match => {
            return `(${match})`;
        });

        synth = synth
            .replace(/\( /g, ' (')
            .replace(/ \)/g, ') ');

        const parts = synth.split(/\s+/);

        const matches = [];
        for (let i=0 ; i<parts.length ; i++) {
            if (/^\(/g.test(parts[i])) {
                // Beggining of a match
                matches.push([i-1]);
            }

            if (/\)$/g.test(parts[i])) {
                // End of match
                matches[matches.length-1].push(i-1);
            }
        }

        return matches as [[number, number]];
    }

    tokenize(gramexRules: object): void {
        

        let newWords = this._words.slice(0);
        for (const group of Object.keys(gramexRules)) {
            const matches = this.findGrammar(gramexRules[group]);

            for (const range of matches) {
                const words = this._words.slice(range[0], range[1]+1);
                const wg = new WordGroup(words as [Word|WordGroup], group);
                const replacement = Array(range[1]-range[0]+1).fill(null);
                replacement[0] = wg;
                newWords.splice(range[0], range[1]-range[0]+1, ...replacement);
            }
        }

        newWords = newWords.filter(w => w !== null);
        this._words = newWords;

        console.log('this.toString(): ', ''+this);
    }

    /**
     * Gives the number of words contained in this group,
     * regardless of the grouping
     */
    countWords(): number {
        let count = 0;
        for (const word of this._words) {
            if (word instanceof WordGroup)
                count += word.countWords();
            else
                count++;
        }
        return count;
    }

    toString(): string {
        let str = '';
        for (const word of this._words) {
            if (word instanceof WordGroup) {
                let colorize;
                switch (word.group) {
                case 'G_NN':
                    colorize = colors.blue;
                    break;
                case 'G_VB':
                    colorize = colors.green;
                    break;
                }

                str += '['+colorize(word.toString().trim())+']';
            } else {
                str += word.toString().trim()+' ';
            }
            str += ' ';
        }

        return str.replace(/\s+/g, ' ');
    }
}

export {Word};
