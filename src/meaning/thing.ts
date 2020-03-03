import colors from 'colors';

import {WordGroup, Word} from './grammar/tokenizer'

export default class Thing {

    _wordGroup: WordGroup;

    constructor(wg: WordGroup) {
        this._wordGroup = wg;
    }

    toString() {
        let out = '';

        const ALL_COLORS = [ 'blue', 'green', 'magenta', 'red', 'yellow' ];

        for (const prop of Object.keys(this)) {
            if (prop === '_wordGroup') continue;
            if (Array.isArray(this[prop]) && !this[prop].length) continue;

            const choosenColor = ALL_COLORS[(Math.random()*ALL_COLORS.length)<<0];

            out += `${prop.replace(/^_+/, '').replace(/^\w/, c=>c.toUpperCase())}:` +
                `\t${colors[choosenColor](this[prop].toString().replace(/\n/g, '\n\t'))}\n`;
        }

        return out;
    }
}
