### Recap of Part 5: two ways to estimate
- Chooses the one best parameter value | Keeps a distribution over all values
- Cost: negative log likelihood | Starts from a prior belief, updates with data
- A prior gives the MAP estimate | Gives uncertainty, needs more work
- One prediction from one parameter set | Prediction averages over parameters

### Logistic regression and the support vector machine
- Logistic regression: sigmoid of a weighted sum gives a probability
- SVM: the line with the widest margin
- Kernel: curved boundaries from the same method

### k nearest neighbours: choosing k
- Classify by a vote of the k closest examples
- Small k: jagged boundary, memorises noise
- Large k: smooth boundary, blurs the shape

### Decision trees
- Each node asks one yes or no question
- Choose the split that makes groups purest
- Deep trees overfit

### Principal component analysis
- Project the points onto a line
- Keep the direction of largest variance
- That direction is the first principal component

### k means clustering
- Choose centres: Pick k starting centres, for example random points
- Assign points: Each point joins its nearest centre
- Move centres: Each centre moves to the mean of its points
- Repeat: Stop when nothing changes

### Stochastic gradient descent: the idea
- 1000: examples touched by one full batch step
- 20: examples touched by one minibatch step
- 50 times: cheaper step, direction only slightly noisy

### Minibatch against full batch on the cost surface
- Same learning rate, same start
- Minibatch path wiggles but follows
- Work per step: 1000 against 20 gradients

### The fair comparison: equal work
- Budget: 2000 example gradients
- Full batch: 2 steps, cost 2.96
- Minibatch: 100 steps, cost 0.46

### Building an algorithm: the recipe again
- Linear regression | w x + b | Mean squared error | Normal equation or GD
- Logistic regression | Sigmoid of w x + b | Negative log likelihood | Gradient descent
- Support vector machine | Linear or kernel | Hinge loss | Convex solver or SGD
- k means | k centres | Squared distance to centre | Assign, then move
- Neural network | Many layers | Any suitable cost | Minibatch SGD

### Challenge 1: the curse of dimensionality
- Cells grow as bins to the power d
- The data does not grow
- Most cells end up empty

### A local neighbourhood stops being local
- Want a box that holds 10% of the data
- d = 2: edge 0.316 of each axis
- d = 100: edge 0.977, almost everything

### Challenge 2: local constancy and smoothness
- Smoothness prior: nearby inputs, similar outputs
- A local rule needs one region per example
- 8 examples: error 0.245; 32 examples: 0.024

### The way out: manifold learning
- Thin surface: Real data lie near a thin curved surface
- Few directions: Only a few directions change the example
- Smooth moves: Moving along the surface changes things gently
- Learned features: Deep nets learn coordinates on the surface

### Exam tips and important questions
- Algorithms: Compare logistic regression, SVM, k-NN and trees
- Stochastic gradient: Write the minibatch update; why it is cheaper
- Unsupervised methods: P C A keeps largest variance; k means loop
- Curse: Explain the curse of dimensionality with an example
- Local constancy: The smoothness prior and the manifold idea

### Summary and up next
- Logistic regression, SVM, k-NN, trees: supervised
- P C A and k means: structure without labels
- Minibatch SGD: same progress, far less work
- Next: deep feedforward networks and XOR

### References
- I. Goodfellow, Y. Bengio, A. Courville, Deep Learning, MIT Press, 2016 (ch. 5, sections 5.7 to 5.11)
- Explanations and examples in this video are original summaries
