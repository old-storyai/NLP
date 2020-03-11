
export default class Range {
    start: number;
    end: number;
    parent?: Range;
    children?: Range[];

    constructor(start0, parent0) {
        this.start = start0;
        this.parent = parent0;
        this.children = [];
    }

    getLowestChildForPos(pos: number): Range {
        if (this.start>pos || this.end<pos)
            return undefined;

        const out = this.children.reduce((acc, kid)=>kid.getLowestChildForPos(pos) || acc, undefined);
        return out || this;
    }

    startNewSubRange(startPos: number, endPos:number = undefined): Range {
        let p:Range = this;
        while (p !== undefined) {
            if (!!p.end && startPos>p.end)
                throw new Error('Cannot start a range after the end of one of its parent');
            p = p.parent;
        }

        const properParent:Range = this.getLowestChildForPos(startPos);

        const r = new Range(startPos, properParent);
        if (!!endPos) r.endRange(endPos);

        properParent.children.push(r);
        return r;
    }

    endRangeForLowestChild(pos: number) {
        this.getLowestChildForPos(pos).endRange(pos);
    }

    endRange(pos: number): Range {
        if (pos<=this.start)
            throw new Error('Cannot end a range before or at its starting point');

        let p = this.parent;
        while (p !== undefined) {
            if (!!p.end && pos>p.end)
                throw new Error('Cannot end a range after the end of one of its parent');
            p = p.parent;
        }

        if (!!this.end)
            throw new Error('This range already has a defined end');

        this.children.forEach(kid => {
            if (!!kid.end && pos < kid.end)
                throw new Error('Cannot close a range before the end of one of its kids');
        });

        this.end = pos;

        return this.parent;
    }

    toString(): string {
        const kidsIndex = {};
        this.children.forEach(kid => {
            kidsIndex[kid.start] = kid;
        });
        let out = '';
        for (let i=this.start ; true ; i++) {
            if (i in kidsIndex) {
                out += kidsIndex[i].toString();
                i = kidsIndex[i].end;
                delete kidsIndex[i];
            } else
                out += ' ';

            if ((!!this.end && i>=this.end) || (!this.end && Object.keys(kidsIndex).length>0)) break;
        }

        return `(${out.slice(1, -1)})`;
    }
}
