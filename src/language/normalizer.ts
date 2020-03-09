import {lemmatizer} from 'lemmatizer';
import * as Data from 'data/data';


export function lemmatize(str: string): string {
    return lemmatizer(str);
}

export function replaceIdioms(str: string): string {
    const idioms = Data.getData('idiomsReplacements');

    for (const idiom of Object.keys(idioms)) {
        const replacement = idioms[idiom];
        str = str.replace(new RegExp(idiom, 'gi'), replacement);
    }

    return str;
}
