import SentenceAnalyser from 'meaning/sentenceAnalyser';

describe('SentenceAnalyser', () => {

    describe('Verbs analysis', () => {
        function itAnalysesVerbs(testName: string, sa: SentenceAnalyser, expectedVerb: string): void {
            it(testName, () => {
                expect(
                    sa.createMeanings()[0]._action._verb
                ).toBe(expectedVerb);
            });
        }

        itAnalysesVerbs(
            'Composed verbs, separated',
            new SentenceAnalyser('Turn the heater on'),
            'turn on'
        );

        itAnalysesVerbs(
            'composed verbs, joined',
            new SentenceAnalyser('Turn off the TV'),
            'turn off'
        );

        // itAnalysesVerbs(
        //     'Give a call',
        //     new SentenceAnalyser('Give a call to my mom'),
        //     'call'
        // );

        // itAnalysesVerbs(
        //     'Give a <NOUN>',
        //     new SentenceAnalyser('Give a present to my mom'),
        //     'give'
        // );
    });
});
