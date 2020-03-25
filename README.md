
# Natural Language Processing

## Installation
The NLP runs with Node and Typescript. To set it up, simply run;
```bash
npm install
```

To launch it:
```bash
npm start
```

To provide input sentences via the standard input:
```bash
npm start -- --interactive
```

To run the tests:
```bash
npm run test
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
We use 2 different types of tokenization: the first one is a word per word tokenization (*it's basically a POS tagger*).  
For example:
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
Those rules can be found at `/data/grammar/wordGroupingRules.sp.json`

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
For now, all the Data layer is handled by the Data class ( _src/data/data.ts_ ).  
The actual Data is located in the " _data_ " directory, as `JSON` files.  


There is a variety of files in the data folder, but they all follow one of the 3 following formats:
- **Balance** (*\*.bal.json*)
- **String Parser** (*\*.sp.json*)
- **Tree Parser** (*\*.tp.json*)

Each format has a class dedicated to reading it and parsing the file. The following section will describe those parsers more in depth.


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


### Tree Parser
The tree files respects the following format:
```json
{
    "more": [
        "more", "above", "hotter", "higher", "warmer"
    ],
    "less": [
        "below", "under", "colder", "less", "lower"
    ]
}
```
It allows to find a parent by applying the children as regex to a sentence:
```javascript
new TreeParser(data).findParentOfMatched("the temperature is under 15 degrees");
// result: "less"
```

To find a parent by testing a given regex on the children:
```javascript
new TreeParser(data).findParentOfMatching(/above/gi);
// result: "more"
```

You can also retrieve children by searching the parents in the same fashion:
```javascript
new TreeParser(data).findChildrenOfMatched("I need more gaz!"); // ["more", "above"...]
new TreeParser(data).findChildrenOfMatching(/less/gi); // ["below", "under", ...]
```

### String Parser

The String parser is the most powerful, but also the most complicated of the 3 file formats.

Here's an example of the String parser file format: (part of the _timeComponents.sp.json_ file)
```json
1| {
2|     "\\d+h(\\d+)": "m=$1",
4|     "(\\d+)(:\\d+)?PM": "h={={$1+12}}",
5|     "this month": "M={o0{month, 0}}",
6| }
``` 

Let's analyse this line by line, and discover the features along the way:
```json
2|    "\\d+h(\\d+)": "m=$1",
```
The fist thing we can see here, is that the **key supports regex**. It will match a specific part of the sentence, and give you its **transformation**.  
Here, the transformation is `m=$1`, as in a `replace`, the $1 will be replaced by the captured group.

So, for example if we apply the above rule to `"18h21"`, the transformation will be `"m=21"`
<hr/>

Let's look at the next line:
```json
4|     "(\\d+)(:\\d+)?PM": "h={={$1+12}}",
```
Here, we find a new syntax: `{={...}}`. This syntax is used to make calculations.  This will be replaced by the result of the operation.

So if we apply this rule to `"6:18PM"`, two things will happen:
- The $1 will be replaced by the captured value: `"h={={6+12}}"`
- The calculation will be made: `"h=18"`

<hr/>

Now the final line:
```json
5|     "this month": "M={o0{month, 0}}",
```

We find here yet another syntax: `{o0{...}}`. This allows the user to define his own operations. In this example, the user defined a function, which takes 2 arguments: a `unit`("*month*"), and a `number`(*0*).

In this example, let's imagine that the function is just a concatenation of the unit and the number. If applied to `"this month"`, this rule will give the transformation `"M=month0"`

<hr/>

Here's an example of usage for the StringParser:

```javascript
new StringParser(data)
    .parseString(
        "Send me flowers at 6:32PM this month",
        (match, transformation) => {
            // This function is called when a
            // rule is respected
        },
        (nonMatch) => {
            // This function is called with all 
            // the parts that don't match any rule
        },
        [
            (unit, num) => {
                // This is a custom operation function
                return unit + num;
            }
        ]
    );
```
