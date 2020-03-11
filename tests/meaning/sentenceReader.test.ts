import SentenceReader from 'meaning/sentenceReader';
import {Word, WordGroup} from 'grammar/wordGroup/wordGroup';

it('pass', () => { expect(true).toBeTruthy(); });

function wordgrp(rawIn: TemplateStringsArray): WordGroup {
    if (rawIn.length > 1) throw new Error('don\'t know how to interpolate');

    return new WordGroup(
        rawIn[0]
            .trim()
            .split(/\s*[\r\n|]+\s*/)
            .map(line => {
                const [str, tag] = line.split(':');
                return new Word(str.trim(), tag.trim());
            })
    );
}
