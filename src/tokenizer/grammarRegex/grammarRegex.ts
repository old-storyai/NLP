

export default class GrammarRegex {

    regex: string;
    constructor(str: string) {
        this.regex = str;
    }

    /**
     * The tokens parameter should following the example bellow
     *  [
     *    ["Give", "VB"],
     *    ["me",   "PRP"],
     *    ["a",    "DT"],
     *    ["call", "NN"],
     *  ]
     */
    test(tokens: [[string, string]]): boolean {
        const synth = tokens.map(([word, grp]) => grp).join(' ');
        return new RegExp(this.regex).test(synth);
    }

    /**
     * Will return the matches in the following way:
     * For the sentence "The big dog and the cat are swimming", and the regex /DT( JJ)? NN/
     * [
     *   [0, 2], // The big dog
     *   [4, 5]  // the cat
     * ]
     */
    search(tokens: [[string, string]]): [[number, number]] {
        let synth = tokens.map(([word, grp]) => grp).join(' ');
        synth = ` ${synth} `;
        synth = synth.replace(new RegExp(' '+this.regex+' ', 'g'), match => {
            return `(${match})`;
        });
        synth = synth
            .replace(/\( /g, ' (')
            .replace(/ \)/g, ') ')
            .trim();
        console.log('synth: ', synth)

        const parts = synth.split(/\s+/);

        const matches = [];
        let inMatch = false;
        for (let i=0 ; i<parts.length ; i++) {
            if (/^\(/g.test(parts[i])) {
                // Beggining of a match
                inMatch = true;
                matches.push([i]);
            }

            if (/\)$/g.test(parts[i])) {
                // End of match
                matches[matches.length-1].push(i);
                inMatch = false;
            }
        }
        return matches as [[number, number]];
    }
}
