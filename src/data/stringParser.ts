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
    _dictionnary: {[tag: string]: string};

    constructor(data: {[tag: string]: string}, dictionnary: {[word: string]: string} = {}) {
        this._settings = data;
        this._dictionnary = this.processDictionnary(dictionnary);
    }

    getDefinitionOf(word, dictionnary, count = 0): string {
        if (!(word in dictionnary)) return '';
        // To avoid circular references:
        if (count > 50) return '';

        let def = dictionnary[word];

        def = def.replace(/\{\{:.*?:\}\}/g, match => {
            match = match.replace(/(\{\{:|:\}\})/g, '');
            return this.getDefinitionOf(match, dictionnary, count+1);
        });

        return `(?:${def})`;
    }

    processDictionnary(dico: {[item: string]: string}): {[item: string]: string} {
        for (const word of Object.keys(dico)) {
            dico[word] = this.getDefinitionOf(word, dico);
        }

        return dico;
    }

    /**
     * Parses a string, in search for elements present in its settings.
     *
     * @param rawString               The string to search in
     * @param matchesCallback         function to be called with each allMatches. Is called with (match, replacement)
     * @param nonMatchesCallback      function to be called with parts of the input that don't get allMatches
     * @param operationBlocksCallback functions to be called with the operation operators within a match (See notes on top of file)
     * @param allowOverlappingMatches Is it possible for a part of the text to be matched twice?
     * @param parallelSet             This array should contain one element per word in the initial sentence, see tests for its usage
     */
    parseString(
        rawString: string,
        matchesCallback: (match: string, repl: string) => void,
        nonMatchesCallback?: (string) => void,
        operationBlocksCallback?: Function[]|{[tag: string]: Function},
        allowOverlappingMatches: boolean = true,
        parallelSet: string[] = []
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
        Object.keys(this._settings).forEach(lhs => {
            const replacement = this._settings[lhs];

            lhs = lhs
                .replace(/([^\\]\w)$/, '$1\\b')
                .replace(/^(\w)/, '\\b$1')
                .replace(/\{\{:[^]+?:\}\}+/g, arg => {
                    arg = arg.replace(/^\{\{:|:\}\}$/g, '');
                    if (arg in this._dictionnary) {
                        return this._dictionnary[arg]
                            .replace(/(?<!\\)\((?!\?)/g, '(?:');
                    }
                    return arg;
                })
                .replace(/{{![A-Za-z_]*!}}/g, match => {
                    match = match.replace(/^\{\{!|!\}\}$/g, '');

                    const splittedSentence = rawString.trim().split(/\s+/);
                    const potentialWords = [];
                    let idx = parallelSet.indexOf(match);
                    while (idx >= 0) {
                        potentialWords.push(splittedSentence[idx]);
                        idx = parallelSet.indexOf(match, idx+1);
                    }

                    if (!!potentialWords.length) {
                        const res = `(?:${potentialWords.join('|')})`;
                        return res;
                    }

                    // returning impossible regex
                    return '(?:(?!a)a)';
                });

            // console.log(lhs);

            const regex = new RegExp(lhs, 'gi');
            let match: RegExpExecArray;
            while ((match = regex.exec(rawString)) !== null) {
                const repl = match[0]
                    .replace(new RegExp(lhs, 'gi'), replacement)
                    .replace(/\{IDX\{(\d+|&)\}\}/g, arg => {
                        const chara = arg.match(/\{((?:\d+|&))\}/)[1];
                        if (chara === '&') {
                            return '' + rawString.slice(0, match.index).trim().split(/\s+/).length;
                        }
                        const captureNum = Number(chara);
                        const res = lhs.replace(new RegExp(`^.*?(\\((?!\\?).*?){${captureNum-1}}\\((?!\\?)`), m => {
                            const regex = /(\)[?*+]*|\((?:\?[:!])?|\|)?(.*?)(?=\)[?*+]*|\((?:\?[:!])?|\|)/g;
                            m = m.replace(regex, '$1(?<@@@>$2)');
                            let count = 0;
                            m = m.replace(/\(\?<@@@>\)/g, '');
                            m = m.replace(/@@@/g, () => 'S' + count++);
                            return m;
                        });
                        const re = new RegExp(res, 'i');
                        const m = re.exec(rawString);
                        let out = rawString.slice(0, match.index);

                        if (!!m && !!m.groups) {
                            out += Object.values(m.groups).filter(v=>!!v).join(' ');
                        }
                        return '' + out.trim().split(/\s+/).length;
                    })
                    .replace(/\{=\{[0-9\-/*+\s]+\}\}/g, operation => {
                        // taking off brackets and leading zeros
                        operation = operation.replace(/[{}=]/g, '').replace(/(^|[^0-9])0+([1-9][0-9]*)[^0-9]/g, '$1');
                        return eval(operation);
                    })
                    .replace(/\{o(\d+|<[\w-]+>)\{.*?\}\}+/g, arg => {
                        const res = arg.match(/^\{o(?:(?<number>\d+)|<(?<name>[\w-]+)>)/);
                        const opeName = res.groups.name || res.groups.number;
                        arg = arg.replace(/^\{o(?:\d+|<[\w-]+>){|\}\}$/g, '');
                        const args = arg.split(',').map(val => {
                            if (!isNaN(Number(val))) return Number(val);
                            try {
                                return JSON.parse(val);
                            } catch (e) {
                                // Not a json...
                            }
                            return val.trim();
                        });
                        if (opeName in operationBlocksCallback)
                            return operationBlocksCallback[opeName](...args);
                        return arg;
                    });

                allMatches.push({
                    'start': match.index,
                    'end': match.index + match[0].length,
                    'matchedStr': match[0],
                    'replacement': repl
                });
            }
        });
        allMatches = allMatches.sort((a, b) => {
            let res = a.start - b.start;
            if (res === 0 && allowOverlappingMatches) res = a.end - b.end;
            return res;
        });


        if (!allMatches.length) {
            nonMatchesCallback(rawString);
        } else {
            let pos = 0;
            for (const match of allMatches) {
                if (allowOverlappingMatches || pos <= match.start) {
                    const nonMatch = rawString.slice(pos, match.start).trim();
                    if (!!nonMatch)
                        nonMatchesCallback(nonMatch);

                    matchesCallback(match.matchedStr, match.replacement);

                    pos = (match.end) < pos ? pos : (match.end);
                }
            }

            if (pos < rawString.length) {
                nonMatchesCallback(rawString.slice(pos));
            }
        }
    }
}
