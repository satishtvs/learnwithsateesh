### Recap of Part Three
- Lookup and machines: 10 entries gave 24 verb forms
- Rules and features: Two-level rules; unification of features
- Stemmers: Chopped stems, not always words
- Edit distance: unhappy to happier: 5 edits

### Today in five steps
- Why structure: Programs need units
- Sentence boundaries: Rules first
- Topic boundaries: Words that repeat
- Generative model: A hidden Markov model
- Discriminative model: Local features, learned weights

### Why document structure matters
- Sentences: Parsers and translators work sentence by sentence
- Topics: Summaries and search need segments
- Speech transcripts: Often have no punctuation at all
- Messy text: Web text has irregular layout

### The period problem
- A paragraph of 4 sentences has 10 periods
- Only 4 of them end a sentence
- Dr, Ltd, Rs, 5.5, A and K do not

### A rule based detector
- Find dots: Every full stop is a candidate
- Space after?: No space, as in 5.5: not a boundary
- Abbreviation?: Dr, Mr, Mrs, Rs, no, etc: not a boundary
- Next word: Starts with a small letter: not a boundary
- Decide: Otherwise it is a sentence end

### The rules at work
- Each dot gets the checks in order
- 8 of the 10 dots are judged right
- The initials A and K fool the rules

### The rules on a larger test text
- 67: Periods in a test text built from 40 templates
- 37: Of them truly end a sentence
- 14: False ends, mostly initials such as A. and K.
- 2: Missed ends: etc. at the end of a sentence

### Topic boundaries: word overlap
- Compare 2 sentences before and after each gap
- Overlap is high inside a topic
- Zero overlap at gaps 4 and 8: topic changes

### Sentence versus topic boundaries
- Unit: one sentence | Unit: a block of sentences on one subject
- Clues: dots, capitals, abbreviations | Clues: repeated words, vocabulary change
- Many boundaries, close together | Few boundaries, far apart
- Typical error: a wrong dot decision | Typical error: a boundary in the wrong gap

### A generative model: the hidden Markov model
- Hidden states: word kinds and dot kinds
- Probabilities come from counting a labeled text
- The answer is the most likely state sequence

### Viterbi decoding, step by step
- Each column keeps the best score of every state
- The best earlier state is remembered
- Path: dot after Dr and Ltd inside, final dot ends

### What the hidden Markov model says
- Mr | Singh | not an end | not an end
- Inc | The | end | end
- K | Khan | not an end | not an end
- etc | We | end | end
- etc | The | not an end | end

### A discriminative model: local features
- Candidate: One dot and its neighbours
- Features: Eight yes or no facts
- Weights: Learned from the labeled text
- Score: Add the weights of the true facts
- Decision: Probability above one half: end

### What the model learned
- A very short word before the dot: weight minus 2.19
- A new line, or a capital next: weights 1.34 and 1.25
- Training accuracy: 119 of 138 dots

### Generative versus discriminative
- Models how the text is produced | Models only the boundary decision
- Needs probabilities of every word | Needs useful features of the dot
- Reads the whole sequence together | Looks at one local window at a time
- Training is only counting | Training is repeated adjustment

### The methods side by side
- Rules | Checks in a fixed order | No | Initials, long lists
- Word overlap | Topic changes where words change | No | Window size
- HMM | Most likely state path | Yes | Words never seen
- Logistic | Weighted local features | Yes | Features by hand

### Exam tips and important questions
- Sentence boundary detection | The period problem; rules; examples Dr, 5.5, A. K.
- Topic boundary detection | Word overlap in windows; low points are boundaries
- Generative sequence model | Hidden states, transitions, emissions, Viterbi
- Discriminative local model | Features, weights, probability above one half

### Summary
- The period problem: Only 4 of 10 dots ended a sentence
- Rules: Cheap, but 16 mistakes in 67 dots
- Generative model: A hidden Markov model with Viterbi decoding
- Discriminative model: Weighted local features, logistic function

### References
- D. Bikel and I. Zitouni (eds.), Multilingual Natural Language Processing Applications, Pearson
- Reference book: D. Jurafsky and J. Martin, Speech and Language Processing
- Reference book: T. Siddiqui and U. Tiwary, Natural Language Processing and Information Retrieval
- Explanations, examples and numbers in this video are original
