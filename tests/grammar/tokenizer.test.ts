const {Tokenizer, Word, WordGroup} = require('grammar/tokenizer');

Tokenizer.getData = jest.fn().mockImplementation(docName => {
    return {
        'grammarGroupRules': {
            'G_NN': [
                ' DT JJ NN'
            ],
            'G_VB': [
                '(VB[NPDZ]?)+'
            ]
        }
    }[docName];

});

describe('Tokenizer class', () => {

    it('wordPerWord()', () => {
        const expectedOutput = new WordGroup([
            new Word('I', 'PRP'),
            new Word('\'m', 'VB'),
            new Word('singing', 'VBG'),
            new Word('in', 'IN'),
            new Word('the', 'DT'),
            new Word('rain', 'NN'),
            new Word('!', '.')
        ]);

        expect(
            Tokenizer.wordPerWord('I\'m singing in the rain!')
        ).toStrictEqual(expectedOutput);
    });
});
