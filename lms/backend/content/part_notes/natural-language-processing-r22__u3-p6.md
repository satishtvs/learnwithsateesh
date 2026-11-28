### Recap: what you need from Part Five
- Rule-based: Precise, but covers little
- Supervised: More labels, better parser
- Semi-supervised: Unlabeled text helps
- Unsupervised: Groups with no names

### Today in five steps
- Many meanings: Polysemy and homonymy
- WordNet: Senses with glosses
- Lesk algorithm: Count overlapping words
- Learning: Supervised and unsupervised
- Evaluation: Accuracy against a baseline

### Homonymy versus polysemy
- Unrelated meanings | Related meanings
- Often separate dictionary entries | One entry, several senses
- bank: money, or the side of a river | paper: the material, or a newspaper
- Hindi aam: mango, or common | Hindi phal: fruit, or result

### Hindi words with several meanings
- kal: yesterday or tomorrow
- aam: mango or common
- phal: fruit or result

### Senses as nodes in a graph
- WordNet groups words into synsets
- Arrows: is a kind of
- bank#1 and bank#2 are different synsets

### Two senses of bank, with glosses
- bank#1 | a financial institution that accepts deposits of money and lends money to people
- bank#2 | sloping land beside a river or lake where water meets the ground

### The Lesk algorithm in four steps
- Context words: Take the other words of the sentence
- Gloss words: Take the words of each gloss
- Count the overlap: Shared words for each sense
- Choose: The sense with the largest overlap

### Lesk on three sentences
- Money sentence: overlap 2 against 0
- River sentence: overlap 0 against 2
- Hard sentence: 0 against 0

### The three overlaps
- She deposited her money in the bank on Monday | deposit, money: 2 | none: 0 | bank#1
- They sat on the bank of the river and watched the water | none: 0 | river, water: 2 | bank#2
- The bank was crowded and loud | none: 0 | none: 0 | no answer

### Three families of methods
- Knowledge-based: The family using only a dictionary
- Supervised: Learns from labeled sentences
- Unsupervised: Groups contexts, no labels

### Our test bed
- 240: Training sentences: 80 each for bank, bat, plant
- 120: Test sentences: 40 for each word
- 67.5%: Baseline: always the most frequent sense
- 38.3%: Share of sentences where Lesk answers

### Supervised: more labels, better accuracy
- Features: the other words of the sentence
- One Naive Bayes classifier for each word
- 2 labels: 67.7%; 80 labels: 86.7%

### Cue words learned for bank
- Money sense: manager, cheque, account
- River sense: stream, grass, shore, water
- Nobody wrote these lists

### Unsupervised: groups of contexts
- Only raw sentences, no sense labels
- Words that occur together get similar vectors
- 320 sentences: 86.6% pure

### Supervised versus unsupervised WSD
- Needs sentences with marked senses | Needs only raw sentences
- A fixed inventory such as WordNet | Discovered as clusters
- Scored directly by accuracy | Scored by purity or against gold senses
- Supervised: annotation cost per word | Unsupervised: a person names the clusters

### Accuracy on 120 test sentences
- The baseline: 67.5%
- Lesk with fallback: 75.0%
- Naive Bayes: 70.6% with 8, 86.7% with 80

### How word sense systems are evaluated
- Accuracy | Share of test words given the correct sense
- Coverage and precision | A system may abstain; precision counts its answers only
- Baseline | Always choose the most frequent sense
- Upper bound | How often two human annotators agree

### Unit III in one picture
- Parts 1 and 2: choose the best tree
- Part 3: many languages
- Parts 4 to 6: meaning, systems, word sense

### Exam tips and important questions
- Define both terms | Related versus unrelated senses; bank, paper, aam
- WordNet | Synsets, glosses, is-a relation; sense numbers
- Lesk algorithm | Gloss and context overlap; worked example; weakness
- Supervised, unsupervised WSD | Labels versus clusters; baseline; evaluation

### Summary of Unit III
- Parsing models: P C F G, head words, reranking, evaluation
- Many languages: Word order, free order, morphology
- Semantic parsing: Lambda terms, paradigms of systems
- Word sense: WordNet, Lesk, supervised and clusters

### References
- D. Bikel and I. Zitouni (eds.), Multilingual Natural Language Processing Applications, Pearson
- Reference book: D. Jurafsky and J. Martin, Speech and Language Processing
- Reference book: T. Siddiqui and U. Tiwary, Natural Language Processing and Information Retrieval
- Explanations, examples and numbers in this video are original
