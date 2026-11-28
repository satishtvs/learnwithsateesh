### Recap: what Part One left open
- Constituents: Groups of words acting as one unit
- A grammar: Rules from S down to the words
- Two trees: The PP example had 2 parses
- An open question: Which tree is the right one?

### Today in five steps
- What a treebank is: Real sentences with trees
- Annotation: Labels, tags and brackets
- Grammar from trees: Read the rules off every node
- Probabilities: Count, then divide
- Other languages: Treebanks beyond English

### What is a treebank?
- Real text: Sentences from newspapers, books or the web
- Checked trees: One parse per sentence, checked by people
- Tags and labels: Word classes and phrase labels
- Two jobs: Train a parser and test a parser

### What annotators add
- Phrase labels: Brackets group words: S, NP, VP, PP
- Part of speech tags: One tag per word: DT, NN, VBD
- The tokens: Text cut into words, as in Unit I

### Our mini treebank
- A mini treebank: 12 trees, 76 tokens
- 8 PPs: 6 on a VP, 2 on an NP
- Original sentences, for illustration

### Trees written as brackets
- A bracket opens with its label
- A word sits inside its tag bracket
- Nested brackets are subtrees

### Reading brackets with a stack
- Read the text from left to right
- An opening bracket pushes a node on the stack
- A closing bracket pops it

### Reading the rules off the trees
- Every node with its children is one rule
- A tag with its word is a word rule
- This tree: 14 uses, 13 different rules

### Counting the rules
- 16 different rules in 12 trees
- 73 rule uses in all
- A determiner and a noun: 17 times

### From counts to probabilities
- 6: Times the rule VP to VP PP occurs
- 18: Times a VP node occurs
- 0.333: Probability of the rule: 6 divided by 18
- 1: All VP rules together add up to 1

### Each left side shares probability 1
- The data: 34 noun phrase nodes, 18 verb phrase nodes
- The segments of a bar add up to 1
- Common rules get large probabilities

### Probability of a whole tree
- Multiply the probabilities of all its rules
- Word rules count too
- Tree A: 8.83 times 10 to the minus 5

### Which tree does the PCFG prefer?
- Only one rule differs between the trees
- Tree A is 5.67 times as probable
- A warning: it ignores the words

### Strengths and limits of a PCFG
- Learned from real trees, no hand-written rules | Needs a big, costly treebank
- Probabilities rank the many parses | Ignores the words inside a rule
- Simple counting, easy to compute | Assumes the rules are independent
- Works for any language with a treebank | A new domain changes the counts

### Treebanks for other languages
- English: Penn Treebank: newspaper text
- Czech: Prague Dependency Treebank: dependency trees
- Chinese and Arabic: Penn-style treebanks
- Hindi and Telugu: In Universal Dependencies; Telugu is small

### Exam tips and important questions
- Treebank: definition, uses | Parsed text; Penn Treebank; train and test
- Bracket notation | Write one tree in brackets; label, tag, word
- Grammar from a treebank | Read rules off nodes; count them
- Rule probability in a PCFG | Count of rule divided by count of left side
- Probability of a parse | Product of rule probabilities; compare trees

### Summary
- Treebank: Real sentences with hand-checked trees
- Grammar: A rule for every node: 16 here
- Probability: Rule count divided by left side count
- Choosing: The product picked tree A, 5.67 times

### References
- D. Bikel and I. Zitouni (eds.), Multilingual Natural Language Processing Applications, Pearson
- Reference book: D. Jurafsky and J. Martin, Speech and Language Processing
- Reference book: T. Siddiqui and U. Tiwary, Natural Language Processing and Information Retrieval
- Explanations, examples and numbers in this video are original
