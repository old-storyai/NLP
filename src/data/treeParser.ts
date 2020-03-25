
export default class TreeParser {
    _tree: object;

    constructor(settings0: object) {
        if (Array.isArray(settings0) || typeof settings0 !== 'object')
            throw new Error('Can\'t create a TreeParser with those settings');
        
        for (const key of Object.keys(settings0)) {
            const child = settings0[key];
            if (!Array.isArray(child))
                throw new Error('All childs need to be Arrays');

            for (const subChild of child)
                if (typeof subChild !== 'string')
                    throw new Error('All childs should contain only Strings');
        }
        
        this._tree = settings0;
    }

    findParentOfMatching(str: string): string {
        
        for (const key of Object.keys(this._tree)) {
            const children = this._tree[key];

            for (const child of children)
                if (new RegExp(child, 'gi').test(str))
                    return key;
        }
    }

    findChildrenOfMatching(str: string): string[] {
        
        for (const key of Object.keys(this._tree)) {
            const children = this._tree[key];

            if (new RegExp(key, 'gi').test(str))
                return children;
        }
    }

    findParentsOfMatched(rx: RegExp): string {
        for (const key of Object.keys(this._tree)) {
            const children = this._tree[key];

            for (const child of children)
                if (rx.test(child))
                    return key;
        }
    }

    findChildrenOfMatched(rx: RegExp): string {
        for (const key of Object.keys(this._tree)) {
            const children = this._tree[key];

            if (rx.test(key))
                return children;
        }
    }
}
