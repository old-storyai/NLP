"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sentenceAnalyser_1 = __importDefault(require("./meaning/sentenceAnalyser"));
let str = '';
// str = 'Will it be warmer than 70 degrees near the Golden Gate bridge after 5pm the day after tomorrow?';
// str = 'When the fridge doors from the kitchen next to the living room in August or during the high season are left widely open, send me a text message on my smartphone using the slack app';
// str = 'Call my mom to tell her that I feel sick today';
// str = 'I feel so good that I could explode from happiness right now';
// str = 'I will be there with my wife tomorrow night';
// str = 'Tell me when the sun sets on the 4th of july 2018';
// str = 'Speak up young boy, if you want everybody here to hear you';
// str = 'Come to my place as soon as you have this message';
// str = 'You have been found red handed';
// str = 'Pour me a good old cup of coffee while you\'re at it';
// str = 'Tell the old lady from across the street to give a call to the school';
// str = 'I remember she told me that she jumped into the river once... barefoot';
// str = 'she walked without looking and tumbled into the Seine';
// str = 'The water was freezing, she spent a month sneezing, but she said she\'d  do it again';
// str = 'Me and the son of the old lady who used to take care of me, we\'d go on adventures together';
// str = 'Turn the heater on when I leave;
// str = 'the boy who eats chocolate lives on the other side of the street');
// str = 'Send me a text when the temperature drops lower than 20 degrees outside');
// str = 'Turn off the old stove next to the washing machine';
str = 'Send me a text on the 5th of july';
new sentenceAnalyser_1.default(str).createMeanings();
//# sourceMappingURL=index.js.map