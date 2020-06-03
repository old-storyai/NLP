"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var durationComponent_1 = __importDefault(require("./durationComponent"));
var dateComponent_1 = __importDefault(require("./dateComponent"));
var repetitionComponent_1 = __importDefault(require("./repetitionComponent"));
var Operator;
(function (Operator) {
    Operator["more"] = "more";
    Operator["less"] = "less";
    Operator["moreReverse"] = "moreReverse";
    Operator["lessReverse"] = "lessReverse";
    Operator["repetition"] = "repetition";
    Operator["fromStart"] = "fromStart";
})(Operator || (Operator = {}));
var OperatorComponent = /** @class */ (function () {
    /**
     * @param rawIn A string representation of this operator
     *
     * @see Operator
     */
    function OperatorComponent(rawIn) {
        this.operator = {
            '<++': Operator.more,
            '<--': Operator.less,
            '++>': Operator.moreReverse,
            '-->': Operator.lessReverse,
            '%': Operator.repetition,
            '$': Operator.fromStart
        }[rawIn] || undefined;
        if (!this.operator)
            throw new Error('Wrong operator: ' + rawIn);
    }
    OperatorComponent.prototype.isAddition = function () {
        return this.operator === Operator.less ||
            this.operator === Operator.more;
    };
    /**
     * Redirects to the right operations depending on what `this` is
     *
     * @param prevs The time components present before this operator
     * @param nexts The time components present after this operator
     * @param infos A reference on the time informations (when a valuable info is found, it's stored there)
     *
     * @return The modified prevs and next
     */
    OperatorComponent.prototype.operate = function (prevs, nexts, infos) {
        return this["operate_" + this.operator](prevs, nexts, infos);
    };
    /**
     * An addition, see OperatorComponent.operate for arguments
     *
     * @example "3 weeks after christmas"
     *
     * @see OperatorComponent.operate
     */
    OperatorComponent.prototype.operate_more = function (prevs, nexts, infos, subtract) {
        if (subtract === void 0) { subtract = false; }
        if (nexts[0] instanceof repetitionComponent_1.default) {
            var rep = nexts[0];
            nexts[0] = rep.getNOccurencesAfter((rep.amount ? rep.amount : 1));
        }
        if (!(nexts[0] instanceof dateComponent_1.default))
            return [prevs, nexts];
        var prev = prevs[prevs.length - 1];
        var next = nexts[0];
        if (prev instanceof durationComponent_1.default) {
            // It's an addition.....
            infos.exactDate = next.addTime(prev, !subtract);
            nexts.shift();
            prevs.pop();
        }
        else if (prev instanceof repetitionComponent_1.default) {
            var rep = prev;
            if (!!rep.amount)
                infos.exactDate = rep.getNOccurencesAfter(rep.amount * (subtract ? -1 : 1), next);
            else
                infos.exactDate = rep.getNextOccurence(next);
            nexts.shift();
            prevs.pop();
        }
        else {
            // It's a range up
            if (subtract)
                infos.end = next;
            else
                infos.start = next;
            nexts.shift();
        }
        return [prevs, nexts];
    };
    /**
     * A subtraction, see OperatorComponent.operate for arguments
     *
     * @example "3 weeks before christmas"
     *
     * @see OperatorComponent.operate
     */
    OperatorComponent.prototype.operate_less = function (prevs, nexts, infos) {
        return this.operate_more(prevs, nexts, infos, true);
    };
    /**
     * An addition where the components are reversed (left is right and right is left), see OperatorComponent.operate for arguments
     *
     * @example "in 6 days"
     *
     * @see OperatorComponent.operate
     */
    OperatorComponent.prototype.operate_moreReverse = function (prevs, nexts, infos) {
        var prev = prevs.pop();
        var next = nexts.shift();
        prevs.push(next);
        nexts.unshift(prev);
        return this.operate_more(prevs, nexts, infos);
    };
    /**
     * A subtraction where the components are reversed (left is right and right is left), see OperatorComponent.operate for arguments
     *
     * @see OperatorComponent.operate
     */
    OperatorComponent.prototype.operate_lessReverse = function (prevs, nexts, infos) {
        var prev = prevs.pop();
        var next = nexts.shift();
        prevs.push(next);
        nexts.unshift(prev);
        return this.operate_less(prevs, nexts, infos);
    };
    /**
     * A repetition, see OperatorComponent.operate for arguments
     *
     * @example "every month"
     *
     * @see OperatorComponent.operate
     */
    OperatorComponent.prototype.operate_repetition = function (prevs, nexts, infos) {
        if (nexts[0] instanceof durationComponent_1.default) {
            infos.repetitionDelta = new repetitionComponent_1.default(nexts[0]);
            nexts.shift();
        }
        else if (nexts[0] instanceof repetitionComponent_1.default) {
            infos.repetitionDelta = nexts[0];
            nexts.shift();
        }
        if (!!infos.repetitionDelta) {
            var infoAdded = true;
            while (infoAdded) {
                infoAdded = false;
                if (nexts[0] instanceof repetitionComponent_1.default) {
                    // Every month on monday
                    infos.repetitionDelta.event = nexts[0];
                    nexts.shift();
                    infoAdded = true;
                }
                if (nexts[0] instanceof dateComponent_1.default) {
                    infos.repetitionDelta.dateSample = nexts[0];
                    nexts.shift();
                    infoAdded = true;
                }
            }
            infoAdded = true;
            while (infoAdded) {
                infoAdded = false;
                if (prevs[prevs.length - 1] instanceof repetitionComponent_1.default) {
                    // The 1st monday of every month
                    infos.repetitionDelta.event = prevs[prevs.length - 1];
                    prevs.pop();
                    infoAdded = true;
                }
                if (prevs[prevs.length - 1] instanceof dateComponent_1.default) {
                    // At 8am every day
                    infos.repetitionDelta.dateSample = prevs[prevs.length - 1];
                    prevs.pop();
                    infoAdded = true;
                }
            }
        }
        return [prevs, nexts];
    };
    /**
     * A range operation, see OperatorComponent.operate for arguments
     *
     * @example "for 2 weeks"
     *
     * @see OperatorComponent.operate
     */
    OperatorComponent.prototype.operate_fromStart = function (prevs, nexts, infos) {
        if (nexts[0] instanceof durationComponent_1.default)
            infos.duration = nexts.shift();
        //         if (nexts[0] instanceof DurationComponent)
        //             infos.duration = nexts.shift() as DurationComponent;
        return [prevs, nexts];
    };
    OperatorComponent.prototype.toString = function () {
        return this.operator.toString();
    };
    return OperatorComponent;
}());
exports.default = OperatorComponent;
//# sourceMappingURL=operatorComponent.js.map