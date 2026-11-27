### Recap: Part Four in four cards
- Fit: R squared, adjusted R squared, standard error
- Tests: F test for the model, t test per term
- Residuals: Check fan, curve, normality, time order
- Using it: Interpret slopes; predict with intervals

### Today in four steps
- Why not a line: A probability must stay between 0 and 1
- Odds and log odds: Another way to talk about chance
- The sigmoid: Turns any score into a probability
- Maximum likelihood: How the coefficients are found and read

### Why not an ordinary line?
- The outcome: 1 if churned, 0 if stayed; 251 of 600 churned
- 19 fitted values fall below 0
- 9 fitted values rise above 1

### From probability to odds to log odds
- 0.10 | 0.111 | -2.197
- 0.25 | 0.333 | -1.099
- 0.50 | 1.000 | 0.000
- 0.75 | 3.000 | 1.099
- 0.90 | 9.000 | 2.197

### The logistic model in three steps
- A linear score z: z = b zero + b one x one + b two x two ...
- Odds: The odds of the event are e to the power z
- Probability: p = 1 over (1 + e to the minus z): the sigmoid
- The idea: The log odds are a straight line in the x's

### The sigmoid: what the numbers do
- Slope 0.5, 1, 2, 4: probability at x = 1 is 0.622, 0.731, 0.881, 0.982
- Intercept minus 2: probability at 0 is 0.119
- Intercept 2: probability at 0 is 0.881

### Likelihood by hand: six customers
- 3 | 1 | 0.587 | 0.587
- 8 | 1 | 0.525 | 0.525
- 14 | 0 | 0.450 | 0.550
- 22 | 1 | 0.354 | 0.354
- 30 | 0 | 0.269 | 0.731
- 41 | 0 | 0.175 | 0.825
-  |  | Log-likelihood | -3.319

### Searching for the best coefficients
- Guess the coefficients: Start from zero for all of them
- Compute probabilities: Find p for every customer, then the log-likelihood
- Move uphill: Step towards larger log-likelihood
- Repeat until flat: Stop when the log-likelihood stops rising

### The log-likelihood map
- Each ring joins equal log-likelihood
- Start at zero: log-likelihood -415.89
- Best: intercept 1.039, slope -0.0571

### Climbing the hill, step by step
- Step 0: flat curve, log-likelihood -415.89
- Step 4: slope -0.0336, log-likelihood -376.96
- Step 40: log-likelihood -368.86

### The fitted model: coefficients and odds ratios
- Intercept | 0.380 | 1.462 | Odds at 0 months and 0 complaints
- Tenure (month) | -0.0713 | 0.931 | Odds fall 6.9 percent per month
- Complaints | 0.790 | 2.203 | Odds more than double per complaint

### Odds multiply, probabilities saturate
- No complaints: odds 0.62, probability 0.383
- Two complaints: odds 3.01, probability 0.751
- Five complaints: odds 32.24, probability 0.970

### A worked probability
- 1.103: Score z: 0.380 - 0.0713 x 12 + 0.790 x 2
- 3.015: Odds of churn: e to the power z
- 0.751: Probability of churn: odds over (1 + odds)
- Churn: Predicted class at the 0.5 cut-off

### Reading a coefficient
- The sign: Positive raises the odds, negative lowers them
- The size: e to the coefficient is the odds ratio
- One unit: Per one unit of x, with the others fixed
- A warning: The change in probability depends on where you are

### Exam tips and important questions
- Why logistic and not linear regression? | Probability stays in 0 to 1; outcome is binary
- Odds, log odds and the sigmoid | p over 1 minus p; logarithm; one over 1 plus e to minus z
- Maximum likelihood | Likelihood, log-likelihood, iterative search, one peak
- Interpret a coefficient | e to the coefficient is the odds ratio, others fixed

### Summary
- Why logistic: A line leaves 0 to 1; the S curve does not
- Odds and logit: Log odds are a straight line in the predictors
- Maximum likelihood: Search for the peak of the log-likelihood
- Odds ratio: e to the coefficient: odds per unit of x

### References
- J. Han, M. Kamber, J. Pei, Data Mining: Concepts and Techniques, 3rd ed., Morgan Kaufmann
- Student's Handbook for Associate Analytics, named in the syllabus
- Regression and logistic regression: standard statistics textbooks
- Explanations, examples and numbers in this video are original
