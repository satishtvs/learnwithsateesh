### Recap: why we need an algorithm
- The grammar: 12 rules, 13 words, 7 tags
- Two parses: The PP sentence has 2 trees
- An explosion: 1430 parses for seven PPs
- The need: Find trees without listing them

### Today in five steps
- Recognising versus parsing: Yes or no, or trees
- Top-down: From S towards the words
- Bottom-up: From the words towards S
- The CKY chart: A table filled by span length
- Cost: Chart work against parses

### Recognition versus parsing
- Answers yes or no | Returns the trees
- Is the sentence in the language? | What is its structure?
- Needs only the symbols per cell | Also keeps back pointers
- Our sentence: yes; scrambled: no | Our sentence: 2 trees

### Top-down parsing
- Start with S and expand the leftmost symbol
- Match each tag with the next word
- On a mismatch, back up and try the next rule

### The problem of left recursion
- NP to NP PP starts with NP itself
- The stack grows and no word is read
- Fix: rewrite the rule, or use a chart

### Bottom-up parsing and wasted effort
- Start from the words and look up their tags
- Combine neighboring symbols by a rule
- Wasted effort: 23 entries built, 15 used

### Top-down versus bottom-up
- Starts from S | Starts from the words
- Builds only what S can use | Builds only what the words allow
- Tries rules that ignore the words | Builds phrases that never join into S
- Loops on left recursion | Safe from left recursion

### Why a chart helps
- 28: Cells for a sentence of 7 words
- 56: The work: split points checked in all
- 23: Entries, each built once
- 2: Parses stored in the same chart

### Chomsky normal form
- Rules with two symbols on the right
- A long rule gets a helper symbol
- A unit rule is applied inside the cell

### Filling one cell
- A cell covers a span of words
- Try every split point inside the span
- Combine a symbol from each part by a rule

### Filling the chart
- One-word cells come from the lexicon
- Longer spans combine two smaller cells
- S in the top cell means accepted

### The finished chart
- 28 cells, 19 filled
- S appears in the top cell
- Words 3 to 7 hold a V P built two ways

### Reading the trees back
- S over words 1 to 7 | NP words 1 to 2, VP words 3 to 7
- Way A for the VP | VP words 3 to 4, PP words 5 to 7
- Way B for the VP | VBD word 3, NP words 4 to 7
- NP over words 4 to 7 | NP word 4, PP words 5 to 7
- PP over words 5 to 7 | IN word 5, NP words 6 to 7

### The cost of the chart
- Chart work grows like n cubed
- The number of parses grows much faster
- At 28 words the lines cross

### Beyond the basic chart
- Another chart method: Any grammar, no normal form needed
- Probabilistic CKY: Keep the best tree: Part Five
- Pruning: Skip cells that look unlikely

### Exam tips and important questions
- Recognition versus parsing | Yes or no against trees; back pointers
- Top-down and backtracking | Expand from S; backtrack; left recursion loops
- Bottom-up and combining | From words; combine neighbours; wasted entries
- Chomsky normal form | Binary rules; helper symbol; unit rules
- The CKY algorithm | Fill by span length; split points; n cubed

### Summary
- Recognise, parse: Yes or no, then the trees
- Two directions: Top-down loops on left recursion
- The chart: 28 cells, 56 split points, 2 parses
- The cost: About n cubed, not exponential

### References
- D. Bikel and I. Zitouni (eds.), Multilingual Natural Language Processing Applications, Pearson
- Reference book: D. Jurafsky and J. Martin, Speech and Language Processing
- Reference book: T. Siddiqui and U. Tiwary, Natural Language Processing and Information Retrieval
- Explanations, examples and numbers in this video are original
