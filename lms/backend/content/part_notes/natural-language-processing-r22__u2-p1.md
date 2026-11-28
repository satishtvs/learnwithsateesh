### Recap: what you need before syntax
- Tokens: Words found in Unit I
- Sentences: One sentence is one input
- Grammars: Rules that rewrite a symbol
- Trees: Root, children and leaves

### Today in five steps
- Constituents: Groups of words that act as one unit
- Grammar rules: A small context free grammar
- Derivations: From S to the words, as a tree
- Ambiguity: One sentence, two trees
- The parsing problem: What a parser must solve

### Same words, different order
- 7 tokens give 2520 different orders
- Our grammar accepts only 36 of them
- Accepted does not mean sensible

### Constituents: phrases inside a sentence
- A constituent is a group of words acting as one unit
- 7 phrases among 28 possible spans
- The dashed span is not a phrase

### Three tests for a constituent
- Replace it: A phrase can be replaced by they or it
- Move it: A phrase moves as one block
- Answer with it: A phrase can answer a question

### A context free grammar has four parts
- Nonterminals: Labels of phrases and tags: S, NP, VP
- Terminals: The words of the language
- Rules: One symbol rewritten as a sequence
- Start symbol: Every derivation begins with S

### The grammar we will use
- Sentence (S) | NP VP
- Noun phrase (NP) | DT NN | DT NNS | NNS | NN | PRP | NP PP
- Verb phrase (VP) | VBD NP | VBZ NP | VBD | VP PP
- Prepositional phrase (PP) | IN NP
- All together | 12 rules over 13 words and 7 tags

### Words and their tags
- 13 words, 7 tags
- Tag names follow the Penn Treebank
- Rules use tags, not words

### Deriving a sentence
- Start with S and rewrite one symbol at a time
- Always rewrite the leftmost symbol
- 14 steps leave only words

### The finished parse tree
- The leaves are the 7 words
- A parent with its children is one rule
- 14 nodes match the 14 derivation steps

### Derivation versus parse tree
- A sequence of rewriting steps | A picture of the structure
- The order of the steps matters | No order, only parents and children
- Leftmost and rightmost give different lists | Both give the same tree
- Phrases are hard to see | Phrases are subtrees

### One sentence, two trees
- Tree A: the PP hangs under the VP
- Tree B: the PP hangs under the NP
- The lesson: the sentence is ambiguous

### Two trees, two readings
- Reading A: the playing happens in the garden
- Reading B: the football is in the garden
- The grammar cannot choose, meaning must

### Ambiguity comes in kinds
- Attachment: Where does a phrase attach?
- Word class: plays: a verb or a noun
- Coordination: old men and women: 2 groupings

### Ambiguity explodes
- 1 PP at the end: 2 parses
- Each extra PP multiplies the choices
- 7 PPs: 1430 parses

### The parsing problem
- Input: A sentence and a grammar
- Tag and search: Look up tags, try the rules
- Output: All trees, or the best one
- Choose: Rank trees with probabilities

### Why parse at all?
- Translation: Reorder phrases between languages
- Question answering: Find who did what to whom
- Information extraction: Pull out relations from text
- Grammar checking: Spot a sentence with no tree

### Exam tips and important questions
- Constituent and its tests | Unit of words; replace, move, answer
- Context free grammar | Four parts; one example rule set
- Derivation versus parse tree | Steps versus structure; leftmost
- PP attachment ambiguity | Two trees for one sentence; draw both
- The parsing problem | Input, search, output, choice

### Summary
- Constituents: Groups of words that act as one unit
- Grammar: Rules from S down to words; 12 rules
- Ambiguity: Two trees for one sentence; 1430 for seven PPs
- Parsing: Search the rules, then choose a tree

### References
- D. Bikel and I. Zitouni (eds.), Multilingual Natural Language Processing Applications, Pearson
- Reference book: D. Jurafsky and J. Martin, Speech and Language Processing
- Reference book: T. Siddiqui and U. Tiwary, Natural Language Processing and Information Retrieval
- Explanations, examples and numbers in this video are original
