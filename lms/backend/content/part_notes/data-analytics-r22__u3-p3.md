### Recap: Part Two in four cards
- BLUE: Least squares is best linear unbiased
- Five assumptions: Linear, zero mean, equal spread, independent, no collinearity
- Residual plots: Fans, curves and runs reveal failures
- Variance inflation: One over one minus R squared warns of collinearity

### Today in four steps
- Several predictors: The model and what each slope means
- Dummy variables: Putting categories into a regression
- Multicollinearity: Spot it with the V I F
- Selecting variables: Forward, backward and stepwise

### The retailer's sixty days
- We simulated 60 days of sales data
- Sales and advertising correlate 0.80
- Advertising and visits correlate 0.98

### The multiple regression model
- The equation: y = b zero + b one x one + b two x two + ... + error
- Each slope: Change in y for one more unit of that x, others fixed
- Same method: Least squares: smallest sum of squared errors
- Matrix form: b equals (X transpose X) inverse times X transpose y

### The fitted model for the retailer
- Intercept | 28.77 | Sales on a weekday with no spend or discount
- Advertising | 4.50 | Per extra thousand of spend, others fixed
- Discount | 1.09 | Per extra percent of discount, others fixed
- Weekend | 15.12 | Extra sales on a weekend, others fixed

### Dummy variable: a category as zero or one
- Weekend = 1, weekday = 0
- Advertising slope 4.50, two intercepts
- The weekend line sits 15.12 higher

### More than two categories: k minus one dummies
- None (the baseline) | 0 | 0
- Minor festival | 1 | 0
- Major festival | 0 | 1

### Collinearity changes the coefficients
- Advertising alone: 4.74 plus or minus 0.93
- With discount and weekend: 4.50 plus or minus 0.53
- Adding site visits: 2.70 plus or minus 2.98

### The variance inflation factor
- Advertising: V I F 32.6; visits 32.8
- Discount, weekend and noise: about 1.0
- Rule of thumb: above 5 or 10 is a concern

### Four ways to choose variables
- Forward selection: Start empty, add the best one at a time
- Backward elimination: Start full, remove the weakest one at a time
- Stepwise: Add and re-check removals at each step
- All subsets: Try every combination: 31 for five predictors

### Forward selection, step by step
- Step 1: site visits, adjusted R squared 0.6544
- Then weekend 0.7583, discount 0.8790
- Then advertising 0.8838; weather noise rejected

### Backward elimination by p-values
- Drop weather noise first: p-value 0.43
- Then site visits: p-value 0.22
- Stop: all p-values below 0.05

### Forward and backward do not always agree
- Starts with no variables | Starts with all five variables
- Adds the best candidate each step | Drops the largest p-value each step
- Ends with visits, weekend, discount, advertising | Ends with advertising, discount, weekend
- Adjusted R squared 0.8838 | Adjusted R squared 0.8827

### Choosing the final model
- Statistics: Adjusted R squared and p-values
- Collinearity: V I F low: keep one of a tangled pair
- Business sense: Signs sensible; variable can be controlled
- Simplicity: Fewer variables are easier to explain
- Residual checks: Plots show no fan, curve or run

### Exam tips and important questions
- Multiple regression model | Equation, meaning of a slope with others fixed
- Dummy variables | Code categories 0 or 1; k levels need k minus 1 dummies
- Multicollinearity and VIF | Tangled predictors; VIF = 1 over (1 minus R squared); above 5 or 10
- Variable selection methods | Forward, backward, stepwise, all subsets; criteria

### Summary
- Several predictors: Each slope holds the others fixed
- Dummy variables: Category as zero or one; k minus one for k levels
- Tangled predictors: Estimates become unstable; the V I F shows it
- Selection: Forward, backward, stepwise; add judgement

### References
- J. Han, M. Kamber, J. Pei, Data Mining: Concepts and Techniques, 3rd ed., Morgan Kaufmann
- Student's Handbook for Associate Analytics, named in the syllabus
- Regression and logistic regression: standard statistics textbooks
- Explanations, examples and numbers in this video are original
