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
     * @param {Function}   matchesCallback:         function to be called with each matches. Is called with (match, replacement)
     * @param {Function}   nonMatchesCallback:      function to be called with parts of the input that don't get matches
     * @param {Function[]} operationBlocksCallback: functions to be called with the operation operators within a match (See notes on top of file)
     */
    parseString(rawString: string, matchesCallback: (match:string, repl:string)=>void, nonMatchesCallback?: (string)=>void, operationBlocksCallback?: Function[]) {
        if (!nonMatchesCallback)
            nonMatchesCallback = () => '';
        if (!operationBlocksCallback)
            operationBlocksCallback = [];

        let idx = 0;
        const matches:[string, string][] = [];
        Object.keys(this._settings).forEach(word => {
            const replacement = this._settings[word];
            rawString = rawString.replace(
                new RegExp(word, 'gi'),
                match => {
                    matches[idx] = [match, ''];

                    const repl = match
                        .replace(new RegExp(word, 'gi'), replacement)
                        .replace(/\{=\{[0-9\-/*+]+\}\}/g, operation => {
                            operation = operation.replace(/[{}=]/g, '');
                            return eval(operation);
                        })
                        .replace(/\{o\d+\{[^}]+\}\}/, arg => {
                            const opeNum = Number( arg.match(/^\{o(\d+)/)[1] );
                            arg = arg.replace(/^\{o\d+\{|\}\}/g, '');
                            if (opeNum in operationBlocksCallback)
                                return operationBlocksCallback[opeNum](arg);
                            return arg;
                        });

                    matches[idx][1] = repl;
                    return `||::${idx++}::||`;
                }
            );
        });

        rawString.split('||').forEach(part => {
            if (!part.trim().length) return;

            if (/::\d+::/.test(part)) {
                const idx = Number( part.replace(/:/g, '') );
                matchesCallback(...matches[idx]);
            } else {
                nonMatchesCallback(part);
            }
        });
    }

}
