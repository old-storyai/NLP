/**
 * Description of the setting syntax:
 *
 * # Simple replacement:
 *     "used": "use",
 *     "(use)d": "$1",
 *     "(used? to) (\\w+)": "$2",
 *
 * # Calculations:
 *     "4PM": "{={4+12}}",
 *
 * # Operations:
 *     "4PM": "{o0{toto}}",
 *
 *     Here, the operation number 0 is called with the argument 'toto'
 *
 * # Combination:
 *     You can then combine the above things:
 *
 *     "(\\d+)PM": "{o0{ {={$1+12}} }}",
 *
 *     This will call the operation #0, with the matched number plus 12
 *
 * # Notes:
 *     The functions will be called in the order of the given string.
 */

export default class StringParser {
    _settings: {[tag: string]: string};

    constructor(data: {[tag: string]: string}) {
        this._settings = data;
    }

    /**
     * Parses a string, in search for elements present in its settings.
     *
     * @param {string}     rawString:               The string to search in
     * @param {Function}   matchesCallback:         function to be called with each allMatches. Is called with (match, replacement)
     * @param {Function}   nonMatchesCallback:      function to be called with parts of the input that don't get allMatches
     * @param {Function[]} operationBlocksCallback: functions to be called with the operation operators within a match (See notes on top of file)
     * @param {boolean}    allowOverlappingMatches: Is it possible for a part of the text to be matched twice?
     */
    parseString(
        rawString: string,
        matchesCallback: (match:string, repl:string)=>void,
        nonMatchesCallback?: (string)=>void,
        operationBlocksCallback?: Function[],
        allowOverlappingMatches:boolean = true
    ) {
        rawString = rawString.trim();
        if (!matchesCallback)
            matchesCallback = () => '';
        if (!nonMatchesCallback)
            nonMatchesCallback = () => '';
        if (!operationBlocksCallback)
            operationBlocksCallback = [];

        let allMatches: {
            start: number, 
            end: number,
            matchedStr: string,
            replacement: string
        }[] = [];
        Object.keys(this._settings).forEach(word => {
            const replacement = this._settings[word];

            word = word.replace(/([^\\]\w)$/, '$1\\b');
            word = word.replace(/^(\w)/, '\\b$1');
            const regex = new RegExp(word, 'gi');
            let match:RegExpExecArray;
            while ((match = regex.exec(rawString)) !== null) {
                const repl = match[0]
                    .replace(new RegExp(word, 'gi'), replacement)
                    .replace(/\{=\{[0-9\-/*+\s]+\}\}/g, operation => {
                        // taking off brackets and leading zeros
                        operation = operation.replace(/[{}=]/g, '').replace(/(^|[^0-9])0+([1-9][0-9]*)[^0-9]/g, '$1');
                        return eval(operation);
                    })
                    .replace(/\{o\d+\{[^]+?\}\}+/g, arg => {
                        const opeNum = Number( arg.match(/^\{o(\d+)/)[1] );
                        arg = arg.replace(/^\{o\d+\{|\}\}$/g, '');
                        const args = arg.split(',').map(val => {
                            if (!isNaN(Number(val))) return Number(val);
                            try {
                                return JSON.parse(val);
                            } catch(e) {
                                // Not a json...
                            }
                            return val.trim();
                        });
                        if (opeNum in operationBlocksCallback)
                            return operationBlocksCallback[opeNum](...args);
                        return arg;
                    });

                allMatches.push({
                    'start':       match.index,
                    'end':         match.index + match[0].length,
                    'matchedStr':  match[0],
                    'replacement': repl
                });
            }
        });
        allMatches = allMatches.sort((a,b) => {
            let res = a.start-b.start;
            if (res === 0 && allowOverlappingMatches) res = a.end-b.end;
            return res;
        });


        if (!allMatches.length) {
            nonMatchesCallback(rawString);
        } else {
            let pos=0;
            for (const match of allMatches) {
                if (allowOverlappingMatches || pos <= match.start) {
                    const nonMatch = rawString.slice(pos, match.start).trim();
                    if (!!nonMatch)
                        nonMatchesCallback(nonMatch);

                    matchesCallback( match.matchedStr, match.replacement);

                    pos = (match.end)<pos? pos : (match.end);
                }
            }

            if (pos < rawString.length) {
                nonMatchesCallback(rawString.slice(pos));
            }
        }
    }
}
