import * as moment from 'moment';

import {Time, DateComponent, DurationComponent} from 'meaning/notions/time';
import {Word, WordGroup} from 'grammar/wordGroup/wordGroup';

describe('Time class', () => {
    function itRecognizesTime(
        testName: string,
        dateWordGroup: WordGroup,
        expectedNextDate: DateComponent,
        expectedStart?: DateComponent,
        expectedEnd?: DateComponent
    ) {
        const t = new Time(dateWordGroup, []);
        const infos = t.timeInfos;
        let nextDate: DateComponent;
        if (!!infos.exactDate) {
            nextDate = infos.exactDate; 
        } else if (!!infos.repetitionDelta) {
            nextDate = infos.repetitionDelta.getNextOccurence(
                infos.start || undefined
            );
        }

        const format = 'DD-MM-YYYY HH:mm:ss';
        it(`${testName} ( "${dateWordGroup.toString()}" )`, () => {
            expect(nextDate.moment.format(format)).toBe(expectedNextDate.moment.format(format));
        });

        if (!!expectedStart) {
            it(`${testName} - start ( "${dateWordGroup.toString()}" )`, () => {
                expect(infos.start.format(format)).toBe(expectedStart.moment.format(format));
            });
        }

        if (!!expectedEnd) {
            it(`${testName} - end ( "${dateWordGroup.toString()}" )`, () => {
                expect(infos.end.format(format)).toBe(expectedEnd.moment.format(format));
            });
        }
    }
    
    describe('Simple absolute dates', () => {
        itRecognizesTime(
            'All time units given',
            wordgrp`The 5th of september 1997 at 11:00:00`,
            datecomp`1997-09-05T11:00:00`
        );

        itRecognizesTime(
            'Omitting seconds',
            wordgrp`The 5th of september 1997 at 11:00`,
            datecomp`1997-09-05T11:00:00`
        );

        itRecognizesTime(
            'Omitting minutes & seconds',
            wordgrp`The 5th of september 1997 at 11AM`,
            datecomp`1997-09-05T11:00:00`
        );

        itRecognizesTime(
            'Omitting hour, minutes & seconds',
            wordgrp`The 5th of september 1997`,
            datecomp`1997-09-05T09:00:00` // 9AM is the default time
        );

        itRecognizesTime(
            'Only year and month',
            wordgrp`in september 1997`,
            datecomp`1997-09-01T09:00:00` // 9AM is the default time
        );

        itRecognizesTime(
            'Only year',
            wordgrp`in 1997`,
            datecomp`1997-01-01T09:00:00` // 9AM is the default time
        );
    });
    
    describe('Advanced absolute dates', () => {
        itRecognizesTime(
            'Weekdays',
            wordgrp`On the 2nd monday of february 2023`,
            datecomp`2023-02-13T09:00:00`
        );
    });

    describe('Relative Dates', () => {
        itRecognizesTime(
            'next ...',
            wordgrp`Next year`,
            datecomp`${now`Y${'+1Y+02M'}`}-01-01T09:00:00`
        );

        itRecognizesTime(
            'in ...',
            wordgrp`In 2 years`,
            datecomp`${now`Y${'+2Y'}`}-${now`M${'+0D'}`}-${now`D${'+0D'}`}T09:00:00`
        );
    });
    
    describe('Events', () => {
        itRecognizesTime(
            '<EVENT> <YEAR>',
            wordgrp`Christmas 2021`,
            datecomp`2021-12-25T09:00:00`
        );

        itRecognizesTime(
            'after <EVENT>',
            wordgrp`3 days after Christmas 1997`,
            datecomp`1997-12-28T09:00:00`
        );

        itRecognizesTime(
            'X <EVENT> after <EVENT>',
            wordgrp`3 mondays after Christmas 1997`,
            datecomp`1998-01-12T09:00:00`
        );

        itRecognizesTime(
            'Specific time',
            wordgrp`Christmas 1997 at 8:26AM`,
            datecomp`1997-12-25T08:26:00`
        );

        itRecognizesTime(
            'X <events> after <DATE>',
            wordgrp`3 mondays after the 5th of july 1997`,
            datecomp`1997-07-21T09:00:00`
        );

        itRecognizesTime(
            'at <TIME> X <events> after <DATE>',
            wordgrp`at 17:30 3 mondays after the 5th of july 1997`,
            datecomp`1997-07-21T17:30:00`
        );
    });
});

/**
 * To help build DateComponents
 */
function datecomp(rawIn: TemplateStringsArray, ...args: any[]): DateComponent {
    const arg = rawIn.reduce((acc, v, idx) => acc+v+(args[idx]||''), '');

    return new DateComponent('s', arg);
}

/**
 * To help build wordgroups
 *
 * @param rawIn The string (e.g. "The quick brown fox jumps over the lazy dog")
 */
function wordgrp(rawIn: TemplateStringsArray): WordGroup {
    if (rawIn.length > 1)
        throw new Error('Don\'t know how to interpolate!');

    return new WordGroup(
        rawIn[0]
            .trim()
            .split(/\s+/g)
            .map(word => {
                // We don't need tags for the times
                return new Word(word, '');
            })
    );
}

/**
 * Use it as follow:
 *
 *      now`Y${'+1Y'}`  => this year + 1
 *      now`D${'-3D-2h'}`  => right now minus 3 days, minus 2 hours
 *
 * Note: Don't mix up minuses and plus
 */
function now(unit: TemplateStringsArray, to_add: string): string {
    const u:string = unit[0];
    const arg = {};
    const m = to_add.match(/[+-]\d+[a-zA-Z]/g);
    m.forEach(blob => {
        const [, num, unit] = blob.match(/^([+-]\d+)([a-zA-Z])/);
        arg[unit] = Number(num);
    });
    console.log(`stringify: ${JSON.stringify(arg)}`);
    const out = DateComponent.now().addTime(
        new DurationComponent(arg)
    ).toObject(true);

    if (! (u in out))
        throw new Error(`can't find unit ${u} in DateComponent`);

    const addLeadingzeros = (num: number, requiredCharsAmount:number = 2): string => {
        let out = String(num);
        out = '0'.repeat(requiredCharsAmount - out.length) + out;
        return out;
    };

    return addLeadingzeros(Number(out[u]) + (u==='M'?1:0), (u==='Y'?4:2));

}
