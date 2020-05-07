import SentenceAnalyser from 'meaning/sentenceAnalyser';

describe('SentenceAnalyser', () => {

    describe('Verbs analysis', () => {
        function itAnalysesVerbs(testName: string, sentence: string, expectedVerb: string): void {
            const sa = new SentenceAnalyser(sentence);
            it(testName, () => {
                expect(
                    sa.createMeanings()[0]._action._verb
                ).toBe(expectedVerb);
            });
        }

        itAnalysesVerbs(
            'Composed verbs, separated',
            'Turn the heater on',
            'turn on'
        );

        itAnalysesVerbs(
            'composed verbs, joined',
            'Turn off the TV',
            'turn off'
        );

        itAnalysesVerbs(
            'Give a call to <PERSON>',
            'Give a call to my mom',
            'call'
        );

        itAnalysesVerbs(
            'Give <PERSON> a call',
            'Give my mom a call',
            'call'
        );

        itAnalysesVerbs(
            'Give a <NOUN>',
            'Give a present to my mom',
            'give'
        );
    });
});
