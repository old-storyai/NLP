"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const thing_1 = __importDefault(require("./thing/thing"));
var Tense;
(function (Tense) {
    Tense["past"] = "past";
    Tense["present"] = "present";
    Tense["future"] = "future";
})(Tense || (Tense = {}));
class Action extends thing_1.default {
    processWords() {
        this.findTense();
        for (let word of this._wordGroup._words) {
            word = word;
            if (word.isVerb()) {
                this._verb = word.toString();
            }
        }
    }
    findTense() {
        const mainWord = this._wordGroup.words[0].toString();
        if (mainWord.slice(-1) === 'ed') {
            this._tense = Tense.past;
            return;
        }
        if (/will/gi.test(this._wordGroup.toString())) {
            this._tense = Tense.future;
            return;
        }
    }
}
exports.default = Action;
//# sourceMappingURL=action.js.map