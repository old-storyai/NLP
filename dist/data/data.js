"use strict";
/**
 * Data Layer,
 * Handles all the JSON files
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var pathGiver_1 = require("../pathGiver");
var filesPaths = {
    'stopWords': 'stopWords.json',
    'nounGroupsMeanings': 'weights/GNN_meanings.bal.json',
    'connectorMeanings': 'weights/connector_meanings.bal.json',
    'lexicExtension': 'grammar/lexicExtension.sp.json',
    'grammarGroupRules': 'grammar/wordGroupingRules.tp.json',
    'lemmatizerExtension': 'language/lemmatizerExtension.sp.json',
    'contextRules': 'language/context.sp.json',
    'value_modifiers': 'things/value/modifiers.tp.json',
    'verbMeaningInference': 'things/action/meaningInference_VB2NN.bal.json',
    'composedVerbs': 'things/action/composedVerbs.tp.json',
    'timeComponents': 'things/time/timeComponents.sp.json',
    'idiomsReplacements': 'idiomsReplacements.sp.json',
};
function getData(fileId) {
    var fileFullPath = path_1.default.join(pathGiver_1.BASEPATH, 'data/', filesPaths[fileId]);
    var rawContents;
    try {
        rawContents = fs_1.default.readFileSync(fileFullPath);
    }
    catch (e) {
        console.error('Could not find file ' + fileFullPath + '\n' + e);
        throw e;
    }
    try {
        return JSON.parse(rawContents);
    }
    catch (e) {
        console.error('Could not parse file ' + fileFullPath + '\n' + e);
        throw e;
    }
}
exports.getData = getData;
//# sourceMappingURL=data.js.map