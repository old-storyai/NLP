import Tokenizer from './tokenizer/tokenizer';


const t = new Tokenizer();

t.subSentences('Will it be warmer than 70 degrees near the Golden Gate bridge after 5pm the day after tomorrow?');
t.subSentences('When the fridge doors from the kitchen next to the living room in August or during the high season are left widely open, send me a text message on my smartphone using the slack app');
t.subSentences('Call my mom to tell her that I feel sick today');
t.subSentences('I feel so good that I could explode from happiness right now');
t.subSentences('I will be there with my wife tomorrow night');
t.subSentences('Tell me when the sun sets on the 4th of july 2018');
t.subSentences('Speak up young boy, if you want everybody here to hear you');
t.subSentences('Come to my place as soon as you have this message');
t.subSentences('You have been found red handed');
t.subSentences('Pour me a good old cup of coffee while you\'re at it');
