import * as Normalizer from 'language/normalizer';

describe('Verb disconjugation', () => {
    function itLematizesVerbs(testName: string, verbStr: string, expected: string) {
        it(`disconjugateVerb() - ${testName} (${verbStr} => ${expected})`, () => {
            expect(Normalizer.disconjugateVerb(verbStr)).toBe(expected);
        });
    }

    itLematizesVerbs('simple verb'     , 'eats'            , 'eat');
    itLematizesVerbs('composed verb x2', 'have eaten'      , 'eat');
    itLematizesVerbs('composed verb x3', 'have been eating', 'eat');
    itLematizesVerbs('used to'         , 'used to eat'     , 'eat');
    itLematizesVerbs('contracted verb' , '\'m used to eat' , 'eat');
    itLematizesVerbs('contracted verb' , '\'s used to eat' , 'eat');
});
