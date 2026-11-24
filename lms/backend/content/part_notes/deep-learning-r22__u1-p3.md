### Recap of Part Two
- Capacity: The range of functions a model can fit
- Underfitting: Capacity too low: even the training error is high
- Overfitting: Capacity too high: tiny training error, large new-data error
- Generalisation: Doing well on examples never seen in training

### Parameters and hyperparameters
- Learned by the algorithm from the training data | Chosen by us before the training starts
- Weights and biases of the model | Degree, learning rate, weight decay
- Change at every training step | Stay fixed during one training run
- Training error can guide them | Training error cannot choose them

### Why the test set must stay locked
- Choosing by the best test score makes it a training aid
- Picked on the test set: reported 0.35, real 0.47
- Picked on validation: reported 0.46, real 0.47

### Splitting the data once
- Shuffle the pool first
- Training 24, validation 8, test 8
- 60, 20, 20 is a common ratio

### Three sets, three jobs
- Training set: Fits the parameters by gradient descent
- Validation set: Chooses the hyperparameters and compares models
- Test set: Gives the final honest score, used once
- After the choice: Retrain on training plus validation data, then test once

### Degree 3 against degree 9
- Both curves are fitted on the 24 training points only
- Training error: degree 3 is 0.34, degree 9 is 0.26
- Validation error: degree 3 is 0.41, degree 9 is 6.49

### The validation curve for the degree
- Fit each degree on the training set
- Training error only falls
- Validation error is lowest at degree 3

### k-fold cross-validation
- Cut the data into k equal folds
- Each fold takes one turn as validation
- Average the k errors

### Five folds, worked out
- 1 | points 3 and 7 | 0.18
- 2 | points 4 and 10 | 0.80
- 3 | points 1 and 6 | 0.74
- 4 | points 5 and 9 | 0.21
- 5 | points 2 and 8 | 0.17
- Mean | all ten points | 0.42

### Choosing the degree by cross-validation
- Repeat the same folds for degrees 1 to 5
- Means: 1.26, 1.68, 0.42, 0.76, 1.30
- Degree 3 is clearly the lowest

### The model selection recipe
- Lock the test set: Split it off first and do not touch it
- List candidates: Degrees, learning rates, weight decay values
- Validate each: Train on training data, score on validation data
- Pick the best: Lowest validation error wins; retrain if you wish
- Test once: Report the final score and stop tuning

### Choosing the learning rate
- 0.001: 10 steps are not enough
- 0.1: the lowest validation error, 1.00
- 1.1: training diverges

### Common mistakes: leakage
- Tuning on the test set: The final score becomes optimistic
- Scaling on all the data: Fit mean and spread on training data only
- Duplicates across sets: The same example in train and test gives fake accuracy
- Peeking many times: Every look at the test set leaks a little

### Stratified and time-series splits
- Stratified: keep the class mix in every fold
- Random folds held 3, 2, 3, 0 and 2 rare examples
- Time series: train on the past, validate on the next block

### Exam tips and important questions
- Definitions: Parameter versus hyperparameter, two examples each
- Three sets: Role of training, validation and test sets
- Cross-validation: Draw the folds and compute the mean error
- Choosing: Validation curve for the degree; log scale for the rate
- Leakage: List the mistakes; add stratified and time series

### Summary and up next
- Two kinds of numbers: Parameters are learned; hyperparameters are chosen
- Three sets: Train fits, validation chooses, test reports once
- Validation curve: Degree 3 had the lowest validation error, 0.41
- Cross-validation: Five folds, mean error 0.42 for degree 3
- Leakage: Never let the test set influence a choice
- Next: Part 4: Estimators, bias and variance

### References
- I. Goodfellow, Y. Bengio, A. Courville, Deep Learning, MIT Press, 2016 (ch. 5, section 5.3)
- Explanations and examples in this video are original summaries
