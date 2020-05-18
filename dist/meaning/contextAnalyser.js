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
var Data = __importStar(require("data/data"));
var stringParser_1 = __importDefault(require("data/stringParser"));
var tokenizer_1 = require("../grammar/tokenizer");
var ContextAnalyser = /** @class */ (function () {
    function ContextAnalyser(sent) {
        this._sentence = sent;
        this._groups = [];
    }
    ContextAnalyser.prototype.handleThing = function (match, index, category, weight) {
        var length = String(match).split(/\s+/).length;
        this._groups.push({
            start: index,
            end: index + length - 1,
            category: category,
            text: match
        });
        return '';
    };
    ContextAnalyser.prototype.handleSentenceType = function (sentence_type) {
        return '';
    };
    ContextAnalyser.prototype.handleFilter = function (filterType, filterBy, filterByIdx, filtered, filteredIdx) {
        this._groups.push({
            filterType: filterType,
            filterBy: filterBy,
            filterByIdx: filterByIdx,
            data: filtered,
            dataIdx: filteredIdx
        });
        return '';
    };
    ContextAnalyser.prototype.handleReference = function (category, many, genre) {
        var str = 'Ref => ' + category;
        if (many !== undefined)
            str += ' ' + (many ? 'multi' : 'solo');
        if (genre !== undefined)
            str += ' ' + (genre ? 'F' : 'M');
        return '';
    };
    ContextAnalyser.prototype.analyse = function () {
        var _a = Data.getData('contextRules'), definitions = _a.definitions, matches = _a.matches;
        var tokens = tokenizer_1.Tokenizer.wordPerWord(this._sentence);
        var sentence = [];
        var parallelSet = [];
        tokens.words.forEach(function (word) {
            word.toString().trim().split(/\s/).forEach(function (rawWord) {
                sentence.push(rawWord);
                parallelSet.push(word.getSimplifiedTag());
            });
        });
        new stringParser_1.default(matches, definitions)
            .parseString(sentence.join(' '), function (match, replacement) {
        }, function () { }, {
            'meaning-element': this.handleThing.bind(this),
            'sentence-type': this.handleSentenceType.bind(this),
            'reference': this.handleReference.bind(this),
            'filter': this.handleFilter.bind(this)
        }, true, parallelSet);
        return {
            groups: this._groups
        };
    };
    return ContextAnalyser;
}());
exports.default = ContextAnalyser;
//# sourceMappingURL=contextAnalyser.js.map