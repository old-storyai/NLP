"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
var StringParser = /** @class */ (function () {
    function StringParser(data, dictionnary) {
        if (dictionnary === void 0) { dictionnary = {}; }
        this._settings = data;
        this._dictionnary = this.processDictionnary(dictionnary);
    }
    StringParser.prototype.getDefinitionOf = function (word, dictionnary, count) {
        var _this = this;
        if (count === void 0) { count = 0; }
        if (!(word in dictionnary))
            return '';
        // To avoid circular references:
        if (count > 100)
            return '';
        var def = dictionnary[word];
        def = def.replace(/\{\{:.*?:\}\}/g, function (match) {
            match = match.replace(/(\{\{:|:\}\})/g, '');
            return _this.getDefinitionOf(match, dictionnary, count + 1);
        });
        return "(?:" + def + ")";
    };
    StringParser.prototype.processDictionnary = function (dico) {
        for (var _i = 0, _a = Object.keys(dico); _i < _a.length; _i++) {
            var word = _a[_i];
            dico[word] = this.getDefinitionOf(word, dico);
        }
        return dico;
    };
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
    StringParser.prototype.parseString = function (rawString, matchesCallback, nonMatchesCallback, operationBlocksCallback, allowOverlappingMatches, parallelSet) {
        var _this = this;
        if (allowOverlappingMatches === void 0) { allowOverlappingMatches = true; }
        if (parallelSet === void 0) { parallelSet = []; }
        rawString = rawString.trim();
        if (!matchesCallback)
            matchesCallback = function () { return ''; };
        if (!nonMatchesCallback)
            nonMatchesCallback = function () { return ''; };
        if (!operationBlocksCallback)
            operationBlocksCallback = [];
        var allMatches = [];
        Object.keys(this._settings).forEach(function (lhs) {
            var replacement = _this._settings[lhs];
            lhs = lhs
                .replace(/([^\\]\w)$/, '$1\\b')
                .replace(/^(\w)/, '\\b$1')
                .replace(/\{\{:[^]+?:\}\}+/g, function (arg) {
                arg = arg.replace(/^\{\{:|:\}\}$/g, '');
                if (arg in _this._dictionnary) {
                    return _this._dictionnary[arg]
                        .replace(/(?<!\\)\((?!\?)/g, '(?:');
                }
                return arg;
            })
                .replace(/{{![A-Za-z_]*!}}/g, function (match) {
                match = match.replace(/^\{\{!|!\}\}$/g, '');
                var splittedSentence = rawString.trim().split(/\s+/);
                var potentialWords = [];
                var idx = parallelSet.indexOf(match);
                while (idx >= 0) {
                    potentialWords.push(splittedSentence[idx]);
                    idx = parallelSet.indexOf(match, idx + 1);
                }
                if (!!potentialWords.length) {
                    var res = "(?:" + potentialWords.join('|') + ")";
                    return res;
                }
                // returning impossible regex
                return '(?:(?!a)a)';
            });
            // console.log(lhs);
            var regex = new RegExp(lhs, 'gi');
            var match;
            while ((match = regex.exec(rawString)) !== null) {
                var repl = match[0]
                    .replace(new RegExp(lhs, 'gi'), replacement)
                    .replace(/\{IDX\{(\d+|&)\}\}/g, function (arg) {
                    var chara = arg.match(/\{((?:\d+|&))\}/)[1];
                    if (chara === '&') {
                        return '' + rawString.slice(0, match.index).trim().split(/\s+/).length;
                    }
                    var captureNum = Number(chara);
                    var res = lhs.replace(new RegExp("^.*?(\\((?!\\?).*?){" + (captureNum - 1) + "}\\((?!\\?)"), function (m) {
                        var regex = /(\)[?*]?|\((?:\?:)?)?(.*?)(?=\)[?*]*|\((\?:)?)/g;
                        m = m.replace(regex, '$1(?<@@@>$2)');
                        var count = 0;
                        m = m.replace(/@@@/g, function () { return 'S' + count++; });
                        return m;
                    });
                    var re = new RegExp(res, 'i');
                    var m = re.exec(rawString);
                    var out = rawString.slice(0, match.index);
                    if (!!m && !!m.groups) {
                        out += Object.values(m.groups).filter(function (v) { return !!v; }).join(' ');
                    }
                    return '' + out.trim().split(/\s+/).length;
                })
                    .replace(/\{=\{[0-9\-/*+\s]+\}\}/g, function (operation) {
                    // taking off brackets and leading zeros
                    operation = operation.replace(/[{}=]/g, '').replace(/(^|[^0-9])0+([1-9][0-9]*)[^0-9]/g, '$1');
                    return eval(operation);
                })
                    .replace(/\{o(\d+|<[\w-]+>)\{.*?\}\}+/g, function (arg) {
                    var res = arg.match(/^\{o(?:(?<number>\d+)|<(?<name>[\w-]+)>)/);
                    var opeName = res.groups.name || res.groups.number;
                    arg = arg.replace(/^\{o(?:\d+|<[\w-]+>){|\}\}$/g, '');
                    var args = arg.split(',').map(function (val) {
                        if (!isNaN(Number(val)))
                            return Number(val);
                        try {
                            return JSON.parse(val);
                        }
                        catch (e) {
                            // Not a json...
                        }
                        return val.trim();
                    });
                    if (opeName in operationBlocksCallback)
                        return operationBlocksCallback[opeName].apply(operationBlocksCallback, args);
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
        allMatches = allMatches.sort(function (a, b) {
            var res = a.start - b.start;
            if (res === 0 && allowOverlappingMatches)
                res = a.end - b.end;
            return res;
        });
        if (!allMatches.length) {
            nonMatchesCallback(rawString);
        }
        else {
            var pos = 0;
            for (var _i = 0, allMatches_1 = allMatches; _i < allMatches_1.length; _i++) {
                var match = allMatches_1[_i];
                if (allowOverlappingMatches || pos <= match.start) {
                    var nonMatch = rawString.slice(pos, match.start).trim();
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
    };
    return StringParser;
}());
exports.default = StringParser;
//# sourceMappingURL=stringParser.js.map