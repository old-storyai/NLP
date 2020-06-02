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
exports.identifyImportantWords = exports.replaceIdioms = exports.disconjugateVerb = void 0;
var lemmatizer_1 = require("lemmatizer");
var Data = __importStar(require("../data/data"));
var stringParser_1 = __importDefault(require("../data/stringParser"));
function disconjugateVerb(str) {
    var out = '';
    var lemmatizeWordPerWord = function (raw) {
        return raw
            .split(/\s+/)
            .map(function (word) { return lemmatizer_1.lemmatizer(word.toLowerCase()); })
            .join(' ');
    };
    var lemmatiserExtension = Data.getData('lemmatizerExtension');
    new stringParser_1.default(lemmatiserExtension)
        .parseString(str, function (match, lemmatized) {
        out += ' ' + lemmatized;
    }, function (unmatch) {
        out += ' ' + lemmatizeWordPerWord(unmatch);
    }, [
        function (arg) { return lemmatizeWordPerWord(arg); }
    ], false);
    return out.trim();
}
exports.disconjugateVerb = disconjugateVerb;
function replaceIdioms(str) {
    var idioms = Data.getData('idiomsReplacements');
    for (var _i = 0, _a = Object.keys(idioms); _i < _a.length; _i++) {
        var idiom = _a[_i];
        var replacement = idioms[idiom];
        str = str.replace(new RegExp(idiom, 'gi'), replacement);
    }
    return str;
}
exports.replaceIdioms = replaceIdioms;
function identifyImportantWords(str) {
    var stopWords = Data.getData('stopWords');
    var regex = stopWords.map(function (word) { return "\\b" + word + "\\b"; }).join('|');
    var res = str
        .replace(/[^a-zA-Z_-]+/g, ' ')
        .replace(new RegExp(regex, 'gi'), ' ')
        .trim()
        .split(/\s+/)
        .map(function (word) { return lemmatizer_1.lemmatizer(word); });
    return res;
}
exports.identifyImportantWords = identifyImportantWords;
//# sourceMappingURL=normalizer.js.map