import moment from 'moment';

import {WordGroup, Word} from '../grammar/tokenizer';
import * as Data from '../data/data';

import {Meaning} from './meaning';
import Info from './info/info';
import StringParser from '../data/stringParser';

import TimeComponent from './timeComponents/timeComponent';
import DurationComponent from './timeComponents/durationComponent';
import DateComponent from './timeComponents/dateComponent';
import RepetitionComponent from './timeComponents/repetitionComponent';
import OperatorComponent from './timeComponents/operatorComponent';
import TimeInfos from './timeComponents/timeInfos';

export {TimeComponent, DurationComponent, DateComponent, RepetitionComponent, OperatorComponent, TimeInfos};

export class Time extends Info {

    _raw: string;

    _timeCode: string;

    _addition?: Meaning;

    timeInfos: TimeInfos;


    protected processWords() {
        this.findDate();
    }

    private findDate() {
        this._timeCode = '';

        const str = new WordGroup([...this._conns, ...this._wordGroup.words] as [Word], '').toString();

        new StringParser(Data.getData('timeComponents'))
            .parseString(
                str,
                (_, timeMeaning) => {
                    this._timeCode += ' ' + timeMeaning;
                },
                () => {},
                [
                    (unit, delta, modifier) => {
                        let m = moment().add(delta, unit);
                        if (modifier === 'start')
                            m = m.startOf(unit);

                        if (modifier === 'end')
                            m = m.endOf(unit);


                        return m.format();
                    }
                ]
            );
        this._timeCode = this._timeCode.trim();

        this.parseTimeCode();
    }

    private parseTimeCode() {
        this.timeInfos = new TimeInfos();

        let prevComps: TimeComponent[] = [];
        let pendingNumber = null;
        let pendingStr = '';

        //
        // Grouping the time elements, and creating instances
        //
        this._timeCode.split(/\s+/).forEach(timePart => {
            let comp = this.parseTimeCodeComponent(timePart);

            if (typeof comp === 'number') {
                if (pendingStr.length)
                    comp = this.parseTimeCodeComponent( `${pendingStr}~${comp}` );
                else {
                    pendingNumber = comp;
                    return;
                }
            }
            if (typeof comp === 'string') {
                if (pendingNumber !== null)
                    comp = this.parseTimeCodeComponent( `${comp}~${pendingNumber}` );
                else {

                    pendingStr = comp;
                    return;
                }
            }

            let prev = prevComps[0];

            if (prev instanceof DateComponent && comp instanceof DateComponent) {
                prev.mergeWith(comp);
                return;
            }
            if (comp instanceof DurationComponent) {
                if (prev instanceof OperatorComponent &&
                    prev.isAddition()
                ) {
                    prevComps.shift(); // We take it off because it makes no sense
                    prev = prevComps[0];
                }
                if (prev instanceof DurationComponent) {
                    prev.mergeWith(comp);
                    return;
                }
            }
            if (comp instanceof RepetitionComponent) {
                if (pendingNumber!==null)
                    comp.amount = pendingNumber;

                // If the prev is just a day, it's probably an amount for the event ("3rd monday")
                if (prev instanceof DateComponent) {
                    const units = prev.fixedUnits;
                    if (units.length === 1 && units[0] === 'D') {
                        comp.amount = prev.moment.date();
                        prevComps.shift();
                        prev = prevComps[0];
                    }
                }
            }

            prevComps.unshift(comp);
            pendingNumber = null;
            pendingStr = '';
        });
        prevComps = prevComps.filter(comp => !!comp).reverse();

        //
        // Some more elements grouping
        //
        for (let idx=0 ; idx<prevComps.length ; idx++) {
            let elem = prevComps[idx];

            if (elem instanceof RepetitionComponent) {
                if (prevComps[idx-1] instanceof DateComponent) {
                    // e.g. 6pm on Christmas
                    const date = prevComps[idx-1] as DateComponent;
                    if (date.fixedUnits.includes('D')) {
                        elem.amount = date.getUnit('D');
                        date.removeUnit('D');
                    }
                    elem.event = date.toRepetition();

                    prevComps.splice(idx-1, 1);
                    idx--;
                } else if (prevComps[idx+1] instanceof DateComponent) {
                    // e.g. Christmas 2021
                    const date = prevComps[idx+1] as DateComponent;
                    date.minimize();
                    if (!elem.addSamplePrecisions(date)) {
                        elem = elem.getNOccurencesAfter(elem.amount, date);
                    }

                    prevComps.splice(idx+1, 1);
                }
            }
            prevComps[idx] = elem;
        }
        prevComps = prevComps.filter(comp => !!comp);

        let prevs = [];
        let nexts = prevComps.slice(0);

        //
        // Actual calculations with operators
        //
        while (nexts.length) {
            const curr = nexts.shift();

            if (curr instanceof OperatorComponent)
                [prevs, nexts] = curr.operate(prevs, nexts, this.timeInfos);
            else
                prevs.push(curr);
        }

        prevs.forEach(remainingComp => {
            if (remainingComp instanceof DateComponent) {
                if (!remainingComp.hasConsistentFixedUnits()) {
                    remainingComp = remainingComp.toRepetition().getNextOccurence(
                        this.timeInfos.start?this.timeInfos.start:undefined
                    );
                }
                if (!this.timeInfos.exactDate)
                    this.timeInfos.exactDate = remainingComp;
                else
                    this.timeInfos.exactDate.mergeWith(remainingComp);

            }
        });

        prevs.forEach(remainingComp => {
            if (remainingComp instanceof RepetitionComponent) {
                const newDate:DateComponent = remainingComp.getNOccurencesAfter(
                    remainingComp.amount || 1,
                    this.timeInfos.start || this.timeInfos.exactDate || undefined
                );
                if (!this.timeInfos.exactDate)
                    this.timeInfos.exactDate = newDate;
                else
                    this.timeInfos.exactDate.mergeWith(newDate);
            }
        });

        if (!!this.timeInfos.repetitionDelta && !this.timeInfos.start) {
            this.timeInfos.start = DateComponent.now();
        }

        if (!!this.timeInfos.exactDate)
            this.timeInfos.exactDate.toDefaultIfPrecisionAbove('D');
        if (!!this.timeInfos.start)
            this.timeInfos.start.minimize();
        if (!!this.timeInfos.end)
            this.timeInfos.end.maximize();
    }

    private parseTimeCodeComponent(rawIn: string): TimeComponent|number|string {
        rawIn = rawIn.trim();
        if (/^~-?\d+$/.test(rawIn)) {
            return Number(rawIn.slice(1));
        } else if (/^~\w$/.test(rawIn)) {
            return rawIn.slice(1);
        } else if (/^[?\w]=/.test(rawIn)) {
            const unit = rawIn[0];
            const num  = rawIn.match(/^[?\w]=(.*)$/)[1];
            return new DateComponent(unit, num);

        } else if (/^[?\w]~/.test(rawIn)) {
            const unit = rawIn[0];
            const num  = rawIn.match(/^[?\w]~(.*)$/)[1];
            const arg = {};
            arg[unit] = num;
            return new DurationComponent(arg);

        } else if (/^@/.test(rawIn))
            return RepetitionComponent.from(rawIn);
        else
            return new OperatorComponent(rawIn);

        return undefined;
    }

}

