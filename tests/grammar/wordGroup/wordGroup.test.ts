// const {Word, WordGroup} = require('grammar/wordGroup/wordGroup');
import {Word, WordGroup} from 'grammar/wordGroup/wordGroup';

const sampleSentence = [
    new Word('It', 'PRP'),
    new Word('\'s', 'VB'),
    new Word('too', 'RB'),
    new Word('hot', 'JJ'),
    new Word('in', 'IN'),
    new Word('there', 'RB'),
    new Word('!', '!'),
];

describe('WordGroup class', () => {

    it('should assign local variables when constructed', () => {
        const ws = [new Word('Hey', '')];
        const wg = new WordGroup(ws, 'G_GG');

        expect(wg.tag).toBe('G_GG');
        expect(wg.words).toBe(ws);
    });


    describe('Grammar representation', () => {
        function itRepresentsGrammar(
            testName: string,
            wg: WordGroup, 
            expectedRepresentation: string
        ) {
            it('grammarRepresentation Getter => '+testName, () => {
                expect(wg.grammarRepresentation.trim()).toBe(expectedRepresentation.trim());
            });
        }

        itRepresentsGrammar( 
            'Without Subgroups',
            wordgrp`It: PRP | 's: VB | a: DT | nice: JJ | dress: NN`,
            'PRP VB DT JJ NN'
        );
        itRepresentsGrammar( 
            'With Subgroups',
            wordgrp`It: PRP | 's: VB | a: DT | nice: JJ | dress: NN`.tokenize({'G_NN': [' DT JJ NN']}),
            'PRP VB G_NN'
        );
    });

    describe('Gramex', () => {
        it('should find a given simple gramex', () => {
            const wg = new WordGroup(sampleSentence);

            expect(wg.findGrammar(' PRP VB RB')).toStrictEqual([[0,2]]);
        });

        it('should find a given complex gramex', () => {
            const wg = new WordGroup(sampleSentence);

            expect(wg.findGrammar('( PRP| JJ| VB)+( IN)?')).toStrictEqual([[0,1], [3,4]]);
        });
    });



    describe('tokenization', () => {
        function itTokenizes(
            testName: string,
            wg: WordGroup,
            gramexRules: {[tag:string]: string[]},
            expectedRepresentation: string
        ) {
            it('function tokenize() => '+testName, () => {
                expect(wg.tokenize(gramexRules).grammarRepresentation.trim()).toBe(expectedRepresentation.trim());
            });
        }

        itTokenizes(
            'No regex',
            wordgrp`It: PRP | 's: VB | a: DT | nice: JJ | dress: NN`,
            { 'G_NN': [' DT JJ NN'] },
            'PRP VB G_NN');

        itTokenizes(
            'With regex - no matches',
            wordgrp`It: PRP | 's: VB | a: DT | nice: JJ | dress: NN`,
            { 'G_NN': ['( DT)+( JJ)*( NN){2}'] },
            'PRP VB DT JJ NN');

        itTokenizes(
            'With regex - with matches',
            wordgrp`It: PRP | 's: VB | a: DT | nice: JJ | old: JJ | dress: NN | dress: NN | dress: NN`,
            { 'G_NN': ['( DT)+( JJ)*( NN){2}'] },
            'PRP VB G_NN NN');

        itTokenizes(
            'With regex - multiple tags',
            wordgrp`It: PRP | 's: VB | a: DT | nice: JJ | old: JJ | dress: NN | dress: NN | dress: NN`,
            {
                'G_NN': ['( DT)+( JJ)*( NN){2}'] ,
                'G_VB': ['( PRP)?( VB[ZS]?)+'] 
            },
            'G_VB G_NN NN');

        itTokenizes(
            'With regex - multiple regex alternatives',
            wordgrp`It: PRP | 's: VB | a: DT | nice: JJ | old: JJ | dress: NN | or: CC | a: DT | costume: NN`,
            {
                'G_NN': ['( DT)+( JJ)*( NN){2}', '( CC| DT)* NN'] ,
                'G_VB': ['( PRP)?( VB[ZS]?)+'] 
            },
            'G_VB DT JJ JJ G_NN G_NN');
    });


    describe('wordCount()', () => {
        it('Should count the right number of words - Without sub-groups', () => {
            const wg = wordgrp`It: PRP | 's: VB | a: DT | nice: JJ | dress: NN`;
            expect(wg.countWords()).toBe(5);
        });

        it('Should count the right number of words - With sub-groups', () => {

            const wg = wordgrp`It: PRP | 's: VB | a: DT | nice: JJ | dress: NN`;
            wg.tokenize({ 'G_NN': [' DT JJ NN'] });

            // Will give 'PRP VB G_NN'

            expect(wg.countWords()).toBe(5);
        });
    });

    it('Should Append / Prepend properly', () => {
        const wg = wordgrp`It: PRP | 's: VB | a: DT | nice: JJ | dress: NN`;
        const w = new Word('test', 'TST');

        wg.prepend([w]);
        expect(wg.grammarRepresentation.trim()).toBe('TST PRP VB DT JJ NN');

        wg.append([w]);
        expect(wg.grammarRepresentation.trim()).toBe('TST PRP VB DT JJ NN TST');
    });
});


function wordgrp(rawIn: TemplateStringsArray): WordGroup {
    if (rawIn.length > 1) throw new Error('don\'t know how to interpolate');

    return new WordGroup(
        rawIn[0]
            .trim()
            .split(/\s*[\r\n|]+\s*/)
            .map(line => {
                const [str, tag] = line.split(':');
                return new Word(str.trim(), tag.trim());
            })
    );
}
