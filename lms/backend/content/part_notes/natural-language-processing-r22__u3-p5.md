### Recap: what you need from Part Four
- Logical form: A formula a machine can run
- Compositionality: Meaning built from parts
- Lambda terms: Meanings as functions
- Scope: One sentence, several readings

### Today in five steps
- Rule-based: Experts write patterns
- Supervised: Learn from labeled sentences
- Semi-supervised: A few labels plus unlabeled text
- Unsupervised: No labels, find groups
- Domains: One domain or open domain

### Four ways to build a semantic parser
- Rule-based: experts write patterns
- Supervised and semi-supervised: labels
- Unsupervised: no labels at all

### Our task: a travel assistant
- list | show flights from hyderabad to delhi | list(from, to)
- price | what is the fare from pune to delhi | price(from, to)
- status | is the flight from mumbai to chennai on time | status(from, to)
- book | book a flight from kolkata to delhi on tuesday | book(from, to, day)

### Rule-based: precise but narrow
- 8 hand-written patterns, 2 per intent
- Coverage: they fire on 34.8%
- Whenever they fire, they are right

### Rules versus learning
- High precision, low coverage | Coverage grows with the data
- Experts write and maintain rules | Annotators label examples
- Every answer is easy to explain | Answers are harder to explain
- Good for a small fixed domain | Good when data is plentiful

### Supervised: more labels, better parser
- Training data: sentences with their intent
- Naive Bayes counts words per intent
- 8 labeled: 60.1%; 256 labeled: 99.5%

### The shape of the learning curve
- 38.1%: Only 2 labeled sentences; chance is 25%
- 60.1%: With 8 labeled sentences
- 88.5%: With 32 labeled sentences
- 99.5%: With 256 labeled sentences

### Semi-supervised: use the unlabeled text
- Start: 8 labeled, 400 unlabeled sentences
- Label the rest with probabilities, retrain
- Mean accuracy: 66.0% to 79.7%

### The self-training loop
- Train: Learn from the labeled few
- Label: Give each unlabeled sentence probabilities
- Weight: Count it in each class by its probability
- Retrain: Learn from everything, then repeat

### Unsupervised: groups without labels
- No labels: group sentences that share words
- K means: assign, then move the centres
- Purity: 42.7% to 72.8%

### Domain-specific systems break outside their domain
- Same domain: 100% both ways
- Flights to hotels: 69.5%; hotels to flights: 62.3%
- 22.5% of the hotel words were never seen

### Domain-specific versus open-domain
- A domain, such as flights | Any topic, such as questions on the web
- Small vocabulary, a fixed set of frames | Huge vocabulary, no fixed set of frames
- Accurate, needs little data | Less accurate, needs a lot of data
- Examples: travel, database interfaces | Example: open question answering

### Which paradigm when?
- Small fixed domain, experts available | Rule-based
- Labeled data is available | Supervised
- A few labels, much raw text | Semi-supervised
- No labels, need to explore the data | Unsupervised

### Intent accuracy of each paradigm
- Rules: 34.8%, all of them right
- Supervised: 60.1% with 8, 99.5% with 256
- The other two: 79.7% and 72.8%

### Same sentences, different systems
- Four test sentences
- Rules answer only when a pattern matches
- The learned parser always answers

### Why open domain is hard
- Huge vocabulary: Many words never seen in training
- Many senses: One word, several meanings
- No fixed frames: Needs a large schema
- World knowledge: Facts beyond the sentence

### Exam tips and important questions
- Rule-based systems | Hand-written patterns; high precision, low coverage
- Supervised systems | Labeled data; learning curve; annotation cost
- Semi-supervised, unsupervised | Self-training; clustering; no names for clusters
- Domain-specific versus open | Vocabulary, frames, accuracy, data needed

### Summary
- Rule-based: Precise, narrow, written by experts
- Supervised: Needs labels; more labels, better parser
- Semi and unsupervised: Unlabeled text helps; clusters need names
- Domains: Specific is accurate; open is hard

### References
- D. Bikel and I. Zitouni (eds.), Multilingual Natural Language Processing Applications, Pearson
- Reference book: D. Jurafsky and J. Martin, Speech and Language Processing
- Reference book: T. Siddiqui and U. Tiwary, Natural Language Processing and Information Retrieval
- Explanations, examples and numbers in this video are original
