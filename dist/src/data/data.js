"use strict";
/**
 * Data Layer,
 * Handles all the JSON files
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const basePath = './data';
const filesPaths = {
    'nounGroupsMeanings': 'weights/GNN_meanings.json',
    'connectorMeanings': 'weights/connector_meanings.json',
    'lexicExtension': 'grammar/lexicExtension.json',
    'grammarGroupRules': 'grammar/wordGroupingRules.json',
    'value_modifiers': 'things/value/modifiers.json',
    'verbMeaningInference': 'things/action/meaningInference_VB2NN.json',
    'timeComponents': 'things/time/timeComponents.json'
};
function getData(fileId) {
    const fileFullPath = basePath + '/' + filesPaths[fileId];
    let rawContents;
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