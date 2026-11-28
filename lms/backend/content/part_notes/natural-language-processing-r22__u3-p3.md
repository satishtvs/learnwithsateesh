### Recap: what you need from Part Two
- Reranking: A second model picks among the n best trees
- Log-linear model: Weights times features, then normalise
- Bracket scores: Precision, recall and F measure
- Attachment scores: UAS and LAS for dependency trees

### Today in five steps
- Word order: Where the verb goes
- Free word order: Many orders, one meaning
- Rich morphology: More forms, sparser data
- Finding words: Tokens and segmentation
- Crossing arcs: Non-projective trees and treebanks

### Where does the verb go?
- English: subject, verb, object
- Hindi: subject, object, verb
- Telugu: also subject, object, verb

### Verb in the middle or at the end
- The verb sits between subject and object | The verb comes at the end of the clause
- Verb phrase: verb, then object | Verb phrase: object, then verb
- Prepositions: in the books | Postpositions: kitaabon mein
- A grammar learned from English | Needs its own rules and treebank

### Free word order: how many orders?
- 2 | 2
- 3 | 6
- 4 | 24
- 5 | 120
- 6 | 720

### Six orders of three chunks
- Chunks: Raam ne, aam, khaayaa
- Every order needs its own rule
- 3 chunks: 6 rules, 6 chunks: 720

### Who did what? Position or marker
- English: swap the nouns, new meaning
- Hindi: ne marks the doer, ko the receiver
- Swap the chunks, same meaning

### More forms per word
- Simulation: 3000 roots, 20000 tokens
- A root has 2, 3 or 4 forms
- More forms, more different types

### The cost of many forms
- 3,635: Types with 2 forms per root
- 4,445: Types with 3 forms per root
- 5,050: Types with 4 forms per root
- 58.7%: Types seen once with 4 forms; 47.5% with 2

### The verb ending carries information
- Hindi vah means he or she
- The verb ending shows the gender
- The value for parsing: features

### Four languages at a glance
- English | S V O | position | yes
- Hindi | S O V | markers: ne, ko | yes
- Telugu | S O V | glued endings | yes
- Chinese | S V O | position | no

### Finding the words
- English: spaces give 3 tokens
- Telugu: 1 token, 3 morphemes
- No spaces: 4 ways to split

### Splitting text without spaces
- Try every split into dictionary words
- Score each split by word counts
- Best: the table down there

### Errors travel down the pipeline
- Split into words: Assumed 95 right in 100
- Find morphemes: Assumed 93 right in 100
- Parse: Assumed 90 right in 100
- Whole pipeline: 0.95 times 0.93 times 0.90 is 0.80

### Arcs that cross
- An arc joins a word to its head
- Red arcs cross: non-projective
- Reordering removes the crossing

### Projective versus non-projective
- No arcs cross | At least two arcs cross
- Every head covers a continuous span | A head's words have a gap
- Standard shift-reduce parsers build it | Needs extra operations or other algorithms
- Typical for English | More common with free word order

### Treebanks across languages
- Large treebanks: English and a few other languages
- Medium treebanks: Hindi has a dependency treebank
- Small treebanks: Telugu has only a small one
- Universal Dependencies: One shared scheme for many languages

### Coping with many languages
- Morphological features: Gender, number and case as features
- Careful segmentation: Split words before or while parsing
- Dependency grammar: Fits free word order
- Shared treebanks: Universal Dependencies and transfer

### Exam tips and important questions
- Word order and parsing | SVO versus SOV, head direction, own rules per language
- Free word order | Markers show roles; factorial number of orders
- Rich morphology | More types, sparse data, agreement features
- Draw a sentence | Crossing arcs, non-projective; extra parser operations

### Summary
- Word order: S V O or S O V: rules differ
- Free word order: Markers show roles; many orders
- Rich morphology: More types, sparser data
- Crossing arcs: Non-projective trees; few treebanks

### References
- D. Bikel and I. Zitouni (eds.), Multilingual Natural Language Processing Applications, Pearson
- Reference book: D. Jurafsky and J. Martin, Speech and Language Processing
- Reference book: T. Siddiqui and U. Tiwary, Natural Language Processing and Information Retrieval
- Explanations, examples and numbers in this video are original
