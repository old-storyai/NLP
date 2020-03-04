
import colors from 'colors/safe';

import Word from './word/word';

export class WordGroup {
    _words: (Word|WordGroup)[];
    _group: string;

    constructor(words: [Word|WordGroup], group:string = 'NONE') {
        this._words = words;
        this._group = group;
    }

    /**
     * Gives a representation of the sentence, based on the words composing it
     */
    get grammarRepresentation(): string {
        const s = this._words.map(w => w.group).join(' ');
        return ` ${s} `;
    }

    get words(): (WordGroup|Word)[] {
        return this._words;
    }

    /**
     * Getter for the group of the word list, can be one of the following:
     *
     *  "G_VB" - a verbal group
     *  "G_NN" - a noun group
     *  "G_RB" - an adverb group
     */
    get group(): string {
        return this._group;
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

    /**
     * Gathers the words in chunks that makes sense:
     *
     *   {Pour} {me} {a good old cup} of {coffee} while {you} {'re} at {it} 
     *   ╰─┬┬─╯ ╰┬┬╯ ╰──────┬┬──────╯    ╰──┬┬──╯       ╰┬┬─╯ ╰┬┬─╯    ╰┬┬╯
     *    G_VB  G_NN       G_NN            G_NN         G_NN  G_VB     G_NN
     *
     * See the groups getter for more informations about groups
     */
    tokenize(gramexRules: object): void {
        
        let newWords = this._words.slice(0);

        for (const group of Object.keys(gramexRules)) {
            const gramex = `(${gramexRules[group].join('|')})`;
            const matches = this.findGrammar(gramex);

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
    }

    /**
     * Gives the number of words contained in this group,
     * regardless of the internal grouping
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

    append(wgs: (Word|WordGroup)[]) {
        this.words.push(...wgs);
    }

    prepend(wgs: (Word|WordGroup)[]) {
        this.words.unshift(...wgs);
    }

    toNiceString(): string {
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
                    case 'G_RB':
                        colorize = colors.yellow;
                        break;
                    default:
                        colorize = colors.gray;
                        break;
                }

                str += '['+colorize(word.toString().trim())+']';
            } else {
                str += word.toString().trim()+' ';
            }
            str += ' ';
        }

        return str.replace(/\s+/g, ' ').trim();
    }

    toString(): string {
        return this._words.map(w=>w.toString().trim()).join(' ');
    }
}

export {Word};
