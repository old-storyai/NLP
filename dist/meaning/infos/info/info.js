"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var colors_1 = __importDefault(require("colors"));
var tokenizer_1 = require("../../../grammar/tokenizer");
var Info = /** @class */ (function () {
    function Info(wg, prevConns) {
        this._wordGroup = wg;
        this._conns = prevConns;
        this.processWords();
    }
    Info.prototype.addWords = function (w, prevWord) {
        if (prevWord === void 0) { prevWord = []; }
        this._wordGroup.append(prevWord);
        if (w instanceof tokenizer_1.Word)
            this._wordGroup.append([w]);
        else
            this._wordGroup.append(w._words);
        this.processWords();
    };
    Info.prototype.processWords = function () { };
    Info.prototype.toString = function () {
        var out = '';
        var ALL_COLORS = ['blue', 'green', 'magenta', 'red', 'yellow'];
        for (var _i = 0, _a = Object.keys(this); _i < _a.length; _i++) {
            var prop = _a[_i];
            // if (prop === '_wordGroup') continue;
            if (this[prop] instanceof Object && !Object.keys(this[prop]).length)
                continue;
            var choosenColor = ALL_COLORS[(Math.random() * ALL_COLORS.length) << 0];
            out += colors_1.default.reset(prop.replace(/^_+/, '').replace(/^\w/, function (c) { return c.toUpperCase(); })) + ":" +
                ("\t" + colors_1.default[choosenColor](this[prop].toString().replace(/\n/g, '\n\t')) + "\n");
        }
        return out;
    };
    return Info;
}());
exports.default = Info;
//# sourceMappingURL=info.js.map