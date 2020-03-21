import moment from 'moment';

import TimeComponent       from './timeComponent';
import DurationComponent   from './durationComponent';
import DateComponent       from './dateComponent';
import RepetitionComponent from './repetitionComponent';
import OperatorComponent   from './operatorComponent';

export default class TimeInfos {
    _start: DateComponent;
    _end: DateComponent;
    _repetitionDelta: RepetitionComponent;
    _exactDate: DateComponent;
    _duration: DurationComponent;

    get start() { return this._start; }
    get end() { return this._end; }
    get repetitionDelta() { return this._repetitionDelta; }
    get exactDate() { return this._exactDate; }
    get duration() { return this._duration; }
    set start(s) {
        if (!!this._start) this._start.mergeWith(s);
        else this._start = s;

        this._start.minimize();

        if (!!this.end) {
            this.duration = this.start.diff(this.end);
        } else if (!!this.duration) {
            this.end = this.start.addTime(this.duration, true);
        }

        if (!!this.repetitionDelta && !this.repetitionDelta.dateFixed)
            this.repetitionDelta.dateSample = this.start;
    }
    set end(e) {
        if (!!this._end) this._end.mergeWith(e);
        else this._end = e;

        this._end.maximize();

        if (!!this.start) {
            this.duration = this.start.diff(this.end);
        } else if (!!this.duration) {
            this.start = this.end.addTime(this.duration, false);
        }
    }
    set duration(d) {
        if (!this.duration) this._duration = d;
        else this._duration.mergeWith(d);

        if (!!this.start && !this.end) {
            this.end = this.start.addTime(this.duration, true);
        } else if (!!this.end && !this.start) {
            this.start = this.end.addTime(this.duration, false);
        }
    }
    set repetitionDelta(r) {
        this._repetitionDelta = r;
        if (!this.repetitionDelta.dateFixed && !!this.start)
            this.repetitionDelta.dateSample = this.start;
    }
    set exactDate(d) {
        if (!this._exactDate) this._exactDate = d;
        else this._exactDate.mergeWith(d);
    }

    toString(): string { 
        let out = '';

        if (!!this.start)
            out += '\r\nStart: ' + this.start.toString();

        if (!!this.end)
            out += '\r\nEnd: ' + this.end.toString();

        if (!!this.repetitionDelta) {
            out += '\r\nRepetitionDelta: ' + this.repetitionDelta.toString();
            out += '\r\n\t next => ' + this.repetitionDelta.getNextOccurence(this.start?this.start:undefined);
            out += '\r\n\t 2next => ' + this.repetitionDelta.getNOccurencesAfter(2, this.start?this.start:undefined);
        }

        if (!!this.exactDate)
            out += '\r\nExactDate: ' + this.exactDate.toString();

        if (!!this.duration)
            out += '\r\nDuration: ' + this.duration.toString();

        return out;
    }
}
