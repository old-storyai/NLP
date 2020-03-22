import StringParser from 'stringParser/stringParser';

const settingsSample = {
    '\\d+': 'VB',
    'turns': 'VBZ',
    'turned': 'VBD',
    'close': 'VB',
    'closes': 'VBZ',
};

describe('StringParser class', () => {
    describe('Matches detection', () => {
        function itFindsMatches(
            testName: string,
            settings: {[tag: string]: string},
            input: string,
            expectedMatches?: string[],
            expectedReplacements?: string[],
            expectedNonMatches?: string[],
            allowOverlappingMatches: boolean = true
        ) {
            it(`${testName} ( "${input}" )`, () => {
                const nonMatches = [];
                const matches = [];
                const replacements = [];
                new StringParser(settings).parseString(
                    input,
                    (match, replacement) => {
                        matches.push(match);
                        replacements.push(replacement);
                    },
                    nonMatch => {
                        nonMatches.push(nonMatch);
                    },
                    [],
                    allowOverlappingMatches
                );

                if (!!expectedMatches)
                    expect(matches).toStrictEqual(expectedMatches);
                if (!!expectedReplacements)
                    expect(replacements).toStrictEqual(expectedReplacements);
                if (!!expectedNonMatches)
                    expect(nonMatches).toStrictEqual(expectedNonMatches);
            });
        }

        describe('Matches / NonMatches', () => {
            itFindsMatches(
                'Can find matches',
                {
                    '\\d{4}': '1',
                    'turned ... to be': '2',
                    'years?': '3'
                },
                '1891 turned out to be a good year',
                ['1891', 'turned out to be', 'year'],
                ['1', '2', '3']
            );
            itFindsMatches(
                'Can find NonMatches',
                {
                    'turned ... to be': '2',
                    'years?': '3'
                },
                '1891 turned out to be a good year',
                undefined,
                undefined,
                ['1891', 'a good']
            );
            itFindsMatches(
                'Can find matched AND NonMatches at the same time',
                {
                    'turned ... to be': '2',
                    'years?': '3'
                },
                '1891 turned out to be a good year',
                ['turned out to be', 'year'],
                undefined,
                ['1891', 'a good']
            );
        });

        describe('Overlapping Matches', () => {
            itFindsMatches(
                'Overlapping matches - allow',
                {
                    '\\d{4}': '1',
                    'turned ... to be': '2',
                    '(turned )?... to': 'X',
                    'years?': '3'
                },
                '1891 turned out to be a good year',
                ['1891', 'turned out to', 'turned out to be', 'year'],
                ['1', 'X', '2', '3'],
                undefined,
                true
            );

            itFindsMatches(
                'Overlapping matches - Forbid - Long match before',
                {
                    '\\d{4}': '1',
                    'turned ... to be': '2',
                    '(turned )?... to': 'X',
                    'years?': '3'
                },
                '1891 turned out to be a good year',
                ['1891', 'turned out to be', 'year'],
                ['1', '2', '3'],
                undefined,
                false
            );

            itFindsMatches(
                'Overlapping matches - Forbid 2.0 - Short match before',
                {
                    '\\d{4}': '1',
                    '(turned )?... to': 'X',
                    'turned ... to be': '2',
                    'years?': '3'
                },
                '1891 turned out to be a good year',
                ['1891', 'turned out to', 'year'],
                ['1', 'X', '3'],
                undefined,
                false
            );
        });

        describe('Replacements', () => {
            itFindsMatches(
                'Calculations',
                {
                    '\\d{4}': '{={5*5}}',
                    '(turned )?... to': '{={8*8+2/2}}',
                    'years?': '3*2'
                },
                '1891 turned out to be a good year',
                ['1891', 'turned out to', 'year'],
                ['25', '65', '3*2'],
            );

            itFindsMatches(
                'Replacement',
                {
                    '(\\d{4})': '$1',
                    '(turned )?... t(o)': '$2',
                    'years?': '$1'
                },
                '1891 turned out to be a good year',
                ['1891', 'turned out to', 'year'],
                ['1891', 'o', '$1'], // Nothing to replace for the last one
            );

            itFindsMatches(
                'Replacement + calculations',
                { '(\\d{4})': '{={$1+25}}' },
                '1891 turned out to be a good year',
                ['1891'],
                ['1916'],
            );
        });
    });

    describe('Functions calls', () => {
        function itCallsFunctions(
            testName: string,
            settings: {[tag: string]: string},
            input: string,
            expectedString: string,
            overlapping: boolean = true
        ) {
            it(`${testName} ( "${input}" )`, () => {
                const out = [];
                new StringParser(settings).parseString(
                    input,
                    (match, replacement) => {
                        out.push(match);
                    },
                    nonMatch => {
                        out.push(nonMatch);
                    },
                    [],
                    overlapping
                );

                expect(out.join(' ')).toBe(expectedString);

            });
        }

        itCallsFunctions(
            'Calls the callbacks in the right orders',
            {
                '\\d{4}': '1',
                'turned ... to be': '2',
                'years?': '3'
            },
            '1891 turned out to be a good year',
            '1891 turned out to be a good year'
        );

        itCallsFunctions(
            'Calls the callbacks in the right orders (with overlapping enabled)',
            {
                '\\d{4}': '1',
                'turned ... to be': '2',
                '... to be': '2',
                'years?': '3'
            },
            '1891 turned out to be a good year',
            '1891 turned out to be out to be a good year',
            true
        );

        itCallsFunctions(
            'Calls the callbacks in the right orders (with overlapping dissabled)',
            {
                '\\d{4}': '1',
                'turned ... to be': '2',
                '... to be': '2',
                'years?': '3'
            },
            '1891 turned out to be a good year',
            '1891 turned out to be a good year',
            false
        );
    });

    describe('Operations calls', () => {
        function itCallsOperations(
            testName: string,
            settings: {[tag: string]: string},
            input: string,
            expectedOperationsCalls: any[]
        ) {
            const operations = expectedOperationsCalls.map(v => jest.fn());

            it(`${testName} ( "${input}" )`, () => {
                const out = [];
                new StringParser(settings).parseString(
                    input,
                    undefined,
                    undefined,
                    operations,
                );

                operations.forEach((ope, idx) => {
                    expect(ope).toHaveBeenCalledWith(expectedOperationsCalls[idx]);
                });
            });
        }

        itCallsOperations(
            'Calls the callbacks in the right orders (with overlapping enabled)',
            {
                '(\\d{4})':         '{o0{$1}}',
                'turned ... to be': '{o2{{"test123": "321tset"}}}',
                '... to be':        '{o1{foo}}',
                'years?':           '3'
            },
            '1891 turned out to be a good year',
            [
                1891,
                'foo',
                {'test123': '321tset'}
            ]
        );

    });
});
