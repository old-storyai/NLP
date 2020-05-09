"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var StringOperations = /** @class */ (function () {
    function StringOperations(data) {
        this._settings = data;
    }
    StringOperations.prototype.parseString = function (rawString, matchesCallback, nonMatchesCallback, operationBlocksCallback) {
        var _this = this;
        if (!nonMatchesCallback)
            nonMatchesCallback = function () { return ''; };
        if (!operationBlocksCallback)
            operationBlocksCallback = [];
        var idx = 0;
        var matches = [];
        Object.keys(this._settings).forEach(function (word) {
            var replacement = _this._settings[word];
            rawString = rawString.replace(new RegExp(word, 'gi'), function (match) {
                matches[idx] = [match, ''];
                var repl = match
                    .replace(new RegExp(word, 'gi'), replacement)
                    .replace(/\{=\{[0-9\-/*+]+\}\}/g, function (operation) {
                    operation = operation.replace(/[{}=]/g, '');
                    return eval(operation);
                })
                    .replace(/\{o\d+\{[^}]+\}\}/, function (arg) {
                    var opeNum = Number(arg.match(/^\{o(\d+)/)[1]);
                    arg = arg.replace(/^\{o\d+\{|\}\}/g, '');
                    if (opeNum in operationBlocksCallback)
                        return operationBlocksCallback[opeNum](arg);
                    return arg;
                });
                matches[idx][1] = repl;
                return "||::" + idx++ + "::||";
            });
        });
        rawString.split('||').forEach(function (part) {
            if (!part.trim().length)
                return;
            if (/::\d+::/.test(part)) {
                var idx_1 = Number(part.replace(/:/g, ''));
                matchesCallback.apply(void 0, matches[idx_1]);
            }
            else {
                nonMatchesCallback(part);
            }
        });
    };
    return StringOperations;
}());
exports.default = StringOperations;
//# sourceMappingURL=replacer.js.map