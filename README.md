# Natural Language Processing

## Installation
The NLP runs with Node and Typescript. To install, simply run;
```bash
npm install
```
And to run:
```bash
npm start
``` 

## Inner working
### Gramex
The `Gramex` is a mix of Grammar and regex.  
It allows to search for specific grammar formations in sentences, for example:
```javascript
new WordGroup("This cat is so cute!").findGrammar("RB JJ");
// Result: so cute (so = adverb/RB, cute = adjective/JJ)
```

And we can of course use more advanced regex:
```javascript
const str = "When I'm not in the house, lock all the doors and turn off the lights";
new WordGroup(str).findGrammar("( PRP| RB)? DT NN");
// Result: ["in  the house", "all the doors", "the lights"]
//           ==  === =====    === === =====    === ====== 
//           PRP  DT   NN     RB  RB   NN      DT    NN
```

### Tokenization
We use 2 different types of tokenization: the first one is a word per word tokenization (it's basically a POS tagger). For example:
```javascript
new Tokenizer().wordPerWord("Turn on the heating system");
// Will give:
{
   "Turn on": "VB",
   "the": "DT",
   "heating": "NN",
   "system": "NN"
}
```
To do so, we use [pos](https://www.npmjs.com/package/pos), which is a simple POS tagger Node module.

The second type of tokenization we use is a **word grouping tokenization**. It allows us to form noun or verb groups, based on specific **gramex rules**.  
Those rules can be found at `/data/grammar/wordGroupingRules.json`

An example of the word grouping tokenization:
```javascript
new Toknenizer().groupWords("Turn off the old stove next to the washing machine")
{
    "Turn off": "G_VV",
    "the old stove": "G_NN",
    "next to": "PRP",
    "the washing machine": "G_NN"
}
```

### Balance
To determine the nature of a noun group, we use a weighting system, handled by the class `Balance`.  
The Balance is first given a **setting**, and then a string to weight.

A **balance setting** resembles the following example:
```json
{
	"yes": {
		"definitely": 100, "most likely": 50, "probably": 20
	},
	"no": {
		"never": 100, "unlikely": 50
	}
}
``` 
And here's this setting in action:
```javascript
const setting = {/*setting above*/};
const bal = new Balance(setting);
bal.categorize('I\'ll never go there'); // no
bal.categorize('Definitely, count me in!'); // yes
bal.categorize('It\'s unlikely, I\'ll probably stay at home'); // {yes: 20, no:50} => no 
```

We can **rig** also the balance:
```javascript
bal.rig({"yes": 40});
bal.categorize('It\'s unlikely, I\'ll probably stay at home'); // {yes: 20+40, no:50} => yes 
```
This is useful in our case to infer a meaning from external elements, for example:

> "Call my mom"  

We know that the verb `call` is most likely followed by a person, so, when we weight `my mom` we can rig the balance to add weight to the `person` property



### Meaning
Each part of a sentence has a **meaning** (of the `Meaning` class).  
A Meaning is composed of multiple components:  
- `Action`
- `Time`
- `Subject`
- `Item`
- `Value`
- `Target`

Here's an example:
```javascript
const str = 'Send me a text on the 5th of july';
new SentenceAnalyser(str).createMeanings();
// result:
Meaning {
	action: Action {
		verb: 'send'
		tense: 'present'
	},
	subject: Person {
		personTitle: 'SELF'
	},
	item: Item {
		itemName: 'text'
	},
	time: Time {
		day: 5,
		month: 7
	},
	target: {},
	value: {}
}
```

### Data
For now, all the Data layer is handled by the Data class ( _src/meaning/grammar/data.ts_ ).  
The actual Data is located in the " _data_ " directory, as `JSON` files.
