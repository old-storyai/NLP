"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var sentenceAnalyser_1 = __importDefault(require("./meaning/sentenceAnalyser"));
exports.SentenceAnalyser = sentenceAnalyser_1.default;
var Normalizer = __importStar(require("./language/normalizer"));
exports.Normalizer = Normalizer;
var contextAnalyser_1 = __importDefault(require("./meaning/contextAnalyser"));
exports.ContextAnalyser = contextAnalyser_1.default;
//# sourceMappingURL=index.js.map