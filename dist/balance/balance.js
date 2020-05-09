"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Balance = /** @class */ (function () {
    function Balance(configData) {
        this.data = configData;
        this.rigging = {};
    }
    Balance.prototype.rig = function (rigWeights) {
        for (var _i = 0, _a = Object.keys(rigWeights); _i < _a.length; _i++) {
            var cat = _a[_i];
            if (cat in this.rigging)
                this.rigging[cat] += rigWeights[cat];
            else
                this.rigging[cat] = rigWeights[cat];
        }
    };
    Balance.prototype.unrig = function () {
        this.rigging = {};
    };
    Balance.prototype.categorize = function (sentence) {
        var wpc = this.getWeightDetails(sentence);
        var maxScore = 0;
        var maxCategory = '';
        for (var _i = 0, _a = Object.keys(wpc); _i < _a.length; _i++) {
            var category = _a[_i];
            if (wpc[category] > maxScore) {
                maxScore = wpc[category];
                maxCategory = category;
            }
        }
        return maxCategory;
    };
    Balance.prototype.getWeightDetails = function (sentence) {
        var weightPerCategory = {};
        for (var _i = 0, _a = Object.keys(this.data); _i < _a.length; _i++) {
            var category = _a[_i];
            if (category in this.rigging)
                weightPerCategory[category] = this.rigging[category];
            for (var _b = 0, _c = Object.keys(this.data[category]); _b < _c.length; _b++) {
                var word = _c[_b];
                var weight = this.data[category][word];
                if (!(category in weightPerCategory))
                    weightPerCategory[category] = 0;
                word = word.replace(/([^\\]\w)$/, '$1\\b');
                word = word.replace(/^(\w)/, '\\b$1');
                var flags = 'g';
                if (!/[A-Z]/.test(word))
                    flags += 'i';
                if (new RegExp(word, flags).test(sentence))
                    weightPerCategory[category] += weight;
            }
        }
        return weightPerCategory;
    };
    return Balance;
}());
exports.default = Balance;
//# sourceMappingURL=balance.js.map