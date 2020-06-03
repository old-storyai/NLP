import prompts from 'prompts';
import SentenceAnalyser from './analyser/sentenceAnalyser';
import ContextAnalyser from './contextAnalyser';

const question = [
    {
        type: 'text',
        name: 'sentence',
        message: 'Write a sentence'
    }
];

async function newSentence() {
    const result = await prompts(question);
    console.log(result);
    console.log('Method 1:');
    new SentenceAnalyser(result.sentence).createMeanings().forEach(meaning => {
        console.log('――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――');
        console.log(meaning.toString());
    });
    console.log('\n====================================================================================================\n');
    console.log('Method 2:');
    new ContextAnalyser(result.sentence).analyse().groups.forEach(elem => {
        console.log(elem.toString());
    });

    newSentence();
}

newSentence();
