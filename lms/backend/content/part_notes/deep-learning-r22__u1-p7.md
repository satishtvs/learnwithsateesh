### Recap of Part Six
- Supervised algorithms: Logistic regression, support vector machines, neighbours, trees
- Unsupervised algorithms: Principal components and k means find structure
- Stochastic gradient descent: Train on small random batches of data
- Classical challenges: Curse of dimensionality and local constancy

### Why a linear model fails on XOR
- XOR: output 1 only when the inputs differ
- Best linear fit: weights 0, 0 and bias 0.5
- Every input gets 0.5, mean squared error 0.25

### A hidden layer that solves XOR
- First hidden unit: ReLU of x1 + x2
- Second hidden unit: ReLU of x1 + x2 - 1
- Output: first minus 2 times second

### The hidden layer changes the picture
- Inputs move to their hidden-layer positions
- Two inputs land on the same point
- One straight line now separates them

### Gradient-based learning
- Forward pass: Compute the output for the inputs
- Cost: Measure how wrong the output is
- Gradient: The slope of the cost for every weight
- Update: Move each weight a small step downhill

### Neural network costs are not convex
- Linear regression: one bowl, one minimum
- A network cost has several valleys
- The start decides which valley you reach

### Training XOR by gradient descent
- Network: 2 inputs, 4 tanh units, 1 sigmoid output
- Cost starts at 1.385 at step 0
- Cost 0.0031 at step 1500

### Two common cost functions
- Average of squared differences | Negative log probability of the truth
- Gaussian output: maximum likelihood | Bernoulli or categorical: maximum likelihood
- Suits real-valued outputs | Suits yes or no and class outputs
- Slope vanishes when the unit saturates | The logarithm cancels the saturation

### Cross-entropy keeps learning
- Target 1, but the score is -4
- Probability given to the truth: 0.018
- Slope: cross-entropy 0.982, squared error 0.035

### Output units
- Linear | A real number | score unchanged | Squared error
- Sigmoid | Yes or no | 1 / (1 + e^-z) | Cross-entropy
- Softmax | One of k classes | e^zi / sum of e^zj | Cross-entropy

### Softmax in action
- Scores: 3, 1, 0
- Exponentials: 20.09, 2.72, 1.00; sum 23.80
- Probabilities: 0.844, 0.114, 0.042

### Hidden units: Re L U and the others
- ReLU: max(0, z), slope 0 or 1
- Leaky ReLU: small slope for negative z
- Sigmoid and tanh flatten out
- Default choice: ReLU

### Exam tips and important questions
- XOR problem: Show no linear model works; give the Re L U network
- Cost functions: Cross-entropy as maximum likelihood; versus squared error
- Output units: Linear, sigmoid, softmax with a worked example
- Hidden units: Re L U, leaky, sigmoid, tanh; why Re L U is the default
- Gradient-based learning: The four-step loop; cost is not convex

### Summary and up next
- Linear fails: XOR gives mean squared error 0.25
- Hidden layer: Two Re L U units solve XOR
- Cost: Cross-entropy is maximum likelihood
- Output units: Linear, sigmoid and softmax
- Hidden units: Re L U is the default

### References
- I. Goodfellow, Y. Bengio, A. Courville, Deep Learning, MIT Press, 2016 (ch. 6.1 to 6.3)
- Explanations and examples in this video are original summaries
