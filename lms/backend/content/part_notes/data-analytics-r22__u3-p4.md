### Recap: Part Three in four cards
- Several predictors: Each slope holds the others fixed
- Dummy variables: A category becomes zero or one
- Collinearity: Tangled predictors have a high V I F
- Selection: Final: advertising, discount, weekend

### Today in four steps
- Measures of fit: R squared, adjusted R squared, standard error
- Tests: The F test for the whole model, t tests for each term
- Residual analysis: Do the assumptions hold?
- Using the model: Interpret, predict and give intervals

### How much variation is explained?
- Advertising alone: R squared 0.6406
- Advertising, weekend, discount: 0.8887
- Plus visits and weather noise: 0.8929

### The measures of fit
- R squared: One minus S S E over total variation: 0.8887
- Adjusted R squared: Penalises extra predictors: 0.8827
- Standard error: Typical size of a residual: 6.06
- The warning: High R squared is not proof of a correct model

### Actual against predicted
- Each point is one of the 60 days
- Weekend days lie in the upper part
- Typical gap: 6.06 thousand rupees

### R squared against adjusted R squared
- Real model: 0.8887 and 0.8827
- Add 3 useless columns: 0.8919 and 0.8796
- Add 12: 0.9000 and 0.8659

### The F test: is the model useful at all?
- Regression | 16,415.9 | 3 | 5,472.0
- Residual (error) | 2,056.2 | 56 | 36.72
- Total | 18,472.1 | 59 | 
- F = ratio of mean squares | 5,472.0 / 36.72 |  | 149.0

### Carrying out the F test
- Null hypothesis: All slopes are zero; the alternative: at least one is not
- Compute F: Mean square of regression over mean square of error: 149.0
- Compare: With the F distribution on 3 and 56 degrees of freedom
- Decision: p-value below 0.001: reject H zero; the model is useful

### The t tests for each term
- Intercept | 28.77 | 2.37 | 12.1 | below 0.001
- Advertising | 4.50 | 0.27 | 17.0 | below 0.001
- Discount | 1.09 | 0.14 | 8.1 | below 0.001
- Weekend | 15.12 | 1.78 | 8.5 | below 0.001

### Ninety five percent intervals
- 4.50: Advertising: 95 percent interval 3.97 to 5.03
- 1.09: Discount: 95 percent interval 0.82 to 1.36
- 15.12: Weekend: 95 percent interval 11.56 to 18.68

### Predicting with a margin
- Spend 8, weekday: predicted 75.7
- Average-day interval 73.7 to 77.6
- One new day: 63.4 to 88.0

### Residual analysis: a missing variable
- Without weekend: R squared 0.7450
- Weekend days: mean residual +10.97
- With weekend: mean residual 0.00

### Residual analysis: four checks
- Against fitted: no fan, no curve
- Normal plot: correlation 0.994
- Time order: Durbin-Watson 2.14

### Interpreting the final model
- Fit: Explains 88.9 percent of the variation in sales
- Significance: F test and every t test: p-value below 0.001
- Meaning: Advertising 4.50, discount 1.09, weekend 15.12
- Cautions: Association, not cause; stay in the data range

### Exam tips and important questions
- R squared and adjusted R squared | Formulas, meaning, why adjusted R squared penalises
- F test and t test | Hypotheses, statistic, degrees of freedom, decision
- Residual analysis | Fitted plot, normal plot, time order; what each shows
- Interpret a fitted model | Slopes with others fixed, fit, tests, cautions

### Summary
- Fit: R squared; adjusted R squared; standard error
- Tests: F test for the model; t test for each term
- Residuals: Check fan, curve, normality and time order
- Using it: Interpret slopes; predict with intervals

### References
- J. Han, M. Kamber, J. Pei, Data Mining: Concepts and Techniques, 3rd ed., Morgan Kaufmann
- Student's Handbook for Associate Analytics, named in the syllabus
- Regression and logistic regression: standard statistics textbooks
- Explanations, examples and numbers in this video are original
