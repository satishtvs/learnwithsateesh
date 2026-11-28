### Recap: what you need from Part One
- Probabilistic grammar: Tree probability is a product of rule probabilities
- Blind to words: The same answer for every noun
- Head words: Specific rules, sparse counts, backoff
- Discriminative: Scores a tree given the words

### Today in five steps
- Rerank: Choose among the n best trees
- Features: Describe each tree by questions
- Learn weights: A log-linear model
- Structured models: Score the whole tree
- Evaluate: Brackets and attachment scores

### Rerank the n-best list
- A base parser proposes the n best trees
- A second model scores each whole tree
- The highest score is the output

### Five parses of one sentence
- tree 1 | saw | saw | 1.00
- tree 2 | saw | hat | 0.67
- tree 3 (correct) | girl | saw | 0.67
- tree 4 | girl | hat | 0.44
- tree 5 | girl | girl | 0.44

### Features of each candidate
- A dot means the tree has that feature
- Score = weights times features
- The correct candidate scores highest

### A log-linear model in three steps
- Add the weights: Score = sum of the weights of the features
- Make it positive: Take the exponential of each score
- Divide by the total: The chances add up to one

### Learning the weights
- Start: only the base score has a weight
- Each step favours the correct trees
- Epoch 300: correct tree 0.75

### What the weights learned
- The pairing of weights
- Telescope and fork favour the verb
- Toppings and accessories: olives, hat, dog

### Structured models in plain words
- Score the whole tree: Features may look at any part
- Structured perceptron: Wrong? Add the right tree, subtract the wrong
- Log-linear model: Turn scores into chances

### Did reranking help?
- 3 of 6: Held-out sentences right with the base parser
- 6 of 6: Held-out sentences right after reranking
- 22: Features, including the base score
- 5: Candidate trees per sentence

### How do we measure a parser?
- Held-out data: Test on sentences not used for training
- Gold trees: Correct trees written by annotators
- Bracket scores: PARSEVAL for phrase trees
- Attachment scores: UAS and LAS for dependency trees

### Gold tree and predicted tree
- Gold: the girl has the hat
- Predicted: she used the hat to see
- Red phrases have no partner

### Checking the brackets
- A phrase = label + start + end
- Match: same label over the same words
- 9 of 10 predicted phrases match

### Precision, recall and F measure
- Precision | correct brackets divided by predicted brackets | 9 of 10 = 0.90
- Recall | correct brackets divided by gold brackets | 9 of 10 = 0.90
- F measure | harmonic mean of the two scores | 0.90
- Crossing brackets | predicted phrases cutting a gold phrase | 1

### Dependency trees: one head per word
- Every word has exactly one head
- Blue above: the gold arcs
- Below: predicted, errors in colour

### Scoring arcs: UAS and LAS
- UAS: share of words with the right head
- LAS: right head and right label
- UAS 0.90, LAS 0.80

### Brackets versus attachments
- Counts correct brackets | Counts words with a correct head
- Gives precision, recall and F | Gives UAS and LAS
- The number of brackets can differ | Exactly one head for every word
- Labels are phrase names: NP, VP | Labels are relations: subject, object

### Exam tips and important questions
- Asked about reranking | n-best list, features, weights, highest score wins
- Maximum entropy model | Weights times features, exponential, normalise
- PARSEVAL | Precision, recall, F measure on brackets; example
- UAS and LAS | Correct head; correct head and label; example

### Summary
- Reranking: n-best list, features, learned weights
- Log-linear model: Score, exponential, normalise
- Bracket scores: Precision, recall and F measure
- Attachment scores: UAS and LAS for words

### References
- D. Bikel and I. Zitouni (eds.), Multilingual Natural Language Processing Applications, Pearson
- Reference book: D. Jurafsky and J. Martin, Speech and Language Processing
- Reference book: T. Siddiqui and U. Tiwary, Natural Language Processing and Information Retrieval
- Explanations, examples and numbers in this video are original
