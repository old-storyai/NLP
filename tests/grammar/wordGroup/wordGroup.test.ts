const {Word, WordGroup} = require('grammar/wordGroup/wordGroup');

const sampleSentence = [
    new Word('It', 'PRP'),
    new Word('\'s', 'VB'),
    new Word('too', 'RB'),
    new Word('hot', 'JJ'),
    new Word('in', 'IN'),
    new Word('there', 'RB'),
    new Word('!', '!'),
];

const gramexRules = {
    'G_1': [
        ' JJ( IN)? RB'
    ],
    'G_2': [
        '( PRP)* VB'
    ]
};


describe('WordGroup class', () => {

    it('should assign local variables when constructed', () => {
        const wg = new WordGroup(sampleSentence, 'G_GG');

        expect(wg.group).toBe('G_GG');
        expect(wg.words).toBe(sampleSentence);
    });


    describe('Grammar representation', () => {
        it('should give a proper grammar representation - Without subgroups', () => {
            const wg = new WordGroup(sampleSentence);

            expect(wg.grammarRepresentation.trim()).toBe('PRP VB RB JJ IN RB !');
        });

        it('should give a proper grammar representation - With subgroups', () => {
            const wg = new WordGroup([
                new WordGroup(sampleSentence, 'G_TEST'),
                ...sampleSentence
            ]);

            expect(wg.grammarRepresentation.trim()).toBe('G_TEST PRP VB RB JJ IN RB !');
        });
    });

    describe('Gramex', () => {
        it('should find a given simple gramex', () => {
            const wg = new WordGroup(sampleSentence);

            expect(wg.findGrammar(' PRP VB RB')).toStrictEqual([[0,2]]);
        });

        it('should find a given complex gramex', () => {
            const wg = new WordGroup(sampleSentence);

            expect(wg.findGrammar('( PRP| JJ| VB)+( IN)?')).toStrictEqual([[0,1], [3,4]]);
        });
    });

    it('should tokenize the content according to the given rules', () => {
        const wg = new WordGroup(sampleSentence);

        wg.tokenize(gramexRules);

        expect(wg.grammarRepresentation.trim()).toBe('G_2 RB G_1 !');
    });

    it('Should count the right number of words - Without sub-groups', () => {
        const wg = new WordGroup(sampleSentence);
        expect(wg.countWords()).toBe(7);
    });

    it('Should count the right number of words - With sub-groups', () => {
        const wg = new WordGroup(sampleSentence);
        wg.tokenize(gramexRules);
        expect(wg.countWords()).toBe(7);
    });

    it('Should Append / Prepend properly', () => {
        const wg = new WordGroup(sampleSentence);
        const w = new Word('test', 'TST');

        wg.prepend([w]);

        expect(wg.grammarRepresentation.trim()).toBe('TST PRP VB RB JJ IN RB !');

        wg.append([w]);

        expect(wg.grammarRepresentation.trim()).toBe('TST PRP VB RB JJ IN RB ! TST');
    });
});

