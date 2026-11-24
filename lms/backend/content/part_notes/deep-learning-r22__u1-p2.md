### Where we left off
- Learning: T, P, E: A program learns when P improves on task T with experience E
- Linear regression: Predict a number with the line w x + b
- Cost function: The mean squared error scores every line
- The recipe: Dataset, model, cost, optimisation

### Two kinds of error
- Measured on the training set | Measured on new examples
- The error we reduce while learning | The error we actually care about
- Can always be pushed towards zero | Also called the test error
- Optimisation problem | Machine learning problem

### How we measure generalisation
- Collect data: Examples drawn from the same source
- Split: Keep a test set aside, never used for learning
- Fit: Choose parameters by lowering the training error
- Measure: Report the test error as the honest score

### Capacity and the hypothesis space
- Hypothesis space: all functions a model can pick
- Capacity: how rich that space is
- More parameters, more capacity

### Same ten points, growing degree
- Ten noisy points from a smooth curve
- Training error falls at every step
- Test error falls, then rises

### Degree one, three and nine
- Degree 1: too stiff to follow the wave
- Degree 3: follows the wave, ignores the noise
- Degree 9: passes through every point

### The numbers side by side
- 0.1857: Test error at degree 1: underfitting
- 0.0812: Test error at degree 3: the best of all ten
- 0.2567: Test error at degree 9: overfitting, with zero training error

### Underfitting versus overfitting
- Capacity is too low | Capacity is too high for the data
- Training error is high | Training error is very low
- Test error is high too | Test error is much higher
- Fix: richer model, better features | Fix: more data, simpler model, penalty

### The U shaped test error curve
- Training error only goes down
- Test error is U shaped
- Best capacity sits at the bottom

### Occam's razor and VC dimension
- Occam's razor: Among equally good models, pick the simplest
- VC dimension: The largest set of points a model can shatter
- The bound: Gap grows with capacity, shrinks with more examples

### No free lunch
- Average over all possible problems
- Every learner scores the same: 0.50
- So we choose a model for our problem

### More data lowers overfitting
- Same degree 9 curve every time
- Only the number of examples changes
- Test error falls from 0.2567 to 0.0588

### A first look at regularisation
- Add a penalty on large weights to the cost
- Small penalty: test error drops to 0.0802
- Too large a penalty underfits: 0.2440

### Exam tips and important questions
- Define the terms: Training error, generalisation error, capacity
- Compare: Underfitting versus overfitting, with a figure
- Draw the curve: The U shaped test error against capacity
- Theory: State Occam, VC dimension and no free lunch
- Remedies: More data, simpler model, regularisation

### Summary and up next
- Generalisation: do well on new data
- Low capacity underfits, high capacity overfits
- Best test error at degree 3: 0.0812
- Next: hyperparameters and validation sets

### References
- I. Goodfellow, Y. Bengio, A. Courville, Deep Learning, MIT Press, 2016 (ch. 5)
- Explanations and examples in this video are original summaries
