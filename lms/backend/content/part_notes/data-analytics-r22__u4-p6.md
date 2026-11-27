### Recap and today's goal
- ARIMA: Difference, then AR and MA terms
- Identification: ACF and PACF suggest p and q
- A forecast: A value and an interval
- Today: Is it good? And what can we extract?

### Today in four steps
- Fair testing: Hold out the future, never a random sample
- Error measures: M A E, R M S E and M A P E
- Series features: Height, energy, slope and more
- Prediction: Use the features in a model

### Test on the future, not on a random sample
- Training: months 1 to 36; test: months 37 to 48
- Four methods forecast the hidden 12 months
- Random splits would let the model peek at the future

### The three error measures
- MAE: mean absolute error | Average of the sizes of the errors | Same units as the data
- RMSE: root mean square error | Square the errors, average, take the root | Punishes big errors more
- MAPE: mean absolute percent error | Average of error divided by actual, times 100 | No units; fails if an actual is zero

### Worked example: six test months
- January | 154.92 | 160.09 | -5.17 | 3.34
- February | 154.39 | 154.45 | -0.06 | 0.04
- March | 158.32 | 161.58 | -3.26 | 2.06
- April | 168.00 | 172.16 | -4.16 | 2.47
- May | 173.69 | 175.48 | -1.78 | 1.03
- June | 169.31 | 171.96 | -2.65 | 1.57

### All twelve test months
- MAE 3.78 thousand rupees
- RMSE 4.33, a little larger
- MAPE 2.16 percent

### Which method wins?
- Naive: MAE 14.76, MAPE 8.0
- Same month last year: MAE 23.78
- Trend and seasonal: MAE 3.78

### Rolling-origin evaluation
- Refit each month, forecast the next month only
- After 12 forecasts: trend and seasonal MAE 4.21
- Naive MAE 10.15

### One large error: who notices?
- No extra error: MAE 3.78, RMSE 4.33
- Extra error of 60 in one month: MAE 7.94
- RMSE jumps to 16.37; MAPE 3.95 percent

### Common mistakes in evaluation
- Random split: Testing on the past after training on the future
- No baseline: A score means little without the naive forecast
- MAPE with zeros: Division by zero or tiny actuals
- One horizon only: Errors grow with the forecast horizon

### Features of a series
- Height: The peak: the maximum value
- Average energy: The average of the squared values
- Level and spread: Mean and standard deviation
- Trend slope: The slope of the fitted line
- Seasonality strength: Autocorrelation at the seasonal lag
- Model coefficients: AR coefficients, error variance

### Worked example: features of one series
- Mean (level) | Total divided by n | 50.75
- Height (peak) | The maximum value | 61
- Average energy | Average of the squared values | 2621.50
- Spread | Standard deviation | 7.25
- Trend slope | Slope of the least squares line | 2.76

### Features of a sliding window
- Window of 12 months: mean 46.62, height 68.61
- Slide the window one step at a time
- Window at month 25: height 61.39, energy 2134

### Using features to classify products
- 90 simulated products, 3 types, 36 months each
- The split: 60 products train, 30 test
- Trend slope and seasonal autocorrelation separate the types

### A tree on the features
- Tree test accuracy 0.967: 29 of 30 correct
- Using only the level (mean): 0.300
- Importance in a forest: lag 12, slope, spread

### Features from a fitted model
- Trend slope: 2.00 thousand rupees per month in our sales
- Seasonal index: November is +23.52 above the trend
- AR coefficient: 0.688 for the daily orders of Part Five
- Error variance: 3.41: the noise left by the model

### Exam tips and important questions
- Define MAE, RMSE and MAPE | Formulas in words; units; RMSE punishes big errors; MAPE fails at zero
- How to evaluate a forecast | Hold out the latest data; compare with the naive forecast; rolling origin
- What are series features? | Height, average energy, mean, spread, slope, seasonality strength
- Use of features for prediction | Compute features per series, then classify or regress with a tree

### Unit IV summary: six parts
- 1 Segmentation: K-means: three groups, S S E 121.75
- 2 Decision trees: Tenure first, information gain 0.396
- 3 Pruning and forests: Pruned tree 0.824 against 0.777 for the full tree
- 4 Time series basics: Components, decomposition, stationarity, ACF and PACF
- 5 ARIMA: ARIMA(1, 1, 0): 287.0 ten days ahead
- 6 Accuracy and features: MAE 3.78; feature tree accuracy 0.967

### References
- J. Han, M. Kamber, J. Pei, Data Mining: Concepts and Techniques, 3rd ed., Morgan Kaufmann
- Student's Handbook for Associate Analytics, named in the syllabus
- Time series: standard statistics textbooks
- Explanations, examples and numbers in this video are original
