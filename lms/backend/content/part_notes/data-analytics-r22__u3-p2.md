### Recap: Part One in four cards
- The model: y equals b zero plus b one x plus error
- The loss: The sum of squared errors, S S E
- The estimates: Slope 5.643, intercept 34.31 for our six days
- The cautions: Stay inside the data; watch outliers

### Today in four steps
- Estimators: A recipe that turns a sample into a number
- BLUE: What best linear unbiased means
- Five assumptions: The conditions behind the theorem
- What breaks: Residual plots and collinearity

### BLUE spelled out
- Estimator: A rule that turns sample data into an estimate
- Linear: The estimate is a weighted sum of the y values
- Unbiased: On average over samples it hits the true value
- Best: Among those, it has the smallest variance

### Unbiased: many samples, one centre
- One sample: fitted slope 4.92
- Mean slope of 50 lines: 5.17
- Mean of 3,000 slopes: 5.00

### Best: least squares against a rival
- Rival: slope through the first and last day
- Both centre on 5: 5.00 and 5.00
- Spread: least squares 0.55, rival 1.02

### Theory agrees with simulation
- Variance of the slope: sd 0.536
- Simulation: sd 0.549
- Rival: theory 1.029, simulated 1.023

### Unbiased is not the same as best
- Right on average over many samples | Least scattered among the unbiased ones
- About the centre of the estimates | About the spread of the estimates
- Both our estimators have it | Only least squares has it
- Lost if the model is wrongly specified | Lost if variance or errors misbehave

### The Gauss-Markov assumptions
- Linear in parameters: y is a line in b zero and b one, plus error
- Errors average zero: Given x, the error has mean zero
- Constant variance: Spread of the errors is the same at every x
- Independent errors: One day's error tells nothing about another's
- No perfect collinearity: x varies; no predictor is an exact copy of others

### Residual plots: what each failure looks like
- Good: spread ratio 1.14, Durbin-Watson 2.03
- Fan shape: spread ratio 3.13
- Linked errors: Durbin-Watson 0.43

### What goes wrong, and the usual remedy
- Curved truth | Estimates are biased | Add a square term or transform
- Unequal variance | Not best; standard errors wrong | Log transform, weighted least squares
- Linked errors | Standard errors too small | Add lagged terms, time series model
- Near collinearity | Variance of estimates explodes | Drop or combine predictors

### Collinearity inflates the variance
- Uncorrelated predictors: sd 1.26
- Correlation 0.9: sd 2.90, VIF 5.3
- Correlation 0.99: sd 8.97, VIF 50.3

### The design controls the variance
- Base: 20 days, spend 1 to 12: sd 0.54
- Twice the days: sd 0.39; narrow spend range: 1.96
- Half the noise: sd 0.27

### Checking the assumptions in practice
- Fit the model: Least squares on all the data
- Plot residuals: Against fitted values and against time
- Measure: Spread ratio, Durbin-Watson, V I F
- Repair and refit: Transform, add a term, or drop a predictor

### Exam tips and important questions
- What is BLUE? | Best: least variance; linear; unbiased; estimator
- State the Gauss-Markov assumptions | Linear, zero mean, equal variance, independent, no collinearity
- Consequences of unequal variance | Unbiased but not best; wrong standard errors
- Variance inflation factor | One over (1 minus R squared); drop or combine

### Summary
- Estimator: A recipe whose answer varies by sample
- BLUE: Linear, unbiased, smallest variance
- Five assumptions: Linear, zero mean, equal spread, independent, no collinearity
- Failures: Plot residuals; check the V I F

### References
- J. Han, M. Kamber, J. Pei, Data Mining: Concepts and Techniques, 3rd ed., Morgan Kaufmann
- Student's Handbook for Associate Analytics, named in the syllabus
- Regression and logistic regression: standard statistics textbooks
- Explanations, examples and numbers in this video are original
