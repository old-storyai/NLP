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
    }
    ContextAnalyser.prototype.handleThing = function (match, index, category, weight) {
        console.log(category, '=>', match, "(" + index + ")");
        var length = String(match).split(/\s+/).length;
        return '';
    };
    ContextAnalyser.prototype.handleSentenceType = function (sentence_type) {
        console.log('type = ', sentence_type);
        return '';
    };
    ContextAnalyser.prototype.handleFilter = function (filterName, filterType) {
        console.log('filter => ', filterType, filterName);
        return '';
    };
    ContextAnalyser.prototype.handleReference = function (category, many, genre) {
        var str = 'Ref => ' + category;
        if (many !== undefined)
            str += ' ' + (many ? 'multi' : 'solo');
        if (genre !== undefined)
            str += ' ' + (genre ? 'F' : 'M');
        console.log(str);
        return '';
    };
    ContextAnalyser.prototype.createGroups = function () {
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
        console.log(sentence);
        console.log(parallelSet);
        new stringParser_1.default(matches, definitions)
            .parseString(sentence.join(' '), function (match, replacement) {
        }, function () { }, {
            'meaning-element': this.handleThing,
            'sentence-type': this.handleSentenceType,
            'reference': this.handleReference,
            'filter': this.handleFilter
        }, true, parallelSet);
    };
    return ContextAnalyser;
}());
exports.default = ContextAnalyser;
//# sourceMappingURL=contextAnalyser.js.map