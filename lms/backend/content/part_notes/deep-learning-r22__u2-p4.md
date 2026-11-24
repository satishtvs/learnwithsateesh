### Where we left off
- Tying and sharing: Weights tied together or shared across the model
- Sparse representations: Most hidden activations are zero
- Bagging: Average models trained on resampled data
- Dropout: Randomly silence units during training

### One idea behind all of today
- Adversarial training: Train on the worst nearby inputs
- Tangent distance: Compare after sliding along known changes
- Tangent propagation: Penalise output change along known directions
- Manifold tangent classifier: Learn those directions from data

### Random noise versus a crafted push
- Signs chosen by a coin toss | Signs chosen by the loss gradient
- Effects partly cancel out | Every input is pushed the harmful way
- Accuracy at size 0.10: 0.970 | Accuracy at size 0.10: 0.915
- Rarely changes the answer | Can flip the answer with a tiny push

### The fast gradient sign method
- Forward pass: Run the input and compute the loss
- Input gradient: How does the loss change with each input value?
- Take the sign: Keep only plus one or minus one for each input
- Push: Add epsilon times the sign to the input

### One point, pushed step by step
- Every input shifted by the same small size
- Probability of the true class falls
- At size 0.125 the label flips

### Why tiny changes add up
- A linear score with n inputs
- Worst case change grows with n
- Random signs grow much slower

### The adversarial training loop
- Take a batch: Clean examples with their true labels
- Craft the attack: Shift each input by epsilon times the gradient sign
- Mix the losses: Average the loss on clean and shifted inputs
- Update the weights: A normal step of gradient descent

### Ordinary against adversarial training
- Left: ordinary training
- Right: trained on shifted inputs too
- Attacked accuracy: 0.8725 against 0.915

### Accuracy as the attack grows
- No attack: both score 0.985
- Ordinary network falls fastest
- Random noise is far less harmful

### Back to the sine network
- Thirty noisy points, ten tanh units
- Worst case: shift each x by 0.05
- Worst case error 0.0380 falls to 0.0286

### What adversarial training gives and costs
- Locally constant: Output stays stable near each training point
- Partial protection: Resists the attack it saw, not every attack
- Extra cost: One more forward and backward pass per step
- Unlabelled data: Virtual adversarial training uses the model's own label

### A stroke, a rotation and a tangent
- A stroke like a seven: 16 points, 32 numbers
- Rotation moves the point along a curve
- The tangent vector is that curve's direction

### How good is the tangent?
- 5 degrees | 0.3101 | 0.3102
- 10 degrees | 0.6195 | 0.6203
- 20 degrees | 1.2343 | 1.2406
- 40 degrees | 2.4312 | 2.4812

### Tangent distance
- Test: a seven rotated by 30 degrees
- Euclidean: 1.840 to seven, 3.050 to one
- Tangent: 0.476 to seven, 2.363 to one

### Tangent propagation
- Twelve training points, one spurious link to x2
- v means slide up, a change that should not matter
- Test accuracy 0.8075 rises to 1.000

### The tangent prop cost
- Data loss: The usual error on the labelled examples
- Tangent vectors: One vector for each change to ignore
- The penalty: Squared slope of the output along each tangent
- The weight: A number that sets how strongly we insist

### Tangent prop against augmentation
- Penalises the slope along a tangent | Shows actual transformed copies
- Infinitesimal changes, no new data | Finite changes, new inputs to compute
- Resists only tiny changes | Can resist large changes
- Awkward for ReLU units | Works with any model

### The manifold tangent classifier
- Unlabelled data: Many examples, no labels needed
- Learn the manifold: A contractive autoencoder squeezes data onto a curve
- Read the tangents: Take the strongest Jacobian directions of the encoder
- Train the classifier: Use tangent prop with the learned vectors

### Learning tangents from points
- 120 noisy points near a circle
- Direction of spread of 10 nearest neighbours
- Mean angle error: 7.9 degrees

### Unit II so far in one table
- Norm penalties | Shrink weights; L1 gives zeros | Many features, noisy data
- Dataset augmentation | Adds transformed copies | Little data, known changes
- Noise, early stopping | Add noise; stop at best validation | A cheap default for any model
- Parameter sharing | Reuses the same weights | Structure is known, as in images
- Bagging, dropout | Average models or subnetworks | Large networks that overfit
- Adversarial training | Trains on worst case shifts | Robustness matters
- Tangent methods | Ignore known or learned changes | Known invariances exist

### Which regulariser for which problem?
- Too many features: Try an L1 or L2 penalty first
- Very little data: Augment with known transformations
- Test error starts rising: Use early stopping at the best epoch
- A big network overfits: Add dropout, or average with bagging
- Fooled by tiny shifts: Use adversarial training
- Known invariance: Use tangent prop, or learn the tangents

### Exam tips and important questions
- Define and explain: An adversarial example, with the gradient sign formula in words
- Why it works: Linearity in high dimensions: many tiny changes add up
- Tangent methods: State tangent distance and tangent prop with a sketch
- Manifold tangent: Draw the three steps of the classifier
- Compare: Reproduce the comparison table of regularisers

### Summary and up next
- Adversarial examples: tiny worst case shifts
- Training on them: 0.8725 becomes 0.915
- Tangent distance, tangent prop, manifold classifier
- Next: learning versus pure optimisation

### References
- I. Goodfellow, Y. Bengio, A. Courville, Deep Learning, MIT Press, 2016 (ch. 7)
- Explanations and examples in this video are original summaries
