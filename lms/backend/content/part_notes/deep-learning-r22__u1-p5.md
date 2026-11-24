### Recap of Part 4: bias and variance
- The average estimate is off target | The estimate moves with the data
- Too simple a model: high bias, underfits | Too flexible a model: high variance, overfits
- Total error = bias squared + variance | One number to judge an estimator

### The idea of maximum likelihood
- Data: Observed examples, such as ten coin flips
- Model: A probability rule with an unknown parameter p
- Likelihood: Probability of the data, for every p
- Best value: The p that makes the data most probable

### A coin, one flip at a time
- Each flip reshapes the likelihood curve
- The peak sits at heads divided by flips
- After 10 flips: 7 heads, peak at p = 0.7

### Likelihood to negative log-likelihood
- Likelihood: a very small product
- Log turns the product into a sum
- Negative log-likelihood is a cost to minimise

### A Gaussian slides and widens
- First slide the centre to the data
- Then widen to the right spread
- Best mean 5.3, best spread 0.99

### Conditional log-likelihood
- We need p(y given x), not just p(y)
- Assume y is Gaussian around the line
- Same spread at every x

### Mean squared error is maximum likelihood
- NLL = constant + sum of squares over 2 sigma squared
- With fixed spread only the squared error changes
- Same best line: w = 0.96

### Properties of maximum likelihood
- Consistent: Estimate reaches the true value as data grows
- Efficient: Lowest error among consistent rules, for large data
- Can be biased: Gaussian variance divides by n
- Small data: Two heads in a row gives p equal to one

### Consistency in a simulation
- Only a few flips: estimates from 0.6 to 0.8
- Many flips: estimates from 0.679 to 0.711
- True value of p is 0.7

### The Bayesian view: prior to posterior
- Prior: Belief about p before seeing the data
- Likelihood: How well each p explains the data
- Posterior: Updated belief: prior times likelihood, rescaled
- New prior: Today's posterior is tomorrow's prior

### Bayesian update, flip by flip
- Grey dashed: the prior, a bump at 0.5
- Blue: likelihood. Orange: posterior
- After 10 flips: peak 0.667, mean 0.643

### MAP and weight decay
- MAP: maximise log-likelihood plus log-prior
- Gaussian prior on w gives the penalty lambda x w squared
- Penalty 5: w = 0.747. Penalty 17.5: w = 0.48

### Three estimates of the same coin
- 0.700: Maximum likelihood estimate: heads over flips
- 0.667: MAP estimate: the peak of the posterior
- 0.643: Posterior mean: the Bayesian average

### Bayesian versus frequentist
- The parameter is a fixed unknown number | The parameter has a distribution
- Uncertainty comes from the random dataset | Uncertainty is a belief updated by data
- Usually one answer, such as M L E | Keeps the whole posterior
- Cheap, scales to big models | Costly: needs sums or sampling

### Exam tips and important questions
- Likelihood: Define likelihood and the negative log-likelihood cost
- Coin derivation: Derive p = heads / flips for a coin
- Squared error: Show that mean squared error is maximum likelihood
- MAP: Explain MAP and its link to weight decay
- Two schools: Compare Bayesian and frequentist views

### Summary and up next
- Likelihood: Probability of the data as a function of the parameter
- Negative log-likelihood: The cost: a sum, to be minimised
- Squared error: Gaussian noise makes MSE maximum likelihood
- Properties: Consistent, but biased or extreme on small data
- Posterior: Prior times likelihood, rescaled
- MAP: Posterior peak: Gaussian prior is weight decay

### References
- I. Goodfellow, Y. Bengio, A. Courville, Deep Learning, MIT Press, 2016 (ch. 5, sections 5.5 and 5.6)
- Explanations and examples in this video are original summaries
