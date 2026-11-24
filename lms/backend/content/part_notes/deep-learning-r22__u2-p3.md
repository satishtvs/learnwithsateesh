### Where we left off
- Dataset augmentation: Make new examples by transforming old ones
- Noise robustness: Add small random noise to inputs or weights
- Semi-supervised, multi-task: Share one representation across data or tasks
- Early stopping: Stop when the validation error starts to rise

### Today's four ideas
- Tying and sharing: Related models use similar or equal parameters
- Sparse representations: The hidden code is mostly zeros
- Bagging: Train on resampled data, then average
- Dropout: Bagging for neural networks, at almost no cost

### Parameter tying
- Two models for two similar tasks
- Penalty: lambda times the squared distance between parameters
- Pulls parameters together, not forced equal

### Tying in an experiment
- Eight noisy points per task, twenty runs each
- No penalty: test error 1.1948
- Penalty 10: test error 0.1220

### Tying versus sharing
- Soft: a penalty pulls parameters together | Hard: parameters are exactly equal
- Two sets of numbers stay in memory | One set is stored and reused
- Models can differ where data demands | Same weights at every position or task
- Strength is set by the penalty | The idea behind convolutional networks

### Sharing: same weights, many places
- Left: every link has its own weight
- Right: the same weights at every position
- Builds in: a pattern can appear anywhere

### Two kinds of sparsity
- Most weights are zero | Most code values are zero
- L1 penalty on the weights | L1 penalty on the hidden code
- Same for every input | Changes with every input
- A smaller, simpler model | A compact description of each input

### Why L1 gives exact zeros
- L2 shrinks every value in proportion
- L1 moves every value towards zero by a fixed step
- Inside the band the result is exactly zero

### Finding a sparse code
- A signal built from 3 of 40 atoms
- L1 penalty and small steps
- After 300 steps: 3 non-zero values

### How bagging works
- Resample: Draw m examples with replacement from m
- Train: Fit one model on each resampled set
- Repeat: Do it k times for k different models
- Average: Average the outputs, or take a majority vote

### Bootstrap resamples
- Draw with replacement, same size
- Some examples are drawn twice, some left out
- About 64 percent of examples appear

### Averaging the members
- 25 networks, each on its own resample
- Thin blue: members. Thick orange: the average
- Average of 25: 0.1127, a typical member: 0.1370

### Why the average wins
- v: error of one model; c: how errors move together
- Average of k models: v/k + (k-1) c/k
- The error cannot go below c

### Dropout: switch units off at random
- A coin flip for every unit, every step
- 14 droppable units: 16,384 thinned networks
- Keep probability: 0.8 inputs, 0.5 hidden

### One training step with dropout
- Sample a mask: A fresh random list of ones and zeros
- Forward pass: Dropped units send nothing
- Backward pass: Gradients flow through kept units only
- Update: Change the kept weights, then new mask

### The weight scaling rule
- Multiply each weight by its keep probability
- Exact for a softmax layer: geometric mean equals one pass
- Arithmetic mean is slightly different: 0.7192

### Many thinned networks, one average
- Sampled thinned networks, running average in orange
- Green dashed: one weight scaling pass
- Average of 512: 0.1194, one pass: 0.1174

### Dropout in the experiment
- Same network, same 12 points, 15,000 steps
- No dropout: fits the noise, test error 0.1922
- Dropout 0.5: smoother, test error 0.1174
- Twenty runs: mean 0.2009 falls to 0.1193

### Dropout versus bagging
- k separate models | One network holding all thinned ones
- Each model trained to convergence | Each thinned network gets one small step
- Models share nothing | All thinned networks share weights
- k times memory and prediction time | One pass with scaled weights

### Dropout in practice
- Input units | about 0.8 | Multiply weights by 0.8
- Hidden units | about 0.5 | Multiply weights by 0.5
- Output units | 1, never dropped | No change
- Inverted dropout | Divide by p in training | Use the network as is

### Why dropout works
- Huge cheap ensemble: Thousands of thinned networks, one set of weights
- No co-adaptation: A unit cannot lean on particular partner units
- Multiplicative noise: Masks are noise injected into hidden units
- Costs and limits: Needs a bigger network and more steps

### Exam tips and important questions
- Tying and sharing: Write the penalty and state the difference
- Sparse representation: Explain the L1 penalty on the hidden code
- Bagging: Steps, and why averaging lowers error
- Dropout: Mask, weight scaling rule, keep probabilities
- Compare: Dropout versus bagging, four points

### Summary and up next
- Tying pulls parameters together; sharing forces them equal
- Sparse code: L1 penalty on hidden activations
- Bagging: average models on resampled data
- Dropout: random masks, one scaled pass
- Next: adversarial training and tangent methods

### References
- I. Goodfellow, Y. Bengio, A. Courville, Deep Learning, MIT Press, 2016 (ch. 7)
- Explanations and examples in this video are original summaries
