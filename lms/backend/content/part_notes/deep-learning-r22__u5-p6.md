### Today's four circles
- Recommenders: Predict what a user will like
- Explore or exploit: Try something new, or repeat the best?
- Knowledge: Facts as triples, and questions about them
- Course wrap-up: Five unit summaries and exam tips

### A ratings matrix with holes
- 6 users and 5 items: 30 cells, but 5 were never rated
- Asha and Bala like action; Chitra, Dev and Farid like romance
- Three orange cells are hidden, to test our predictions

### Content based or collaborative
- Uses item features, such as genre and cast | Uses only who rated what, no features
- Needs a description of every item | Finds users with similar taste
- Recommends more of the same kind | Can surprise with a new kind of item
- Works for a brand new item | Fails for an item nobody has rated

### Matrix factorisation in four steps
- Ratings matrix: Six users by five items, with holes
- Two small matrices: Each user and item gets two numbers
- Dot product: User numbers times item numbers is the prediction
- Error on known cells: Squared error, plus a small penalty

### Factorising by gradient descent
- Step 0: training error 2.54 from random numbers
- Step 20: 1.30, stuck on a plateau
- Step 60: training 0.37, test 0.44

### The error curve
- Training error: 2.54 down to 0.37
- Test error 0.45, while guessing the average gives 1.33
- A plateau near step 20, then a fast drop

### Predictions and errors
- Asha, Romance 2 (hidden) | 1 | 0.86
- Dev, Romance 1 (hidden) | 4 | 4.74
- Chitra, Comedy (hidden) | 3 | 3.21
- Bala, Romance 1 (never rated) | unknown | 1.60
- Dev, Romance 2 (never rated) | unknown | 4.24

### The cold start problem
- A new user: No ratings yet, so there is no taste to match
- A new item: Nobody rated it, so its numbers stay unknown
- A brand new system: Few ratings of any kind, so everything is thin
- Common cures: Ask a few questions, use item features, show popular items

### A new user, one rating at a time
- No ratings: show the item averages, error 1.83
- One rating: 1.33; two ratings: 0.76
- Five ratings: 0.60

### Exploit or explore
- Pick the option that looks best now | Try an option you know little about
- Gain: high reward today | Gain: information for tomorrow
- Risk: stuck with a wrong favourite | Risk: wasted tries on poor options
- Epsilon 0: always greedy | Epsilon above 0: random pick with that chance

### A bandit, pull by pull
- Five arms, true values 0.2, 0.5, 1.0, 1.5 and 0.8
- After 10 pulls: arm 1 has 7 pulls, arm 4 has 3
- After 1000 pulls: arm 4 has 898, average reward 1.44

### Four values of epsilon
- Epsilon 0 and 0.01: average reward 0.96 and 1.23
- Epsilon 0.1: 1.39, the best arm in 85 percent of pulls
- Epsilon 0.3: 1.27, too much random exploring

### Representing knowledge
- Entities: Things: Paris, France, Delhi, India
- Relations: Links: capital of, in continent
- Facts: A triple: head, relation, tail, such as Paris, capital of, France
- Missing facts: The base is incomplete; we want to predict more

### Scoring a triple by translation
- Head vector h | 1, 2
- Relation vector r | 2, minus 1
- h plus r, the translated head | 3, 1
- True tail 3, 1: distance | 0
- Wrong tail 0, 3: distance | 3.61

### Learning the embeddings
- 10 entities and 2 relations, in two dimensions
- Epoch 0: mean distance capital to country 1.25
- Epoch 30 onwards: about 0.14

### True facts against corrupted ones
- True facts: distances 0.06 to 0.38
- Corrupted facts: distances 1.13 to 1.32
- Mean rank of the right answer: 1.1, untrained 5.9

### Reasoning and answering questions
- Answering by lookup: A question is turned into a head and a relation; rank the tails
- Chains of facts: Reasoning joins several facts, one after the other
- Memory networks: Facts are stored in slots and read by soft attention
- Open difficulty: Combining symbols and vectors is still unsolved

### Unit I: basics and feedforward networks
- Learning basics: Task, performance, experience; linear regression by gradient descent
- Capacity and error: Underfit, overfit; validation set; k-fold cross-validation
- Estimation: Bias, variance, maximum likelihood, MAP and weight decay
- Feedforward networks: XOR, hidden units, back-propagation on a graph

### Unit II: regularisation and optimisation
- Penalties: L2 and L1 norm penalties shrink weights; L1 gives zeros
- Other regularisers: Augmentation, noise, early stopping, bagging, dropout
- Why training is hard: Ill-conditioning, local minima, saddles, cliffs, plateaus
- Algorithms: SGD, momentum, initialisation; AdaGrad, RMSProp, Adam

### Unit III: convolutional networks
- Convolution: Sparse interactions, parameter sharing, equivariance
- Pooling: Small invariance to shifts; an infinitely strong prior
- Variants: Stride, zero padding, unshared and tiled convolution
- In practice: Structured outputs, fast convolution, a small CNN end to end

### Unit IV: recurrent and recursive nets
- Unfold: Same weights at every step; back-propagation through time
- Use context: Bidirectional, encoder-decoder, deep and recursive nets
- Remember: Echo states, leaky units, LSTM and GRU gates
- Train safely: Clipping, information flow, explicit memory

### Unit V: practical methodology and applications
- 1 | Metrics, baselines | Pick the metric first; start with a simple baseline
- 2 | More data, hyperparameters | Check the learning curve; tune the learning rate first
- 3 | Debugging, digits | Test on tiny data; check gradients; watch activations
- 4 | Scale, vision | GPUs and parallelism; preprocessing and augmentation
- 5 and 6 | Speech, language, other | Sequence models, embeddings, recommenders, knowledge

### How to answer in the exam
- Derivations: State the setup, write each line with symbols named, box the result
- Diagrams: Label every part: unfolded RNN, CNN pipeline, LSTM cell, back-prop graph
- Numerical problems: Write the formula, substitute, show each step, give units
- Theory questions: Define, give the reason, compare with a table, end with an example

### Frequently asked in each unit
- I | Overfitting and underfitting; bias and variance; maximum likelihood; back-propagation
- II | L1 against L2; dropout; early stopping; momentum, RMSProp and Adam
- III | Convolution and its three ideas; pooling; stride and padding; a CNN diagram
- IV | Unfolded RNN and BPTT; LSTM and GRU; bidirectional; encoder-decoder; echo state
- V | Performance metrics; hyperparameter selection; debugging; speech and NLP

### Your last week
- Day 1 and 2 | Unit I and II: redo the worked numbers by hand
- Day 3 | Unit III: convolution output size and parameter counts
- Day 4 | Unit IV: draw the unfolded graph and the LSTM cell
- Day 5 | Unit V: metrics, hyperparameters, debugging checklist
- Day 6 and 7 | One timed past paper, mark it, then rest and sleep early

### Thank you, and good luck
- Keep practising: A few numbers by hand each day beat one long night
- Keep asking: Discuss, question and explain it to a friend
- Keep building: Train a small network yourself and watch it learn

### References
- I. Goodfellow, Y. Bengio, A. Courville, Deep Learning, MIT Press, 2016 (ch. 12)
- Explanations and examples in this video are original summaries
