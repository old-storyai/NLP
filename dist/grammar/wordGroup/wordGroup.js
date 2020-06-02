"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WordGroup = exports.Word = void 0;
var safe_1 = __importDefault(require("colors/safe"));
var word_1 = __importDefault(require("./word/word"));
exports.Word = word_1.default;
var WordGroup = /** @class */ (function () {
    function WordGroup(words, tag) {
        if (tag === void 0) { tag = 'NONE'; }
        this._words = words;
        this._tag = tag;
    }
    Object.defineProperty(WordGroup.prototype, "grammarRepresentation", {
        /**
         * Gives a representation of the sentence, based on the words composing it
         */
        get: function () {
            var s = this._words.map(function (w) { return w.tag; }).join(' ');
            return " " + s + " ";
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WordGroup.prototype, "words", {
        get: function () {
            return this._words;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(WordGroup.prototype, "tag", {
        /**
         * Getter for the tag of the word list, can be one of the following:
         *
         *  "G_VB" - a verbal group
         *  "G_NN" - a noun group
         *  "G_RB" - an adverb group
         */
        get: function () {
            return this._tag;
        },
        enumerable: false,
        configurable: true
    });
    WordGroup.prototype.getSimplifiedTag = function () {
        return this.tag.replace('G_', '');
    };
    /**
     * Allows to look for specific grammar formation in a word group
     *
     * For the sentence "The big dog and the cat are swimming", and the gramex /DT( JJ)? NN/
     * The result will be:
     * [
     *   [0, 2], // The big dog
     *   [4, 5]  // the cat
     * ]
     */
    WordGroup.prototype.findGrammar = function (gramex) {
        var synth = this.grammarRepresentation;
        synth = synth.replace(new RegExp(gramex + '\\b', 'g'), function (match) {
            return "(" + match + ")";
        });
        synth = synth
            .replace(/\( /g, ' (')
            .replace(/ \)/g, ') ');
        var parts = synth.split(/\s+/);
        var matches = [];
        for (var i = 0; i < parts.length; i++) {
            if (/^\(/g.test(parts[i])) {
                // Beggining of a match
                matches.push([i - 1]);
            }
            if (/\)$/g.test(parts[i])) {
                // End of match
                matches[matches.length - 1].push(i - 1);
            }
        }
        return matches;
    };
    /**
     * Gathers the words in chunks that makes sense:
     *
     *   {Pour} {me} {a good old cup} of {coffee} while {you} {'re} at {it}
     *   ╰─┬┬─╯ ╰┬┬╯ ╰──────┬┬──────╯    ╰──┬┬──╯       ╰┬┬─╯ ╰┬┬─╯    ╰┬┬╯
     *    G_VB  G_NN       G_NN            G_NN         G_NN  G_VB     G_NN
     *
     * See the groups getter for more informations about groups
     */
    WordGroup.prototype.tokenize = function (gramexRules) {
        var newWords = this._words.slice(0);
        for (var _i = 0, _a = Object.keys(gramexRules); _i < _a.length; _i++) {
            var tag = _a[_i];
            var gramex = "(" + gramexRules[tag].join('|') + ")";
            var matches = this.findGrammar(gramex);
            for (var _b = 0, matches_1 = matches; _b < matches_1.length; _b++) {
                var range = matches_1[_b];
                var words = this._words.slice(range[0], range[1] + 1);
                var wg = new WordGroup(words, tag);
                var replacement = Array(range[1] - range[0] + 1).fill(null);
                replacement[0] = wg;
                newWords.splice.apply(newWords, __spreadArrays([range[0], range[1] - range[0] + 1], replacement));
            }
        }
        newWords = newWords.filter(function (w) { return w !== null; });
        this._words = newWords;
        return this;
    };
    /**
     * Gives the number of words contained in this group,
     * regardless of the internal grouping
     */
    WordGroup.prototype.countWords = function () {
        var count = 0;
        for (var _i = 0, _a = this._words; _i < _a.length; _i++) {
            var word = _a[_i];
            if (word instanceof WordGroup)
                count += word.countWords();
            else
                count++;
        }
        return count;
    };
    WordGroup.prototype.append = function (wgs) {
        var _a;
        (_a = this.words).push.apply(_a, wgs);
    };
    WordGroup.prototype.prepend = function (wgs) {
        var _a;
        (_a = this.words).unshift.apply(_a, wgs);
    };
    WordGroup.prototype.isGroup = function () {
        return true;
    };
    WordGroup.prototype.isVerb = function () {
        return this.tag === 'G_VB';
    };
    WordGroup.prototype.isNoun = function () {
        return this.tag === 'G_NN';
    };
    WordGroup.prototype.toNiceString = function () {
        var str = '';
        for (var _i = 0, _a = this._words; _i < _a.length; _i++) {
            var word = _a[_i];
            if (word instanceof WordGroup) {
                var colorize = void 0;
                switch (word.tag) {
                    case 'G_NN':
                        colorize = safe_1.default.blue;
                        break;
                    case 'G_VB':
                        colorize = safe_1.default.green;
                        break;
                    case 'G_RB':
                        colorize = safe_1.default.yellow;
                        break;
                    default:
                        colorize = safe_1.default.gray;
                        break;
                }
                str += '[' + colorize(word.toString().trim()) + ']';
            }
            else {
                str += word.toString().trim() + ' ';
            }
            str += ' ';
        }
        return str.replace(/\s+/g, ' ').trim();
    };
    WordGroup.prototype.toString = function () {
        return this._words.map(function (w) { return w.toString().trim(); }).join(' ');
    };
    return WordGroup;
}());
exports.WordGroup = WordGroup;
//# sourceMappingURL=wordGroup.js.map