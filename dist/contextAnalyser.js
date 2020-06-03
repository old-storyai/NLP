"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Data = __importStar(require("./data/data"));
var stringParser_1 = __importDefault(require("./data/stringParser"));
var tokenizer_1 = require("./grammar/tokenizer");
var Info = /** @class */ (function () {
    function Info(start0, end0, text0, category0) {
        this.start = start0;
        this.end = end0;
        this.text = text0;
        this.category = category0;
    }
    Info.prototype.toJSON = function () {
        return {
            datatype: 'info',
            data: {
                start: this.start,
                end: this.end,
                text: this.text,
                category: this.category
            }
        };
    };
    Info.prototype.toString = function () {
        return this.category + " - " + this.text;
    };
    return Info;
}());
var Filter = /** @class */ (function () {
    function Filter(filterType0, filterBy0, filterByIdx0, data0, dataIdx0) {
        this.filterType = filterType0;
        this.filterBy = filterBy0;
        this.filterByIdx = filterByIdx0;
        this.data = data0;
        this.dataIdx = dataIdx0;
    }
    Filter.prototype.toJSON = function () {
        return {
            datatype: 'filter',
            data: {
                filterType: this.filterType,
                filterBy: this.filterBy,
                filterByIdx: this.filterByIdx,
                data: this.data,
                dataIdx: this.dataIdx
            }
        };
    };
    Filter.prototype.toString = function () {
        return this.filterType + " " + this.data + " BY " + this.filterBy;
    };
    return Filter;
}());
var SentenceType;
(function (SentenceType) {
    SentenceType[SentenceType["question"] = 0] = "question";
    SentenceType[SentenceType["order"] = 1] = "order";
    SentenceType[SentenceType["description"] = 2] = "description";
    SentenceType[SentenceType["condition"] = 3] = "condition";
})(SentenceType || (SentenceType = {}));
var SentenceMeta = /** @class */ (function () {
    function SentenceMeta(type0) {
        this.type = type0;
    }
    SentenceMeta.prototype.toJSON = function () {
        return {
            datatype: 'sentencemeta',
            data: {
                type: this.type
            }
        };
    };
    SentenceMeta.prototype.toString = function () {
        return "Sentence type: " + this.type;
    };
    return SentenceMeta;
}());
var ContextAnalyser = /** @class */ (function () {
    function ContextAnalyser(sent) {
        this._sentence = sent;
        this._groups = [];
    }
    ContextAnalyser.prototype.handleInfo = function (match, index, category, weight) {
        var length = String(match).split(/\s+/).length;
        this._groups.push(new Info(index, index + length - 1, match, category));
        return '';
    };
    ContextAnalyser.prototype.handleSentenceType = function (sentence_type) {
        this._groups.push(new SentenceMeta(sentence_type));
        return '';
    };
    ContextAnalyser.prototype.handleFilter = function (filterType, filterBy, filterByIdx, filtered, filteredIdx) {
        this._groups.push(new Filter(filterType, filterBy, filterByIdx, filtered, filteredIdx));
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
            'meaning-element': this.handleInfo.bind(this),
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