### Recap: Part Five in four cards
- Why logistic: A line leaves 0 to 1; the S curve does not
- Odds and logit: Log odds are a straight line in the x's
- Maximum likelihood: Search for the peak of the log-likelihood
- Odds ratio: e to the coefficient: odds per unit of x

### Today in four steps
- Fit statistics: Deviance, likelihood ratio test, pseudo R squared
- Classification: The confusion matrix at a cut-off
- ROC and AUC: Quality across all cut-offs
- Building the model: Steps, costs and business uses

### Log-likelihood and deviance
- Null log-likelihood | Model with an intercept only | -407.85
- Model log-likelihood | Tenure and complaints | -327.81
- Null deviance | Minus 2 times null log-likelihood | 815.70
- Residual deviance | Minus 2 times model log-likelihood | 655.63

### Deviance falls as predictors enter
- No predictor: deviance 815.70
- Tenure added: 737.72, a fall of 78.0
- Complaints added: 655.63, a further fall of 41.0

### The likelihood ratio test
- Null hypothesis: Both slopes are zero; alternative: at least one is not
- Compute the statistic: Null deviance minus residual deviance: 160.07
- Compare: With chi-square on 2 degrees of freedom; 5 percent cut-off 5.99
- Decision: p-value below 0.001: reject H zero; the model helps

### Tests for single coefficients (Wald)
- Intercept | 0.3796 | 0.2024 | 1.88 | 0.061
- Tenure | -0.0713 | 0.0078 | -9.13 | below 0.001
- Complaints | 0.7899 | 0.0978 | 8.08 | below 0.001

### Pseudo R squared and AIC
- McFadden R squared: One minus model log-likelihood over null: 0.1962
- AIC: Deviance plus 2 times parameters: 661.63
- Use of AIC: Smaller is better when comparing models on the same data
- Caution: Pseudo R squared is not comparable with linear R squared

### From probability to decision: the cut-off
- Top row: 43 flagged, 34 missed
- Bottom row: 80 left alone, 23 flagged wrongly
- Accuracy 0.683 on 180 test customers

### Measures from the confusion matrix
- Accuracy: Correct over all: 123 of 180 = 0.683
- Precision: Flagged who really churn: 43 of 66 = 0.652
- Recall (sensitivity): Churners caught: 43 of 77 = 0.558
- Specificity: Stayers left alone: 80 of 103 = 0.777

### Moving the cut-off
- Cut-off 0.2: recall 1.000, precision 0.546
- Cut-off 0.5: recall 0.558, precision 0.652
- Cut-off 0.8: recall 0.182, precision 0.933

### The ROC curve
- Cut-off 0.7: catch 0.286, false alarms 0.058
- Cut-off 0.5: catch 0.558, false alarms 0.223
- Cut-off 0.3: catch 0.857, false alarms 0.476

### Area under the curve
- 0.789: AUC: area under the ROC curve, test set
- 0.789: The same number is the chance a churner scores higher
- 0.500: AUC of a useless model on the diagonal
- 1.000: AUC of a perfect model

### Building a churn model: five steps
- Define the outcome: Who counts as churned, over which period
- Prepare the data: Clean, code dummies, check collinearity
- Split: Train on 70 percent; keep 30 percent for testing
- Fit and check: Coefficients, likelihood ratio test, Wald tests
- Evaluate and choose: ROC, AUC, confusion matrix and the cut-off

### Choosing the cut-off by cost
- Assumed: missed churner 1,500 rupees, false alarm 100
- Cut-off 0.5: total cost 53,300
- Lowest cost 6,400 at cut-off 0.20

### Business uses of logistic regression
- Customer churn: Who will leave telecom, banking or a subscription
- Credit risk: Will a borrower default on a loan
- Fraud detection: Is this transaction fraudulent
- Campaign response: Who will respond to an offer
- Health care: Will a patient develop a disease

### Exam tips and important questions
- Deviance and likelihood ratio test | Deviance = minus 2 log-likelihood; statistic; chi-square; decision
- Pseudo R squared and AIC | McFadden formula; AIC = deviance + 2 times parameters
- Confusion matrix measures | Accuracy, precision, recall, specificity with formulas
- ROC curve and AUC | Axes, meaning of the area, 0.5 for a useless model

### Summary of Unit III
- Linear regression: Least squares, BLUE, multiple regression, model fit
- Building models: Dummies, V I F, selection, residual analysis
- Logistic regression: Odds, sigmoid, maximum likelihood, odds ratios
- Evaluation: Deviance, ROC and AUC, cut-off by cost

### References
- J. Han, M. Kamber, J. Pei, Data Mining: Concepts and Techniques, 3rd ed., Morgan Kaufmann
- Student's Handbook for Associate Analytics, named in the syllabus
- Regression and logistic regression: standard statistics textbooks
- Explanations, examples and numbers in this video are original
