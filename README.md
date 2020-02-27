# Natural Language Processing


# Data

Various data files exist, to help with the language processing, here's their roles:

- __breakExceptions.json__  
  This contains mandatory breaks for specific word formations in a sentence, for example:  
  ```
  "I   will be there with my   wife tomorrow night"
  PRP MD   VB EX    IN   PRP$ NN   NN       NN
  ```
  In this sentence, the normal behaviour would group `my wife tomorrow night`, 
  when what we want is `my wife` `tomorrow night`.  
  So we can add a rule as follow:
  ```
  "!tomorrow"
  ```
  This says that there __HAS__ to be a group break before tomorrow
