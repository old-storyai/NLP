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
 * all the times category:
 *
 *   - range (from september 4th to february 2nd)
 *
 *   - from / until
 *
 *   - simple date
 *
 *   - repetition (every day at 5AM)
 *
 *       - repetition + range: (the first monday of each month for 2 year)
 *
 *   each: repetiton
 *   for: range
 *
 *   X of each Y: X is a precision of the repetition
 *
 *
 *   {
 *     repetiton: {
 *       nature: {
 *         weekDay: 0 => On monday
 *       },
 *       delta: {
 *         month: 1 => every 1 month
 *       }
 *     },
 *     range: [
 *       now(),
 *       now() + 2 years
 *     ]
 *   }
 */
class Time extends thing_1.default {
    processWords() {
        this.findDate();
    }
    findDate() {
        const components = Data.getData('timeComponents');
        for (const component of Object.keys(components)) {
            const possibleMatches = components[component];
            for (const possibleMatch of Object.keys(possibleMatches)) {
                const result = possibleMatches[possibleMatch];
                let match = '';
                if (/\$\d/.test(result)) {
                    match = this._wordGroup.toString().replace(new RegExp('^.*' + possibleMatch + '.*$', 'gi'), result);
                    if (match === this._wordGroup.toString())
                        match = '';
                }
                else {
                    const tmp = this._wordGroup.toString().match(new RegExp(possibleMatch, 'gi'));
                    if (tmp !== null && tmp.length > 0)
                        match = result;
                }
                if (!!match) {
                    switch (component) {
                        case 'weekDay':
                            this._weekDay = Number(match);
                            break;
                        case 'day':
                            this._day = Number(match);
                            break;
                        case 'month':
                            this._month = Number(match);
                            break;
                        case 'year':
                            this._year = Number(match);
                            break;
                    }
                    break;
                }
            }
        }
    }
}
exports.default = Time;
//# sourceMappingURL=time.js.map