import Replacer from 'replacer/replacer';

describe('Replacer class', () => {
    const settings = {
        '\\d+': 'VB',
        'turns': 'VBZ',
        'turned': 'VBD',
        'close': 'VB',
        'closes': 'VBZ',
    };
    function itReplaces(testName: string, settings: {[tag: string]: string}, input: string, expectedOutput: string) {
    }
});

function buildReplacerSettings(rawIn: TemplateStringsArray) {
}
