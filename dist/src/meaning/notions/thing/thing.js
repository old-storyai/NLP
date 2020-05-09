"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const colors_1 = __importDefault(require("colors"));
class Thing {
    constructor(wg, prevConns) {
        this._wordGroup = wg;
        this._conns = prevConns;
        this.processWords();
    }
    addWords(wg, prevWord = []) {
        this._wordGroup.append(prevWord);
        this._wordGroup.append(wg._words);
        this.processWords();
    }
    processWords() { }
    toString() {
        let out = '';
        const ALL_COLORS = ['blue', 'green', 'magenta', 'red', 'yellow'];
        for (const prop of Object.keys(this)) {
            // if (prop === '_wordGroup') continue;
            if (this[prop] instanceof Object && !Object.keys(this[prop]).length)
                continue;
            const choosenColor = ALL_COLORS[(Math.random() * ALL_COLORS.length) << 0];
            out += `${prop.replace(/^_+/, '').replace(/^\w/, c => c.toUpperCase())}:` +
                `\t${colors_1.default[choosenColor](this[prop].toString().replace(/\n/g, '\n\t'))}\n`;
        }
        return out;
    }
}
exports.default = Thing;
//# sourceMappingURL=thing.js.map