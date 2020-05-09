"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const thing_1 = __importDefault(require("./thing/thing"));
class Person extends thing_1.default {
    processWords() {
        if (/^(me|I)$/i.test(this._wordGroup.toString())) {
            this._personTitle = 'SELF';
            return;
        }
        this._personTitle = '';
        for (let word of this._wordGroup._words) {
            word = word;
            if (word.isAdjective()) {
                this._modifiers.push(word.toString());
            }
            else {
                this._personTitle += ' ' + word.toString();
            }
        }
        this._personTitle.trim();
    }
}
exports.default = Person;
//# sourceMappingURL=person.js.map