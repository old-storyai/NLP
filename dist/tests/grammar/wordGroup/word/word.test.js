const { Word } = require('grammar/tokenizer');
describe('Word class', () => {
    it('should asssign local variables when constructed', () => {
        const testStr = 'Hi there';
        const testGrp = 'G_NN';
        const w = new Word(testStr, testGrp);
        expect(w.str).toBe(testStr);
        expect(w.group).toBe(testGrp);
    });
});
//# sourceMappingURL=word.test.js.map