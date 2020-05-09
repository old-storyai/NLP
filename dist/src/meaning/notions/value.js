"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Data = __importStar(require("data/data"));
const thing_1 = __importDefault(require("./thing/thing"));
/**
 * call me as soon as the sun rises
 *         '---.----' '-----.-----'
 *          modifier     addition
 */
class Value extends thing_1.default {
    processWords() {
        if (this._conns.length) {
            const modifiers = Data.getData('value_modifiers');
            const blob = this._conns.map(sep => sep.toString()).join(' ');
            for (const modifier of Object.keys(modifiers)) {
                const matchingWords = modifiers[modifier];
                for (const matchingWord of matchingWords) {
                    if (new RegExp(matchingWord).test(blob))
                        this._modifier = modifier;
                }
            }
        }
        console.log('var: ', this._wordGroup.toString());
        let matches = this._wordGroup.toString().match(/[\d.,]+/);
        if (matches.length)
            this._amount = Number.parseInt(matches[0]);
        matches = this._wordGroup.toString().match(/[\d.,]+([\w\s]+)|([\w]+)\s*$/);
        console.log('matches: ', matches);
        if (matches.length > 1)
            this._unit = matches[1].trim();
    }
}
exports.default = Value;
//# sourceMappingURL=value.js.map