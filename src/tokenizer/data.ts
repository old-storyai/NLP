/**
 * Data Layer,
 * Handles all the JSON files
 */

import fs from 'fs';

const basePath = './data'
const filesPaths = {
    'sentenceChunkWeights': 'weights/chunks.json',

    'lexicExtension': 'lexicExtension.json',
    'grammarGroupRules': 'wordGroupingRules.json'
}

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
