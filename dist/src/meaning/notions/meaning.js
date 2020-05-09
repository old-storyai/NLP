"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const time_1 = __importDefault(require("./time"));
exports.Time = time_1.default;
const person_1 = __importDefault(require("./person"));
exports.Person = person_1.default;
const location_1 = __importDefault(require("./location"));
exports.Location = location_1.default;
const value_1 = __importDefault(require("./value"));
exports.Value = value_1.default;
const item_1 = __importDefault(require("./item"));
exports.Item = item_1.default;
const action_1 = __importDefault(require("./action"));
exports.Action = action_1.default;
class Meaning {
    toString() {
        let out = '';
        for (const prop of Object.keys(this)) {
            out += `${prop.replace(/^_+/, '').replace(/^\w/, c => c.toUpperCase())}:\n` +
                `\t${this[prop].toString().replace(/\n/g, '\n\t')}\n`;
        }
        return out;
    }
}
exports.Meaning = Meaning;
//# sourceMappingURL=meaning.js.map