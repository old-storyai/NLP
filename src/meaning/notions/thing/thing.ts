import colors from 'colors';

import {WordGroup, Word} from 'grammar/tokenizer';

export default class Thing {

    _wordGroup: WordGroup;
    _conns: Word[];

    constructor(wg: WordGroup, prevConns: Word[]) {
        this._wordGroup = wg;
        this._conns = prevConns;

        this.processWords();
    }


    addWords(w: WordGroup|Word, prevWord: Word[] = []) {
        this._wordGroup.append(prevWord);
        if (w instanceof Word)
            this._wordGroup.append([w]);
        else
            this._wordGroup.append(w._words);

        this.processWords();
    }

    protected processWords() {}

    toString() {
        let out = '';

        const ALL_COLORS = [ 'blue', 'green', 'magenta', 'red', 'yellow' ];

        for (const prop of Object.keys(this)) {
            if (prop === '_wordGroup') continue;
            if (this[prop] instanceof Object && !Object.keys(this[prop]).length) continue;

            const choosenColor = ALL_COLORS[(Math.random()*ALL_COLORS.length)<<0];

            out += `${colors.reset(prop.replace(/^_+/, '').replace(/^\w/, c=>c.toUpperCase()))}:` +
                `\t${colors[choosenColor](this[prop].toString().replace(/\n/g, '\n\t'))}\n`;
        }

        return out;
    }
}
