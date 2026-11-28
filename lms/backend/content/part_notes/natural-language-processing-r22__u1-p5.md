### Recap of Part Four
- Rules: Fixed checks, 16 mistakes in 67 dots
- Word overlap: Topic changes where the words change
- Hidden Markov model: Best state path by Viterbi
- Logistic model: Weighted local features

### Today in five steps
- Cost: How much work each method needs
- Hybrid methods: Combine rules and learning
- Four outcomes: Right ends, false ends, missed ends
- Precision and recall: Two different questions
- F-measure: One number, and the threshold

### The cost of each method
- Rules | None | 3 checks per dot: 201
- Hidden Markov model | One counting pass: 750 tokens | 36 per token: 12,348
- Logistic model | 400 passes over 138 dots | 9 per dot: 603

### Work grows with the text
- Rules and logistic: a few operations per dot
- Viterbi: 36 operations for every token
- All three grow in step with the text length

### The key numbers
- 12,348: Viterbi operations on 343 test tokens
- 603: Logistic multiplications for 67 dots
- 201: Rule checks for the same 67 dots
- 496,800: Multiplications for the logistic training

### Hybrid approaches
- All dots: The 67 dots of the test text
- Rule layer: Settles the easy dots first
- 12 settled: No space after, a known abbreviation, or the end
- Learned model: Decides the other 55 dots
- Output: One list of boundaries

### Mistakes by method
- Rules: 16 mistakes, mostly false ends
- Logistic 5, hybrid 4: the rule layer removed one
- The hidden Markov model made only 1

### Four outcomes of a detector
- Positive means: the dot ends a sentence
- True positive 35, false positive 14
- False negative 2, true negative 16

### Precision, recall, F-measure, accuracy
- Precision: Of the dots called ends, how many are real: 35 of 49, 0.71
- Recall: Of the real ends, how many we found: 35 of 37, 0.95
- F-measure: The harmonic mean of the two: 0.81
- Accuracy: All right answers: 51 of 67, 0.76

### Counting while judging
- Each dot lands in one of the four boxes
- Precision and recall change as dots are judged
- At the end: precision 0.71, recall 0.95

### All methods on one table
- Always says end | 0.55 | 1.00 | 0.71
- Rules | 0.71 | 0.95 | 0.81
- Logistic | 0.97 | 0.89 | 0.93
- Hybrid | 1.00 | 0.89 | 0.94
- Hidden Markov | 1.00 | 0.97 | 0.99

### Why not just accuracy?
- One number for all dots | Two numbers, one for each kind of error
- Says end every time: 0.55 | Says end every time: precision 0.55, recall 1.00
- Hides which error is common | Shows false ends and missed ends apart
- Misleading when one class dominates | Works even for rare boundaries

### Moving the threshold
- Say end only above a chosen probability
- Low threshold: recall 1.00, precision falls
- High threshold: precision 1.00, recall collapses

### Why the harmonic mean?
- The simple average can hide a bad score
- The F-measure stays near the weaker of the two
- Made-up extreme: P 1.00, R 0.10 gives F 0.18

### Which error matters more?
- Favor precision: A false end cuts a good sentence in two
- Favor recall: A missed end glues two sentences together
- Use the F-measure: When both errors cost about the same

### Exam tips and important questions
- Complexity of the approaches | Rules, HMM Viterbi, logistic; training versus decoding cost
- Hybrid approach | Rules for easy cases, a learned model for the rest
- Define precision, recall, F | True and false positives; formulas; one worked example
- Why not accuracy alone | Imbalanced classes; the always-yes baseline

### Summary
- Cost: All grow in step with the text; Viterbi 36 per token
- Hybrid: Rules settle 12 easy dots, a model the rest
- Precision and recall: 35 of 49 and 35 of 37: 0.71 and 0.95
- F-measure: The harmonic mean: 0.81 for the rules

### References
- D. Bikel and I. Zitouni (eds.), Multilingual Natural Language Processing Applications, Pearson
- Reference book: D. Jurafsky and J. Martin, Speech and Language Processing
- Reference book: T. Siddiqui and U. Tiwary, Natural Language Processing and Information Retrieval
- Explanations, examples and numbers in this video are original
