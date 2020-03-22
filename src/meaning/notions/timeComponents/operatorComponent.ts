import TimeComponent from './timeComponent';

import DurationComponent   from './durationComponent';
import DateComponent       from './dateComponent';
import RepetitionComponent from './repetitionComponent';
import TimeInfos           from './timeInfos';

enum Operator{
    'more'        = 'more',
    'less'        = 'less',
    'moreReverse' = 'moreReverse',
    'lessReverse' = 'lessReverse',
    'repetition'  = 'repetition',
    'fromStart'   = 'fromStart',
}

export default class OperatorComponent implements TimeComponent {

    operator: Operator;

    /**
     * @param rawIn A string representation of this operator
     *
     * @see Operator
     */
    constructor(rawIn: string) {
        this.operator = {
            '<++': Operator.more,
            '<--': Operator.less,
            '++>': Operator.moreReverse,
            '-->': Operator.lessReverse,
            '%'  : Operator.repetition,
            '$'  : Operator.fromStart
        }[rawIn] || undefined;

        if (!this.operator)
            throw new Error('Wrong operator: ' + rawIn);
    }

    isAddition(): boolean {
        return this.operator === Operator.less ||
            this.operator === Operator.more;
    }

    /**
     * Redirects to the right operations depending on what `this` is
     *
     * @param prevs The time components present before this operator
     * @param nexts The time components present after this operator
     * @param infos A reference on the time informations (when a valuable info is found, it's stored there)
     *
     * @return The modified prevs and next
     */
    operate(prevs: TimeComponent[], nexts: TimeComponent[], infos: TimeInfos): [ TimeComponent[], TimeComponent[], ] {
        return this[`operate_${this.operator}`](prevs, nexts, infos);
    }

    /**
     * An addition, see OperatorComponent.operate for arguments
     *
     * @example "3 weeks after christmas"
     *
     * @see OperatorComponent.operate
     */
    private operate_more(prevs: TimeComponent[], nexts: TimeComponent[], infos: TimeInfos, subtract: boolean = false): [ TimeComponent[], TimeComponent[], ] {
        if (nexts[0] instanceof RepetitionComponent) {
            const rep = (nexts[0] as RepetitionComponent);
            nexts[0] = rep.getNOccurencesAfter((rep.amount? rep.amount : 1));
        }
        if (! (nexts[0] instanceof DateComponent))
            return [prevs, nexts];

        const prev = prevs[prevs.length-1];
        const next = nexts[0] as DateComponent;

        if (prev instanceof DurationComponent) {
            // It's an addition.....
            infos.exactDate = next.addTime(prev, !subtract);
            nexts.shift();
            prevs.pop();
        } else if (prev instanceof RepetitionComponent) {
            const rep = prev as RepetitionComponent;
            if (!!rep.amount)
                infos.exactDate = rep.getNOccurencesAfter(rep.amount * (subtract?-1:1), next);
            else
                infos.exactDate = rep.getNextOccurence(next);
            nexts.shift();
            prevs.pop();
        } else {
            // It's a range up
            if (subtract)
                infos.end = next;
            else
                infos.start = next;
            nexts.shift();
        }

        return [prevs, nexts];
    }

    /**
     * A subtraction, see OperatorComponent.operate for arguments
     *
     * @example "3 weeks before christmas"
     *
     * @see OperatorComponent.operate
     */
    private operate_less(prevs: TimeComponent[], nexts: TimeComponent[], infos: TimeInfos): [ TimeComponent[], TimeComponent[], ] {
        return this.operate_more(prevs, nexts, infos, true);
    }

    /**
     * An addition where the components are reversed (left is right and right is left), see OperatorComponent.operate for arguments
     *
     * @example "in 6 days"
     *
     * @see OperatorComponent.operate
     */
    private operate_moreReverse(prevs: TimeComponent[], nexts: TimeComponent[], infos: TimeInfos): [ TimeComponent[], TimeComponent[], ] {
        const prev = prevs.pop();
        const next = nexts.shift();
        prevs.push(next);
        nexts.unshift(prev);
        return this.operate_more(prevs, nexts, infos);
    }

    /**
     * A subtraction where the components are reversed (left is right and right is left), see OperatorComponent.operate for arguments
     *
     * @see OperatorComponent.operate
     */
    private operate_lessReverse(prevs: TimeComponent[], nexts: TimeComponent[], infos: TimeInfos): [ TimeComponent[], TimeComponent[], ] {
        const prev = prevs.pop();
        const next = nexts.shift();
        prevs.push(next);
        nexts.unshift(prev);
        return this.operate_less(prevs, nexts, infos);
    }

    /**
     * A repetition, see OperatorComponent.operate for arguments
     *
     * @example "every month"
     *
     * @see OperatorComponent.operate
     */
    private operate_repetition(prevs: TimeComponent[], nexts: TimeComponent[], infos: TimeInfos): [ TimeComponent[], TimeComponent[], ] {

        if (nexts[0] instanceof DurationComponent) {
            infos.repetitionDelta= new RepetitionComponent(nexts[0] as DurationComponent);
            nexts.shift();
        } else if (nexts[0] instanceof RepetitionComponent) {
            infos.repetitionDelta = nexts[0] as RepetitionComponent;
            nexts.shift();
        }

        if (!!infos.repetitionDelta) {
            let infoAdded = true;
            while (infoAdded) {
                infoAdded = false;
                if (nexts[0] instanceof RepetitionComponent) {
                    // Every month on monday
                    infos.repetitionDelta.event = nexts[0] as RepetitionComponent;
                    nexts.shift();
                    infoAdded = true;
                }
                if (nexts[0] instanceof DateComponent) {
                    infos.repetitionDelta.dateSample = nexts[0] as DateComponent;
                    nexts.shift();
                    infoAdded = true;
                }
            }
            infoAdded = true;
            while (infoAdded) {
                infoAdded = false;
                if (prevs[prevs.length-1] instanceof RepetitionComponent) {
                    // The 1st monday of every month
                    infos.repetitionDelta.event = prevs[prevs.length-1] as RepetitionComponent;
                    prevs.pop();
                    infoAdded = true;
                }
                if (prevs[prevs.length-1] instanceof DateComponent) {
                    // At 8am every day
                    infos.repetitionDelta.dateSample = prevs[prevs.length-1] as DateComponent;
                    prevs.pop();
                    infoAdded = true;
                }
            }
        }

        return [prevs, nexts];
    }

    /**
     * A range operation, see OperatorComponent.operate for arguments
     *
     * @example "for 2 weeks"
     *
     * @see OperatorComponent.operate
     */
    private operate_fromStart(prevs: TimeComponent[], nexts: TimeComponent[], infos: TimeInfos): [ TimeComponent[], TimeComponent[], ] {

        if (nexts[0] instanceof DurationComponent) {
            infos.duration = nexts.shift() as DurationComponent;
        }
        return [prevs, nexts];
    }

    toString() {
        return this.operator.toString();
    }
}
