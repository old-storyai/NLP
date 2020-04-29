import path from 'path';

import SentenceAnalyser from './meaning/sentenceAnalyser';
import * as Normalizer from './language/normalizer';
export {SentenceAnalyser, Normalizer};

const globalAny = global as any;

globalAny.BASEPATH = path.join(__dirname, '../');

