### Recap of Part Three
- Hyperparameters: Settings chosen before training
- Validation set: Held-back data used to choose them
- Cross-validation: Every fold takes a turn as validation

### Point estimation: guessing one number
- Parameter: The true value we want, such as a real mean
- Sample: The data we actually managed to collect
- Estimator: A rule that turns a sample into a guess
- Estimate: The number the rule gives on our sample

### Estimators of a mean and a variance
- Sample mean | Add all values, divide by n | 70 / 5 = 14
- Variance, biased | Squared deviations, divide by n | 30 / 5 = 6.0
- Variance, unbiased | Squared deviations, divide by n - 1 | 30 / 4 = 7.5

### The five numbers on a line
- Dots are the values, orange line is the mean 14
- Squared deviations add up to 30
- Biased 6.0, unbiased 7.5

### Bias: the average miss
- 20000 samples of 5 values, true variance 100
- Divide by n: average 79.99
- Divide by n - 1: average 99.99

### Variance and standard error
- 5: standard error of the mean, sample size 4
- 2.5: standard error, sample size 16
- 1.25: standard error, sample size 64
- 0.625: standard error, sample size 256

### Watch the estimate settle on the truth
- Each frame: 5000 sample means
- The hump narrows as n grows
- It settles on the true mean, 50

### Unbiased is not the same as consistent
- Average of the estimates equals the truth | The estimates reach the truth as n grows
- Describes one fixed sample size | Describes a growing sample size
- Can still be very noisy | Noise shrinks to zero
- Divide by n - 1 variance: yes | Both variance estimators: yes

### Mean squared error: bias and variance together
- MSE = bias squared + variance
- Sample mean: variance 2.47, MSE 2.47
- Half of it: bias squared 1.02, variance 0.62, MSE 1.63

### One dataset, three models
- Red: a stiff straight line
- Orange: a cubic, follows the wave
- Blue: degree 6, bends to the noise

### Fitting again and again
- Top: stiff line, small spread, big gap
- Bottom: flexible curve, big spread, small gap
- Gap is bias, spread is variance

### Bias and variance, measured
- Stiff: bias squared 0.177, variance 0.021
- Balanced: 0.0035 and 0.0139
- Flexible: 0.0001 and 0.0615

### The bias-variance trade-off curve
- Bias squared falls as flexibility grows
- Variance rises as flexibility grows
- Total error is lowest in between

### Exam tips and important questions
- Point estimation: Define parameter, estimator and estimate with an example
- Variance estimators: Why dividing by n - 1 removes the bias
- Mean squared error: Write bias squared + variance with the steps
- Trade-off: Draw the curves, mark underfit and overfit
- Consistency: Unbiased and consistent are different ideas

### Summary and up next
- Estimator: A rule that turns a sample into a guess for a parameter
- Bias and variance: Average miss and spread; n - 1 makes the variance unbiased
- Total error splits: MSE = bias squared + variance; the best model sits in between
- Up next: Part 5: Maximum likelihood and Bayesian statistics

### References
- I. Goodfellow, Y. Bengio, A. Courville, Deep Learning, MIT Press, 2016 (ch. 5, section 5.4)
- Explanations, simulations and examples in this video are original
