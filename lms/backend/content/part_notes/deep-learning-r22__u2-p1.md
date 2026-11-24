### Where Unit I ended
- Capacity: How rich a family of functions the model can pick from
- Overfitting: Tiny training error, much larger test error
- Back-propagation: Computes the gradient of the cost for every weight
- Gradient descent: Moves the weights a small step downhill

### What is regularisation?
- Norm penalties: Charge a price for large weights; today
- Extra data: Augment or add noise; Part 2
- Early stopping: Stop training at the right moment; Part 2
- Dropout: Randomly silence units; Part 3
- Ensembles: Average many models; Part 3

### Our example network
- Twelve noisy points from a sine wave
- A network with ten tanh hidden units
- Train error 0.0005, test error 0.1390

### The regularised cost
- Cost J: how badly the data are fitted | Cost J plus alpha times a penalty on the weights
- Minimiser can drive training error to zero | Minimiser must trade data fit against small weights
- Weights are free to grow | Large weights are charged a price
- No knob to turn | Strength alpha is a hyperparameter

### The recipe in four steps
- Pick a penalty: A function of the weights, such as the L2 norm
- Add it to the cost: New cost is J plus alpha times the penalty
- Choose alpha: Try several values, compare the validation error
- Train as usual: Gradient descent and back-propagation, nothing new

### Two penalties, two pulls
- L2: half the sum of squared weights
- L1: the sum of absolute values of weights
- L2 pull grows with the weight, L1 pull is constant

### Choosing the strength alpha
- alpha is zero: No penalty, the network overfits
- alpha is small: Gentle shrinking, smoother curve
- alpha is huge: Weights near zero, the network underfits

### L2 and L1 side by side
- L2, weight decay | half alpha times sum of w squared | alpha times w | Shrinks every weight
- L1, lasso | alpha times sum of absolute w | alpha times sign of w | Zeroes some weights
- Bias terms | Left out of the penalty | None | Free to move

### Weight decay in one update
- Shrink the weight: Multiply w by one minus epsilon times alpha
- Step downhill: Subtract epsilon times the gradient of J
- Repeat: Every step the weights are pulled in a little

### Where the L2 solution lands
- Blue ellipses: contours of the cost J
- L2 moves the minimum towards the origin
- Factor 0.80 in the steep direction, 0.33 in the flat

### See it run: penalty or none
- Red: no penalty, green: alpha 0.01
- Same start, same twelve points
- Final test error 0.1390 against 0.0845

### How strong is strong enough?
- Too little: test error 0.1390
- Best alpha 0.01: test error 0.0845
- Too much: alpha 1 gives 0.5845

### L2 versus L1
- Penalty grows as the square of a weight | Penalty grows as the absolute value
- Pull is proportional to the weight | Pull is a constant push towards zero
- Weights get small but rarely exactly zero | Many weights become exactly zero
- Same as a Gaussian prior on the weights | Same as a Laplace prior on the weights

### Ridge and lasso on real data
- Eight features, only three truly matter
- L2 keeps all eight weights nonzero
- L1 sets four weights exactly to zero

### Watch the solution move
- Green: L2 path, orange: L1 path
- L2 shrinks smoothly towards the origin
- L1 hits the axis: weight 2 becomes zero

### The constrained view
- Penalty view: Add alpha times the norm to the cost
- Constraint view: Keep the norm below a limit k
- Lagrange multiplier: alpha plays the part of the multiplier
- Bigger alpha: Means a smaller allowed region
- Ball and diamond: L2 allows a ball, L1 a diamond

### Penalty or explicit constraint?
- Add alpha times the norm to the cost | Project weights back inside the limit after each step
- Always pulls, even when weights are small | Acts only when the limit is reached
- Can leave units stuck with tiny weights | Avoids dead units and stuck small weights
- One line in the cost function | Needs a projection but allows big learning rates

### Problems with no single answer
- Few examples, many weights: Six examples, ten weights
- Matrix cannot be inverted: X transpose X is singular
- Infinitely many solutions: All fit the six examples perfectly
- Add alpha times identity: Now the matrix has an inverse

### Four zero eigenvalues
- Rank is only 6 for a 10 by 10 matrix
- Four eigenvalues are exactly zero
- Adding 0.1 times identity lifts all to 0.1 or more

### The weights that never settle
- Logistic regression on separable classes
- No penalty: the weights grow without end
- L2 penalty: they settle at about 2.50

### Tuning alpha, the loop
- Pick a value: Start with a power of ten
- Train: Fit the network with that alpha
- Check validation: Never the test set
- Change by ten: Go up if it overfits, down if not

### Exam tips and important questions
- Define: Regularisation and the regularised cost
- Write: The L2 and L1 penalties and gradients
- Derive: The weight decay update
- Compare: L2 against L1, with a sparsity figure
- Explain: Penalty against constraint, and singular cases

### Summary and up next
- Add alpha times a norm of the weights to the cost
- L2 shrinks, L1 gives exact zeros
- Penalty equals a constraint, alpha is the multiplier
- Next: data augmentation, noise, early stopping

### References
- I. Goodfellow, Y. Bengio, A. Courville, Deep Learning, MIT Press, 2016 (ch. 7)
- Explanations and examples in this video are original summaries
