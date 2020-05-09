"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var StringParser = /** @class */ (function () {
    function StringParser(data) {
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
    StringParser.prototype.parseString = function (rawString, matchesCallback, nonMatchesCallback, operationBlocksCallback, allowOverlappingMatches) {
        var _this = this;
        if (allowOverlappingMatches === void 0) { allowOverlappingMatches = true; }
        rawString = rawString.trim();
        if (!matchesCallback)
            matchesCallback = function () { return ''; };
        if (!nonMatchesCallback)
            nonMatchesCallback = function () { return ''; };
        if (!operationBlocksCallback)
            operationBlocksCallback = [];
        var allMatches = [];
        Object.keys(this._settings).forEach(function (word) {
            var replacement = _this._settings[word];
            word = word.replace(/([^\\]\w)$/, '$1\\b');
            word = word.replace(/^(\w)/, '\\b$1');
            var regex = new RegExp(word, 'gi');
            var match;
            while ((match = regex.exec(rawString)) !== null) {
                var repl = match[0]
                    .replace(new RegExp(word, 'gi'), replacement)
                    .replace(/\{=\{[0-9\-/*+\s]+\}\}/g, function (operation) {
                    // taking off brackets and leading zeros
                    operation = operation.replace(/[{}=]/g, '').replace(/(^|[^0-9])0+([1-9][0-9]*)[^0-9]/g, '$1');
                    return eval(operation);
                })
                    .replace(/\{o\d+\{[^]+?\}\}+/g, function (arg) {
                    var opeNum = Number(arg.match(/^\{o(\d+)/)[1]);
                    arg = arg.replace(/^\{o\d+\{|\}\}$/g, '');
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
                    if (opeNum in operationBlocksCallback)
                        return operationBlocksCallback[opeNum].apply(operationBlocksCallback, args);
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