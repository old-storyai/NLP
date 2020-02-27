import Tokenizer from './tokenizer/tokenizer';


const t = new Tokenizer();

// const res = t.subSentences('Will it be warmer than 70 degrees near the Golden Gate bridge after 5pm the day after tomorrow?');
const res = t.subSentences('When the fridge doors from the kitchen next to the living room in August or during the high season are left widely open, send me a text message on my smartphone using the slack app');
// const res = t.subSentences('Call my mom to tell her that I feel sick today');
// const res = t.subSentences('I feel so good that I could explode from happiness right now');

console.log('res: ', res);
