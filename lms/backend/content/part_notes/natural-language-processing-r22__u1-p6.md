### Recap of Part Five
- Cost: All methods grow with the text; Viterbi 36 per token
- Hybrid: Rules settle 12 dots, a model the rest
- Precision and recall: 0.71 and 0.95 for the rules
- F-measure: Harmonic mean; the threshold moves the balance

### Today in five steps
- What a feature is: A question about a dot
- Lexical features: Words around the dot
- Typographic, prosodic: Layout, and the sound of speech
- Choosing features: Rank, select, avoid noise
- Unit I recap: All six parts on one page

### From a dot to a feature vector
- A feature is a question with a yes or no answer
- The answers for one dot form a feature vector
- The model turns the vector into a probability

### Lexical features: the words around the dot
- Short word before | Three letters or fewer? | Dr, Mr, Rs, A, K
- Initial before | A single capital letter? | A. K. Rao
- Digit before | A number before the dot? | the 5 in 5.5
- Capital next | Next word starts with a capital? | He, They, The
- Number next | Next token starts with a digit? | Rs. 5.5

### Typographic features: layout
- Space after the dot: No space: a decimal or a web address
- New line after: A line break often follows a sentence end
- End of the text: The last dot always ends a sentence
- Layout marks: Headings, bullets and tabs in web or PDF text

### Prosodic features: the sound of speech
- Speech has no dots or capitals
- A pause before the next word is a clue
- Simulated numbers, for illustration

### Two sound features, one line
- Pause and pitch reset for 180 word gaps
- The line moves with every update
- Two features beat the pause alone: 95.6 percent

### More features, better answers
- The same model and the same dots
- Next capital only: 0.70 on the test dots
- Adding the word before: 1.00

### Ranking features by information gain
- 1 | Short word before | 0.352
- 2 | Capital next | 0.179
- 3 | New line after | 0.125
- 4 | Number next | 0.107
- 5 | Initial before | 0.041

### Forward selection
- Start with no features
- Add the one that helps the training accuracy most
- Stop when nothing improves

### Too many features: noise
- Train on only 30 dots, add random features
- Training accuracy climbs to 1.00
- Test accuracy falls from 0.93 to 0.63

### Three ways to select features
- Filter: Rank features by a score, such as information gain
- Wrapper: Try subsets and test the model, like forward selection
- Embedded: A penalty during training shrinks useless weights

### Adding the word before the dot
- 0.93: Test accuracy with the eight shape and layout features
- 5: Mistakes on 67 test dots with those features
- 1.00: Test accuracy after adding the 12 most frequent words before the dot
- 0: Mistakes on the same 67 dots

### Unit I on one page
- Part 1: words: Tokens, types, lemmas, stems, morphemes, inflection
- Part 2: issues: Irregularity, ambiguity, productivity, tokenization
- Part 3: models: Finite-state, two-level rules, unification, Porter, edit distance
- Part 4: boundaries: Sentences and topics: rules, HMM, discriminative
- Part 5: measures: Cost, hybrids, precision, recall, F-measure
- Part 6: features: Lexical, typographic, prosodic; selection

### Unit I formula sheet
- Type-token ratio | types divided by tokens | 15 / 22 = 0.68
- Edit distance | fewest inserts, deletes, replaces | unhappy to happier: 5
- Viterbi cost | tokens times states squared | 343 x 36 = 12,348
- Precision | TP divided by TP plus FP | 35 / 49 = 0.71
- Recall | TP divided by TP plus FN | 35 / 37 = 0.95
- F-measure | 2 P R divided by P plus R | 0.81

### Exam tips and important questions
- Features for document structure | Lexical, prosodic, typographic; one example each
- Feature selection | Filter, wrapper, embedded; information gain; overfitting
- Effect of features on accuracy | Same model: test accuracy 0.70 to 1.00
- Unit I in a ten mark answer | Words, issues, models, boundaries, measures, features

### Summary
- Lexical features: Words around the dot: shape and identity
- Typographic, prosodic: Layout, and pause and pitch in speech
- Selecting features: Rank, add one by one, stop when flat
- Unit I: Words, models, boundaries, measures, features

### References
- D. Bikel and I. Zitouni (eds.), Multilingual Natural Language Processing Applications, Pearson
- Reference book: D. Jurafsky and J. Martin, Speech and Language Processing
- Reference book: T. Siddiqui and U. Tiwary, Natural Language Processing and Information Retrieval
- Explanations, examples and numbers in this video are original
