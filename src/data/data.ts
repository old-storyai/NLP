/**
 * Data Layer,
 * Handles all the JSON files
 */

import fs from 'fs';

const basePath = './data';
const filesPaths = {
    'nounGroupsMeanings': 'weights/GNN_meanings.json',
    'connectorMeanings': 'weights/connector_meanings.json',

    'lexicExtension': 'grammar/lexicExtension.json',
    'grammarGroupRules': 'grammar/wordGroupingRules.json',

    'value_modifiers':      'things/value/modifiers.json',
    'verbMeaningInference': 'things/action/meaningInference_VB2NN.json',
    'composedVerbs':        'things/action/composedVerbs.json',
    'timeComponents':       'things/time/timeComponents.json',
};

export function getData(fileId: string): any {
    const fileFullPath  = basePath + '/' + filesPaths[fileId];
    let rawContents;
    try {
        rawContents = fs.readFileSync(fileFullPath);
    } catch(e) {
        console.error('Could not find file ' + fileFullPath + '\n' + e);
        throw e;
    }

    try {
        return JSON.parse(rawContents);
    } catch(e) {
        console.error('Could not parse file ' + fileFullPath + '\n' + e);
        throw e;
    }
}
