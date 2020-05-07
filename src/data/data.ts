/**
 * Data Layer,
 * Handles all the JSON files
 */

import fs from 'fs';
import path from 'path';
import {BASEPATH} from '../pathGiver';

const filesPaths = {
    'stopWords': 'stopWords.json',


    'nounGroupsMeanings': 'weights/GNN_meanings.bal.json',
    'connectorMeanings':  'weights/connector_meanings.bal.json',

    'lexicExtension':      'grammar/lexicExtension.sp.json',
    'grammarGroupRules':   'grammar/wordGroupingRules.tp.json',
    'lemmatizerExtension': 'language/lemmatizerExtension.sp.json',
    'contextRules':        'language/context.sp.json',

    'value_modifiers':      'things/value/modifiers.tp.json',
    'verbMeaningInference': 'things/action/meaningInference_VB2NN.bal.json',
    'composedVerbs':        'things/action/composedVerbs.tp.json',
    'timeComponents':       'things/time/timeComponents.sp.json',
    'idiomsReplacements':   'idiomsReplacements.sp.json',
};

export function getData(fileId: string): any {
    const fileFullPath  = path.join(BASEPATH , 'data/', filesPaths[fileId]);
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
