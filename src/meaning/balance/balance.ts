
export default class Balance {

    /**
     * The data should look like:
     * {
     *   "category1": {
     *     "word1": weight1,
     *     "word2": weight2,
     *      ...
     *   },
     *    ...
     * }
     */
    data: object;

    /**
     * Allows to add some weight to a specific category:
     * {
     *   "category1": 50,
     *   ...
     * }
     */
    rigging: object;

    constructor(configData: object) {
        this.data = configData;
        this.rigging = {};
    }

    rig(rigWeights: object): void {
        for (const cat of Object.keys(rigWeights)) {
            if (cat in this.rigging)
                this.rigging[cat] += rigWeights[cat];
            else
                this.rigging[cat] = rigWeights[cat];
        }
    }

    unrig(): void {
        this.rigging = {};
    }

    categorize(sentence: string): string {
        const wpc = this.getWeightDetails(sentence);
        let maxScore = 0;
        let maxCategory = '';
        for ( const category of Object.keys(wpc) ) {
            if (wpc[category] > maxScore) {
                maxScore = wpc[category];
                maxCategory = category;
            }
        }
        return maxCategory;
    }

    getWeightDetails(sentence: string): object {
        const weightPerCategory = {};
        for (const category of Object.keys(this.data)) {

            if (category in this.rigging)
                weightPerCategory[category] = this.rigging[category];


            for (const word of Object.keys(this.data[category])) {
                const weight = this.data[category][word];
                if (!(category in weightPerCategory))
                    weightPerCategory[category] = 0;

                if (new RegExp('\\b'+word+'\\b', 'gi').test(sentence))
                    weightPerCategory[category] += weight;
            }
        }
        return weightPerCategory;
    }
}
