### Recap: four ideas we need
- Mean and spread: The mean is the centre, the variance measures spread
- Correlation: A number between minus one and one for a straight-line link
- A straight line: y equals an intercept plus a slope times x
- Derivative: At the lowest point of a curve the slope is zero

### Today in four steps
- The model: A line plus random error
- The loss: Add up the squared errors
- The estimates: Set the slope of the loss to zero
- The example: Six days, worked by hand

### Six days of advertising and sales
- Six days of data from our retailer
- Sales rise from 48 to 92 thousand rupees
- Means: spend 6, sales 68.17

### The model: a line plus error
- Response y: What we want to predict: daily sales
- Predictor x: What we know: advertising spend
- Intercept and slope: Two unknown numbers, b zero and b one
- Error e: What the line cannot explain on each day

### Which line is best? Move the slope
- Slope 3: S S E is 306.83
- Slope 8: S S E is 246.83
- Slope 5.64 gives the smallest, 13.48

### The loss: sum of squared errors
- Error = actual minus predicted
- Poor line, slope 3: S S E 306.83
- Best line, slope 5.64: S S E 13.48

### Why squares and not plain errors?
- Plain errors cancel: positive and negative add to zero | Squares are never negative, so errors cannot cancel
- Absolute values have a sharp corner at zero | Squares are smooth, so calculus gives a formula
- Every error counts in proportion to its size | A big error counts much more than a small one
- No simple formula; needs a search | Closed form: two equations, two unknowns

### Deriving the estimates
- Write the loss: S S E is the sum of y minus b zero minus b one x, squared
- Differentiate: Find the slope of S S E with respect to each unknown
- Set both to zero: The bottom of the bowl is where both slopes vanish
- Solve the pair: Two equations, two unknowns: b zero and b one

### The least squares formulas
- Mean of x and y | Total divided by n | 6 and 68.17
- S x x | Sum of squared deviations of x | 42
- S x y | Sum of x deviation times y deviation | 237
- Slope b1 | S x y divided by S x x | 5.643
- Intercept b0 | Mean of y minus slope times mean of x | 34.31

### Worked example: the table
- 2 | 48 | -4 | -20.17 | 80.67
- 4 | 55 | -2 | -13.17 | 26.33
- 5 | 61 | -1 | -7.17 | 7.17
- 7 | 74 | 1 | 5.83 | 5.83
- 8 | 79 | 2 | 10.83 | 21.67
- 10 | 92 | 4 | 23.83 | 95.33
- Totals |  | squares 42 |  | 237

### The fitted line and a prediction
- sales = 34.31 + 5.643 x spend
- Each extra 1 thousand of spend: 5.64 thousand more sales
- Spend 9 predicts sales of 85.10

### How a computer finds the line
- Start: a flat line, S S E 6,111
- After 4 steps the slope is 5.64
- After 40 steps S S E is 13.65

### Properties of the least squares line
- Through the means: The line always passes through the point of means
- Errors add to zero: Sum of the six residuals is zero
- Errors unrelated to x: Residuals multiplied by x also add to zero
- Smallest S S E: No line beats 13.48 on this data
- Link to correlation: Slope = correlation 0.995 times (spread of y over spread of x)

### One far point can drag the line
- A seventh day at spend 12, sales 104: slope 5.78
- Same day with sales 74: slope 3.66
- With sales 44: slope 1.55

### Common mistakes
- Extrapolating: Spend 20 predicts 147.17, far beyond the data
- Mixing up cause: Association is not proof of cause
- Ignoring outliers: One far point can drag the line
- Skipping the plot: Always draw the points first

### Exam tips and important questions
- Derive the least squares estimates | Write S S E, differentiate, set to zero, solve
- Write the slope and intercept formulas | Slope S x y over S x x; intercept mean y minus slope mean x
- Why squared errors? | No cancelling, smooth, closed form, big errors count more
- Numerical problem | Table of deviations, S x y, S x x, then line and prediction

### Summary
- The model: y equals b zero plus b one x plus error
- The loss: The sum of squared errors
- The estimates: Slope 5.643, intercept 34.31 for our data
- The cautions: Stay inside the data; watch outliers

### References
- J. Han, M. Kamber, J. Pei, Data Mining: Concepts and Techniques, 3rd ed., Morgan Kaufmann
- Student's Handbook for Associate Analytics, named in the syllabus
- Regression and logistic regression: standard statistics textbooks
- Explanations, examples and numbers in this video are original
