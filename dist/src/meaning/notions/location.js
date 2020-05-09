"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const thing_1 = __importDefault(require("./thing/thing"));
class Location extends thing_1.default {
    processWords() {
        this._placeTitle = '';
        for (let w of this._wordGroup._words) {
            w = w;
            if (!w.isDeterminer()) {
                this._placeTitle += ' ' + w.toString();
            }
        }
        this._wordGroup.toString();
    }
}
exports.default = Location;
//# sourceMappingURL=location.js.map