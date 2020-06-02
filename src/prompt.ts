import prompts from 'prompts';
import SentenceAnalyser from './analyser/sentenceAnalyser';

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
    new SentenceAnalyser(result.sentence).createMeanings().forEach(meaning => {
        console.log('――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――');
        console.log(meaning.toString());
    });

    newSentence();
}

newSentence();
