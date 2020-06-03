import Range from 'analyser/range/range';

describe('SubSentence Range', () => {
    describe('Lowest child search', () => {
        function itFindsLowestChild(range: Range, pos:number, [expectedBeg, expectedEnd]: [number, number]) {
            it('Should find the lowest available child for a specific position',() => {
                const kid = range.getLowestChildForPos(pos);

                expect(kid.start).toBe(expectedBeg);
                expect(kid.end).toBe(expectedEnd);
            });
        }

        itFindsLowestChild(
            range('( ()(()   ))'),
            2,  //   ^
            [2, 3]
        );

        itFindsLowestChild(
            range('( ()(  ()()( (  ))  ))'),
            12, //             ^
            [11, 17]
        );

        itFindsLowestChild(
            range('( ()(  ()()( (  ))  ))'),
            21, //                      ^
            [0, 21]
        );
    });
});

/**
 * Makes it easier to create a range
 *
 * @param {string} rawIn The raw representation of the range, here's an example: "( (() ) () )"
 */
function range(rawIn: string) {
    const base:Range = new Range(0, undefined);
    let currRange: Range = base;
    base.endRange(rawIn.length-1);

    for (let idx=0 ; idx<rawIn.length ; idx++) {
        const cara = rawIn[idx];

        if (cara === '(')
            currRange = currRange.startNewSubRange(idx);
        if (cara === ')')
            currRange = currRange.endRange(idx);
    }

    return base;
}
