import {lemmatizer} from 'lemmatizer';
import * as Data from 'data/data';

export function disconjugateVerb(str: string): string {

    const lemmatiserExtension = Data.getData('lemmatizerExtension');

    // Placing placeholders for the extension words
    const replacements = [];
    for (const match of Object.keys(lemmatiserExtension)) {
        const replacement = lemmatiserExtension[match];
        const regex = new RegExp(match, 'gi');

        const matches = str.match(regex);
        let idx = 0;
        if (!!matches) {
            let m = matches[0];
            m = m.replace(regex, replacement);

            replacements[idx] = m;
            str = str.replace(new RegExp(match, 'gi'), `{${idx++}}`);
        }
    }

    // Lemmatize words that are not taken care of by our extension
    const out = [];
    for (const word of str.split(/\s+/)) {
        out.push( lemmatizer(word.toLowerCase()) );
    }
    str = out.join(' ');

    // Replacing the placeholders by their replacements
    str = str.replace(/{\d+}/, placeholder => {
        const num = placeholder.match(/\d+/)[0];

        // lemmatizing words inside the replacement if it's necessary
        return replacements[num].replace(/{:\w+:}/g, toLemmatize => {
            const word = toLemmatize.match(/\w+/)[0];
            return lemmatizer(word);
        });
    });

    return str;
}

export function replaceIdioms(str: string): string {
    const idioms = Data.getData('idiomsReplacements');

    for (const idiom of Object.keys(idioms)) {
        const replacement = idioms[idiom];
        str = str.replace(new RegExp(idiom, 'gi'), replacement);
    }

    return str;
}
