import {lemmatizer} from 'lemmatizer';
import * as Data from 'data/data';

import StringParser from 'data/stringParser';

export function disconjugateVerb(str: string): string {

    let out = '';

    const lemmatizeWordPerWord = raw => {
        return raw
            .split(/\s+/)
            .map(word => lemmatizer(word.toLowerCase()))
            .join(' ');
    };

    const lemmatiserExtension = Data.getData('lemmatizerExtension');
    new StringParser(lemmatiserExtension)
        .parseString(
            str,
            (match, lemmatized) => {
                out += ' ' + lemmatized;
            },
            unmatch => {
                out += ' ' + lemmatizeWordPerWord(unmatch);
            },
            [
                arg => lemmatizeWordPerWord(arg)
            ],
            false
        );

    return out.trim();
}

export function replaceIdioms(str: string): string {
    const idioms = Data.getData('idiomsReplacements');

    for (const idiom of Object.keys(idioms)) {
        const replacement = idioms[idiom];
        str = str.replace(new RegExp(idiom, 'gi'), replacement);
    }

    return str;
}
