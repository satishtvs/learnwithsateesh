### Recap: what you need from Unit II
- Context free grammar: Rules rewrite a symbol into symbols
- Parse tree: Records which rules built the sentence
- Ambiguity: One sentence, several trees
- Probabilistic rules: Every rule carries a probability

### Today in five steps
- Score a parse: Multiply the rule probabilities
- Find the limits: Where the grammar is blind
- Add head words: Lexicalization of the rules
- Generative view: Explain how the words were produced
- Discriminative view: Learn which tree fits the words

### The ambiguity again
- Parse A: the phrase modifies the verb
- Parse B: the phrase modifies the noun
- Both trees obey the grammar

### Score a parse: multiply the rules
- Tree probability = product of rule probabilities
- Parse A: 14 rules, 0.000073
- Parse B: 14 rules, 0.000048

### Three sentences, one answer
- saw the man with a telescope | 73 | 48 | 1.5
- ate the pizza with the olives | 109 | 73 | 1.5
- ate the pizza with a fork | 73 | 48 | 1.5

### Three limits of a plain PCFG
- Blind to words: Choices ignore which words appear
- Independence: Every rule is chosen alone
- One probability: A rule costs the same everywhere

### The grammar never looks at the noun
- PCFG: 0.60 for every sentence
- Counts: anywhere from 0.00 to 1.00
- The noun carries the evidence

### Head words travel up the tree
- Head: the most important word of a phrase
- A phrase takes the head of its main child
- Heads move up, level by level

### Head rules
- S | its verb phrase | S(saw)
- VP | its verb, or the VP within | VP(saw)
- NP | its noun, or the NP within | NP(man)
- PP | its preposition | PP(with)

### A lexicalized parse
- Every label is a phrase plus its head word
- The word saw rises to the top
- Rules now mention the words

### The price of head words
- 7: Plain rules used by our three trees
- 16: Lexicalized rules for the same trees
- 60: Attachment examples we counted
- 1 of 5: Test nouns never seen: chopsticks

### From counts to probabilities
- Blue: verb attachment, green: noun attachment
- Tools such as fork and knife go to the verb
- Toppings such as olives and hat go to the noun

### Backoff: a fallback for rare cases
- Specific case: Use the counts for that noun
- First fallback: Counts for the verb alone
- Final fallback: The plain grammar value 0.60

### Two ways to model a parse
- Generative: the tree first, then the words
- Discriminative: the words first, then the tree
- Both can use head words

### Generative versus discriminative
- Joint probability of tree and words | Chance of the tree given the words
- Trained by counting and dividing | Trained by adjusting weights
- Each feature needs its own story | Overlapping features are easy to add
- P C F G, lexicalized models | Logistic regression, reranking

### A discriminative model learns
- Features: one flag per verb and per noun
- Weights start at zero: every chance is 0.50
- 400 epochs: 56 of 60 examples correct

### Five test cases, four models
- ate, with olives | 0.60 | 0.00 | 0.12 | 0.18
- ate, with fork | 0.60 | 1.00 | 0.83 | 0.82
- saw, with telescope | 0.60 | 0.67 | 0.47 | 0.58
- saw, with hat | 0.60 | 0.00 | 0.10 | 0.17
- ate, with chopsticks | 0.60 | 0.48 | 0.45 | 0.51

### Exam tips and important questions
- If asked how a PCFG scores a parse | Product of rule probabilities; worked example
- Limits of a PCFG | Blind to words, independence, one probability
- Lexicalization | Head words, head rules, sparse data, backoff
- Generative versus discriminative | Joint versus conditional; counting versus weights

### Summary
- Tree probability: Product of rule probabilities
- PCFG limit: Blind to words, rules chosen alone
- Lexicalization: Head words in labels; backoff for sparse data
- Two model types: Generative or discriminative

### References
- D. Bikel and I. Zitouni (eds.), Multilingual Natural Language Processing Applications, Pearson
- Reference book: D. Jurafsky and J. Martin, Speech and Language Processing
- Reference book: T. Siddiqui and U. Tiwary, Natural Language Processing and Information Retrieval
- Explanations, examples and numbers in this video are original
