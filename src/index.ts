
import * as fs from 'fs';
import Tokenizer from './tokenizer/tokenizer';


const t = new Tokenizer();

// const res = t.subSentences("Will it be warmer than 70 degrees near the Golden Gate bridge after 5pm the day after tomorrow");
const res = t.subSentences("When the fridge doors from the kitchen next to the living room in August or during the high season are left widely open, send me a text message on my smartphone using the slack app");
// const res = t.subSentences("Call my mom to tell her that I feel sick today");
console.log('res: ', res)


// const stopWords = JSON.parse(fs.readFileSync('./data/stopWords.json').toString());
// // let sentence = "Call me an uber as soon as the sun rises";
// let sentence = "When my uber driver gets to my place, send me a text";
// console.log(sentence);

// const nonSplits = JSON.parse(fs.readFileSync('./data/nonSplits.json').toString());
// nonSplits.forEach(ns => {
//     sentence = sentence.replace(
//         new RegExp(ns),
//         match => match.replace(/\s+/g, '@')
//     );
// });
// const parts = sentence.split(/[^\w@]+/);

// // parts = parts.filter( p => !stopWords.includes(p) );

// let out = [''];
// parts.forEach(part => {
//     out[out.length-1] += ' ' + part;
//     if (!stopWords.includes(part)) {
//         out.push('');
//     }
// });
// out = out.map(part => part.replace(/@/g, ' '));

// import Balance from './balance'
// const balanceData = JSON.parse(fs.readFileSync('./data/weights/npl/chunks.json').toString());
// const b = new Balance(balanceData);

// out.forEach(piece => {
//     piece = piece.trim();
//     console.log(b.categorize(piece) + ' => ' + piece);
// })
