### Recap: the pieces we now combine
- The chart: 28 cells, 56 split points
- The PCFG: Rule probabilities from 12 trees
- Two trees: Product of rules: 8.83e-05 against 1.56e-05
- Dependency tree: 7 words, 6 arcs, root played

### Today in five steps
- Probabilistic CKY: Add probabilities to the chart
- Back pointers: Read the best tree back
- Max or sum: Viterbi and the inside sum
- Transition parsing: Shift and arc actions
- Trace and cost: 14 steps, 2n in general

### From CKY to Viterbi CKY
- A cell holds a set of symbols | A cell holds each symbol with its best probability
- A rule fits or it does not | Rule probability times the two cells
- Keeps all ways to build a symbol | Keeps only the best way
- Output: all the trees | Output: the most probable tree

### Filling the Viterbi chart
- Word cells: the probability of a word given its tag
- Each cell keeps the best probability per symbol
- The top cell holds the best parse probability

### One decision in the chart
- VP over words 3 to 7 has two ways
- Way A: 0.333 x 0.00877 x 0.171 = 5.0e-04
- Way B is 5.67 times worse, so it is dropped

### The finished Viterbi chart
- 28 cells, 19 filled
- S in the top cell: 8.83e-05
- Other S cells cover only part of the sentence

### Reading the best tree back
- Start from S in the top cell
- Follow the back pointer to two smaller cells
- Repeat until only words are left

### The best tree and its probability
- The tree read from the chart is tree A
- Its probability is 8.83e-05
- Tree B, with 1.56e-05, was never built in full

### Maximum or sum?
- Keeps the best way to build a symbol | Adds all the ways to build a symbol
- Finds the best parse | Gives the probability of the sentence
- Needs back pointers | Needs no back pointers
- Our sentence: 8.83e-05 | Our sentence: 1.04e-04

### The loop of a transition parser
- Read the state: Top of the stack, front of the buffer
- Choose an action: Shift or add an arc
- Apply it: Update stack, buffer and arcs
- Repeat: Until the buffer is empty

### Three actions
- SHIFT: move the next word onto the stack
- LEFT-ARC: the top word heads the one below it
- RIGHT-ARC: the one below heads the top word

### Parsing our sentence
- Start: ROOT on the stack, 7 words in the buffer
- Each step is a shift or an arc
- 14 steps: 7 shifts, 3 left arcs, 4 right arcs

### The full trace
- Every step changes the stack and the buffer
- Seven arcs: six between words, one to ROOT
- An arc is added as soon as it is safe

### Who chooses the actions?
- In training: An oracle reads the actions from a treebank
- At parse time: A classifier predicts the next action
- Features: Top words, tags and arcs so far
- Price of speed: One path, no backtracking

### Variants of the system
- Arc-standard: Three actions, projective trees only
- Arc-eager: Adds a reduce action, attaches early
- Swap: Lets the parser build crossing arcs

### Speed compared with the chart
- Transition parser: 2n steps, 14 for 7 words
- CKY: about n cubed, 56 split points for 7 words
- At 43 words: 86 steps against 13,244 checks

### Exam tips and important questions
- Viterbi CKY | Cell: symbol and best probability; rule times cells
- Best tree from the chart | Back pointers from the top cell
- Shift-reduce parsing | Stack, buffer, shift, left arc, right arc
- Trace on a sentence | Table of action, stack, buffer, arcs
- CKY versus transition parsing | Cubic and exact against linear and greedy

### Summary and Unit II recap
- Viterbi CKY: Best probability per symbol: 8.83e-05
- Back pointers: Rebuild the best tree from the top cell
- Shift-reduce: 14 steps for 7 words, 2n in general
- Unit II: Grammars, treebanks, heads, parsers

### References
- D. Bikel and I. Zitouni (eds.), Multilingual Natural Language Processing Applications, Pearson
- Reference book: D. Jurafsky and J. Martin, Speech and Language Processing
- Reference book: T. Siddiqui and U. Tiwary, Natural Language Processing and Information Retrieval
- Explanations, examples and numbers in this video are original
