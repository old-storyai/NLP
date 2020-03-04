
const Word = require('grammar/wordGroup/word/word').default;

describe('Word class', () => {

    it('should assign local variables when constructed', () => {
        const testStr = 'Hi there';
        const testGrp = 'NN';

        const w = new Word(testStr, testGrp);

        expect(w._str).toBe(testStr);
        expect(w._group).toBe(testGrp);

        expect(w.str).toBe(testStr);
        expect(w.group).toBe(testGrp);
    });

    describe('Genre detection', () => {

        it('is...() functions', () => {
            const w = new Word('Hi there', 'VB');

            const validGroups = {
                'isVerb': ['VB', 'VBZ'],
                'isPunctuation': ['.', ',', '?', '!', ';', ':'],
                'isDeterminer': ['DT', 'PDT', 'WDT'],
                'isAdjective': ['JJ', 'JJR', 'JJS'],
                'isAdverb': ['RB', 'RBR', 'RBS'],
                'isNoun': ['NN', 'NNS', 'NNP', 'NNPS'],
            };

            for (const func of Object.keys(validGroups)) {
                for (const group of validGroups[func]) {
                    w.group = group;
                    expect(w[func]()).toBe(true);
                }
            }
        });

        it('is() function', () => {
            const testStr = 'Hi there';
            const testGrp = 'NN';

            const w = new Word(testStr, testGrp);

            expect(w.is(testGrp)).toBe(true);
            expect(w.is('other')).toBe(false);
        });
    });
});
