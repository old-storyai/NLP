
const Word = require('grammar/wordGroup/word/word').default;

describe('Word class', () => {

    it('should assign local variables when constructed', () => {
        const testStr = 'Hi there';
        const testTag = 'NN';

        const w = new Word(testStr, testTag);

        expect(w._str).toBe(testStr);
        expect(w._tag).toBe(testTag);

        expect(w.str).toBe(testStr);
        expect(w.tag).toBe(testTag);
    });

    describe('Genre detection', () => {

        describe('is...() functions', () => {
            const w = new Word('Hi there', 'VB');

            const validTags = {
                'isVerb': ['VB', 'VBZ'],
                'isPunctuation': ['.', ',', '?', '!', ';', ':'],
                'isDeterminer': ['DT', 'PDT'],
                'isAdjective': ['JJ', 'JJR', 'JJS'],
                'isAdverb': ['RB', 'RBR', 'RBS'],
                'isNoun': ['NN', 'NNS', 'NNP', 'NNPS'],
            };

            for (const func of Object.keys(validTags)) {
                for (const tag of validTags[func]) {
                    it(`${func}: ${tag}`, () => {
                        w.tag = tag;
                        expect(w[func]()).toBe(true);
                    });
                }
            }
        });

        it('is() function', () => {
            const testStr = 'Hi there';
            const testTag = 'NN';

            const w = new Word(testStr, testTag);

            expect(w.is(testTag)).toBe(true);
            expect(w.is('other')).toBe(false);
        });
    });
});
