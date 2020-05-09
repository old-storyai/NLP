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