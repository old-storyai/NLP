import Range from 'meaning/range/range';

describe('SubSentence Range', () => {
    describe('Lowest child search', () => {
        function itFindsLowestChild(range: Range, pos:number, [expectedBeg, expectedEnd]: [number, number]) {
            it('Should be find the lowest available child for a specific position',() => {
                const kid = range.getLowestChildForPos(pos);

                expect(kid.start).toBe(expectedBeg);
                expect(kid.end).toBe(expectedEnd);
            });
        }

        itFindsLowestChild(
            range('( ()(()   ))'),
            //       ^
            2,
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

        console.log('STRING' + range('( (  () ) )'));
    });
});

/**
 * Makes it easier to create a range
 *
 * @param {string} rawIn The raw representation of the range, here's an example: "( (() ) () )"
 */
function range(rawIn: string) {
    let base:Range = new Range(0, undefined),
        currRange: Range = base;

    base.endRange(rawIn.length);

    for (let idx=0 ; idx<rawIn.length ; idx++) {
        let cara = rawIn[idx];

        if (cara === '(')
            currRange = currRange.startNewSubRange(idx);
        if (cara === ')')
            currRange = currRange.endRange(idx);
    }

    return base;
}
