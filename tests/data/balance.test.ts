
const Balance = require('data/balance').default;

const sampleSetting = {
    'yes': {
        'definitely': 100,
        'yes': 70,
        'probably': 40,
    },
    'no': {
        'never': 100,
        'no': 70,
        'don\'t': 40,
    }
};

const sampleSettingRegex = {
    'excited': {
        '[A-Z]{3,}': 60,  // YAAAAY
        'wo+w': 80  // wooooow
    },
    'dissapointed': {
        'me+h': 80, // Meeh
    },
    'angry': {
        '!{2,}$': 60, // ??!!?!?
        '[A-Z]{2,}': 50  // AAAAH
    }
};

describe('Balance class', () => {

    it('should assign local variables when constructed', () => {
        const b = new Balance(sampleSetting);

        expect(b.data).toBe(sampleSetting);
    });



    describe('Normal Data', () => {
        it('should properly categorize with normal Data', () => {
            const b = new Balance(sampleSetting);

            expect(b.categorize('No, I\'ll never go there')).toBe('no');
            expect(b.categorize('I\'ll definitely go to the party')).toBe('yes');
            expect(b.categorize('No, I\'ll probably stay at home')).toBe('no');
        });

        it('should get right weights with normal data', () => {
            const b = new Balance(sampleSetting);

            expect(b.getWeightDetails('No, I\'ll never go there')).toStrictEqual({'no': 170, 'yes': 0});
            expect(b.getWeightDetails('I\'ll definitely go to the party')).toStrictEqual({'yes': 100, 'no': 0});
            expect(b.getWeightDetails('No, I\'ll probably stay at home')).toStrictEqual({'no': 70, 'yes': 40});
        });
    });


    describe('RegExp', () => {
        it('should properly categorize with regex Data', () => {
            const b = new Balance(sampleSettingRegex);

            expect(b.categorize('YAAAAY we\'re going to DisneyLand!')).toBe('excited');
            expect(b.categorize('Meeeeeeh, this movie was not as good as I expected.')).toBe('dissapointed');
            expect(b.categorize('I\'M SUPER ANGRY!!!!!')).toBe('angry');
        });


        it('should get right weights with regex data', () => {
            const b = new Balance(sampleSettingRegex);

            expect(b.getWeightDetails('YAAAAY we\'re going to DisneyLand!')).toStrictEqual({'excited': 60, 'dissapointed': 0, 'angry': 50});
            expect(b.getWeightDetails('Meeeeeeh, this movie was not as good as I expected.')).toStrictEqual({'excited': 0, 'dissapointed': 80, 'angry': 0});
            expect(b.getWeightDetails('I\'M SUPER ANGRY!!!!!')).toStrictEqual({'excited': 60, 'dissapointed': 0, 'angry': 110});
        });
    });

    describe('Rigging', () => {

        const b = new Balance(sampleSetting);

        it('Rigged balance should behave as expected', () => {
            b.rig({ 'yes': 50 });
            expect(b.categorize('No, I\'ll never go there')).toBe('no');
            expect(b.categorize('I\'ll definitely go to the party')).toBe('yes');
            expect(b.categorize('No, I\'ll probably stay at home')).toBe('yes');

            b.rig({ 'no': 500 });
            expect(b.categorize('No, I\'ll never go there')).toBe('no');
            expect(b.categorize('I\'ll definitely go to the party')).toBe('no');
            expect(b.categorize('No, I\'ll probably stay at home')).toBe('no');
        });

        it('Unrigging a balance should work', () => {
            b.unrig();
            expect(b.categorize('No, I\'ll never go there')).toBe('no');
            expect(b.categorize('I\'ll definitely go to the party')).toBe('yes');
            expect(b.categorize('No, I\'ll probably stay at home')).toBe('no');
        });
    });
});

