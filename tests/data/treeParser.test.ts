import TreeParser from 'data/treeParser';
import * as Data from 'data/data';

describe('TreeParser class', () => {

    describe('findParentOfMatching', () => {
        function itFindsParentOfMatching(testName: string, objIn: object, sample: string, expectedResult: string) {
            it(testName, () => {
                const tp = new TreeParser(objIn);
                expect(tp.findParentOfMatching(sample)).toBe(expectedResult);
            });
        }

        itFindsParentOfMatching(
            'Simple test, no regex',
            { a: ['aaa', 'ccc'], b: ['bbb']},
            'aaa',
            'a'
        );

        itFindsParentOfMatching(
            'with regex 0',
            { a: ['just(A)+_?Words?', '^barba(papa)*'], b: ['(?<!bowl)ing$']},
            'justAAAWord',
            'a'
        );

        itFindsParentOfMatching(
            'with regex 1',
            { a: ['just(A)+_?Words?', '^barba(papa)*'], b: ['(?<!bowl)ing$'], c: ['(cur)?ling']},
            'bowling',
            'c'
        );

        itFindsParentOfMatching(
            'with regex 2',
            { a: ['just(A)+_?Words?', '^barba(papa)*'], b: ['(?<!bowl)ing$'], c: ['(cur)?ling']},
            'Something not in the list',
            undefined
        );
    });

    describe('findParentOfMatched', () => {
        function itFindsParentOfMatched(testName: string, objIn: object, rx: RegExp, expectedResult: string) {
            it(testName, () => {
                const tp = new TreeParser(objIn);
                expect(tp.findParentOfMatched(rx)).toBe(expectedResult);
            });
        }

        itFindsParentOfMatched(
            'Simple test - no regex',
            { monday: ['Having breakfast with Berenilde', 'Having lunch with Patrick'],
                tuesday: ['Traveling to Oregon'],
                wednesday: ['Going to the Comic Con']},
            /Oregon/,
            'tuesday'
        );

        itFindsParentOfMatched(
            'simple regex',
            { monday: ['Having breakfast with Berenilde', 'Having lunch with Patrick'],
                tuesday: ['Traveling to Oregon'],
                wednesday: ['Going to the Comic Con']},
            /ick$/,
            'monday'
        );

        itFindsParentOfMatched(
            'advanced regex',
            { monday: ['Taking breakfast with Berenilde', 'Having lunch with Patrick'],
                tuesday: ['Traveling to Oregon'],
                wednesday: ['Going to the Comic Con'],
                thursday: ['Having lunch at Starbucks with Jolene']},
            /with(?! Patrick)/,
            'monday'
        );

        itFindsParentOfMatched(
            'advanced regex 2',
            { monday: ['Taking breakfast with Berenilde', 'Having lunch with Patrick'],
                tuesday: ['Traveling to Oregon'],
                wednesday: ['Going to the Comic Con'],
                thursday: ['Having lunch at Starbucks with Jolene']},
            /with(?! Patrick| Berenilde)/,
            'thursday'
        );
    });

    describe('findChildrenOfMatching', () => {
        function itFindsChildrenOfMatching(testName: string, objIn: object, sample: string, expectedResult: string) {
            it(testName, () => {
                const tp = new TreeParser(objIn);
                expect(tp.findChildrenOfMatching(sample)).toStrictEqual(expectedResult);
            });
        }

        itFindsChildrenOfMatching(
            'Simple Regex',
            { '1|monday|\\dst': ['Taking breakfast with Berenilde', 'Having lunch with Patrick'],
                '2|february|\\dnd': ['Traveling to Oregon'] },
            '3nd',
            ['Traveling to Oregon']
        );

        itFindsChildrenOfMatching(
            'Simple Regex 2',
            { '1|monday|\\dst': ['Taking breakfast with Berenilde', 'Having lunch with Patrick'],
                '2|february|\\dnd': ['Traveling to Oregon'] },
            'monday',
            ['Taking breakfast with Berenilde', 'Having lunch with Patrick']
        );
    });

    describe('findChildrenOfMatched', () => {
        function itFindsChildrenOfMatched(testName: string, objIn: object, rx: RegExp, expectedResult: string) {
            it(testName, () => {
                const tp = new TreeParser(objIn);
                expect(tp.findChildrenOfMatched(rx)).toStrictEqual(expectedResult);
            });
        }

        itFindsChildrenOfMatched(
            'Simple test - no regex',
            { monday: ['Taking breakfast with Berenilde', 'Having lunch with Patrick'],
                tuesday: ['Traveling to Oregon'],
                wednesday: ['Going to the Comic Con'],
                thursday: ['Having lunch at Starbucks with Jolene']},
            /wednesday/,
            ['Going to the Comic Con']
        );

        itFindsChildrenOfMatched(
            'Simple Regex',
            { monday: ['Taking breakfast with Berenilde', 'Having lunch with Patrick'],
                tuesday: ['Traveling to Oregon'],
                wednesday: ['Going to the Comic Con'],
                thursday: ['Having lunch at Starbucks with Jolene']},
            /[^s]day/,
            ['Taking breakfast with Berenilde', 'Having lunch with Patrick']
        );
    });
});
