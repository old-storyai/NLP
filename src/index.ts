import prompt from 'prompt';
import SentenceAnalyser from './meaning/sentenceAnalyser';

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
// str = 'The boy who used to eat white hazelnut chocolate lives on the other side of the street';
// str = 'I\'m used to eat chocolate all day long';
// str = 'I\'m the president of the United States of America';
// str = 'Send me a message on Slack when the temperature drops lower than 20 degrees outside';
// str = 'Send me a text on the 5th of july';
// str = 'Give Baptiste Zorzi a call on the 5th of december';
// str = 'Turn off the old stove next to the washing machine';
// str = 'Turn the heater on when I leave the house';
// str = 'Send a Slack message to Frederick';
// str = 'Send me a text when the fridge door is opened for more than 5 minutes';
// str = 'Was it raining on the 18/02/1997 at 18:15?';
// str = 'send me a text at 6pm on the 2nd monday after christmas 2021';
str = 'send me a text Every monday for the next 6 months';
// str = 'Send me a message 6 months after last christmas';
// str = 'Send me a message 7 days before Baptiste\'s birthday';
// str = 'Send me a message on the 1st monday of each month';
// str = 'Send me a message 3 days before next christmas';
// str = 'Send me flowers every christmas at noon for 8 years from 2028';
// str = 'Send me flowers in 5 sundays at 6:09';
// str = 'Was it raining from christmas 1997 at 18:25 for 18 days and 2 hours every minute';
// str = 'send me texts every christmas at 18:25 for 18 days and 2 hours';

new SentenceAnalyser(str).createMeanings().forEach(meaning => {
    console.log('――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――');
    console.log(meaning.toString());
});

if (process.argv.includes('--interactive'))
    newSentence();

function newSentence() {
    prompt.get('sentence', function(err, result) {
        if (err) throw new Error(err);

        new SentenceAnalyser(result.sentence).createMeanings().forEach(meaning => {
            console.log('――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――');
            console.log(meaning.toString());
        });

        newSentence();
    });
}
