"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const thing_1 = __importDefault(require("./thing/thing"));
class Item extends thing_1.default {
    processWords() {
        this._modifiers = [];
        this._name = '';
        for (let word of this._wordGroup._words) {
            word = word;
            if (word.isAdjective())
                this._modifiers.push(word.toString());
            if (word.isNoun() || word.is('PRP'))
                this._name += ' ' + word.toString();
        }
        this._name = this._name.trim();
    }
}
exports.default = Item;
//# sourceMappingURL=item.js.map