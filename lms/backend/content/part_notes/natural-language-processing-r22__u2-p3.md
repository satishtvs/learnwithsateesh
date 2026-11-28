### Recap: what phrase trees do not say
- Phrase trees: NP, VP and PP nodes over the words
- Treebanks: Trees with checked labels
- A PCFG: Rule counts, no word information
- The gap: Which word is the core of a phrase?

### Today in five steps
- Two views: Phrase structure and dependency
- Heads: Head words and head rules
- Phrase to dependency: Pass heads up, link them
- Dependency to phrase: Heads with dependents
- Projectivity: Do the arcs cross?

### Phrase structure versus dependency
- Nested phrases with labels | Words linked directly to words
- Extra nodes: NP, VP, PP | Only the words are nodes
- Which words group together? | Which word depends on which?
- Suits fixed word order | Also suits free word order

### One sentence, two views
- Top: nested phrases, 14 nodes
- Bottom: arcs between the 7 words
- Same words, same meaning

### Heads and dependents
- Head: The word that decides the type of a phrase
- Dependent: A word that modifies or completes a head
- Root: The head of the whole sentence
- Relation: A label on the arc: subject, object

### Head rules
- Sentence (S) | The VP
- Verb phrase (VP) | The verb, or an inner VP
- Noun phrase (NP) | The last noun, or an inner NP
- Prepositional phrase (PP) | The preposition
- Search order | From the left for VP and PP, from the right for NP

### Passing the head words up
- Start from the words, going up
- Apply the head rule at each phrase
- The root phrase gets the head word played

### Linking heads with arcs
- Every non-head child gives one arc
- The arc runs from the phrase head to the child head
- 7 words give 6 arcs and a root

### The dependency tree
- 7 words, 6 arcs, root played
- Every word has exactly one head
- Labels name the relation

### Phrase tree to dependency tree
- Phrase tree: From a treebank
- Head rules: Pick the head child of each phrase
- Head words: Pass them up to the top
- Link: Head word to each other child
- Dependency tree: Words and arcs only

### The ambiguity again
- A: in depends on played
- B: in depends on football
- The same ambiguity, a new picture

### From dependencies back to phrases
- A head with its dependents is one flat phrase
- 6 multiword phrases become 4
- The two verb phrases are lost

### Projective and non-projective trees
- Projective: no arcs cross
- Non-projective: arcs cross, 1 pair here
- Same words, a different order

### Testing projectivity step by step
- Test each arc from head to dependent
- Every word between must be below the head
- One of the 6 arcs fails

### Where non-projective trees appear
- Moved clauses: A relative clause separated from its noun
- Free word order: Czech, Hindi, Telugu scramble words
- Long links: Dependents far from their head

### The verb in three languages
- English: verb in the middle, word 3 of 6
- Hindi: verb group at the end
- Telugu: 3 words, the verb is last

### Exam tips and important questions
- Phrase versus dependency | Nested phrases against head links; draw both
- Head and head rules | Define head; table for S, VP, NP, PP
- Phrase to dependency | Heads up the tree; link; worked example
- The way back | Head plus dependents; labels lost
- Projective trees | No crossing arcs; give a crossing example

### Summary
- Two views: Phrases group words; arcs link words
- Heads: Head rules pick one child per phrase
- Conversion: 7 words, 6 arcs; back gives flat phrases
- Projectivity: Crossing arcs mean non-projective

### References
- D. Bikel and I. Zitouni (eds.), Multilingual Natural Language Processing Applications, Pearson
- Reference book: D. Jurafsky and J. Martin, Speech and Language Processing
- Reference book: T. Siddiqui and U. Tiwary, Natural Language Processing and Information Retrieval
- Explanations, examples and numbers in this video are original
