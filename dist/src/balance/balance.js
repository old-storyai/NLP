"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Balance {
    constructor(configData) {
        this.data = configData;
        this.rigging = {};
    }
    rig(rigWeights) {
        for (const cat of Object.keys(rigWeights)) {
            if (cat in this.rigging)
                this.rigging[cat] += rigWeights[cat];
            else
                this.rigging[cat] = rigWeights[cat];
        }
    }
    unrig() {
        this.rigging = {};
    }
    categorize(sentence) {
        const wpc = this.getWeightDetails(sentence);
        let maxScore = 0;
        let maxCategory = '';
        for (const category of Object.keys(wpc)) {
            if (wpc[category] > maxScore) {
                maxScore = wpc[category];
                maxCategory = category;
            }
        }
        return maxCategory;
    }
    getWeightDetails(sentence) {
        const weightPerCategory = {};
        for (const category of Object.keys(this.data)) {
            if (category in this.rigging)
                weightPerCategory[category] = this.rigging[category];
            for (const word of Object.keys(this.data[category])) {
                const weight = this.data[category][word];
                if (!(category in weightPerCategory))
                    weightPerCategory[category] = 0;
                if (new RegExp('\\b' + word + '\\b', 'gi').test(sentence))
                    weightPerCategory[category] += weight;
            }
        }
        return weightPerCategory;
    }
}
exports.default = Balance;
//# sourceMappingURL=balance.js.map