### Recap and today's goal
- Stationarity: Constant mean and variance; differencing achieves it
- ACF: Correlation of a series with its own past
- PACF: The same, after removing the in-between lags
- Today: Turn these plots into a forecasting model

### Today in four steps
- The letters: A R, I and M A, and their orders
- Reading plots: Choose p, d and q from ACF and PACF
- Fitting: Estimate, compare by A I C, check residuals
- Forecasting: Predictions with an interval

### The three letters of ARIMA
- AR: autoregressive: Today depends on the last p values
- I: integrated: Difference the series d times first
- MA: moving average: Today depends on the last q errors

### The models in words
- AR(p) | Value = constant + weights times the last p values + error | How many past values
- MA(q) | Value = mean + error + weights times the last q errors | How many past errors
- I(d) | Replace the series by its d-th difference | How many differences
- ARIMA(p, d, q) | Difference d times, then fit AR(p) and MA(q) together | All three orders

### An AR(1) series for six coefficients
- Coefficient minus 0.8: lag 1 correlation -0.83
- Coefficient 0.5: lag 1 correlation 0.52
- Coefficient 0.99: lag 1 correlation 0.95

### Signatures of AR and MA
- AR(1): ACF decays, PACF stops after lag 1
- MA(1): ACF stops after lag 1, at 0.47 in theory
- Bars wiggle around the dots: ignore small ones

### Choosing p and q from the plots
- AR(p) | Tails off gradually | Cuts off after lag p
- MA(q) | Cuts off after lag q | Tails off gradually
- ARMA(p, q) | Tails off | Tails off

### Our data: 120 days of orders
- Daily orders in hundreds: 101 to 275
- The level drifts upward, so it is not stationary
- The daily change averages 1.46

### Checking that d equals one is enough
- 0.973: lag 1 ACF of the series
- 0.690: lag 1 ACF after one difference
- -0.112: lag 1 ACF after two differences

### Reading the plots of the differences
- ACF decays: 0.69, 0.45, 0.25
- PACF: lag 1 is 0.69, lag 2 is -0.05
- Suggests AR(1) after one difference: ARIMA(1, 1, 0)

### Fitting AR(1) on the differences
- Mean of the daily changes | 1.46
- AR coefficient phi | 0.688
- Constant c | 0.424
- Error variance | 3.411
- Long-run daily change | 1.36

### Trying six candidate models
- ARIMA(0,1,0): AIC 223.4
- ARIMA(1,1,0): AIC 149.5
- The others: 151.3 or more

### Residual check
- Residual ACF: lag 1 is 0.03, inside the band
- A formal test: p-value 0.76
- Histogram centred on zero, bell-shaped

### The Box-Jenkins loop
- Identify: Difference, then read ACF and PACF
- Estimate: Fit the candidate models
- Check: Residuals must look like white noise
- Forecast: Use the model that passes

### The forecast fan grows
- 1 day ahead: 276.0, interval width 7.2
- 5 days ahead: 280.5, width 34.0
- 10 days ahead: 287.0, width 59.6

### The final forecast
- Model: ARIMA(1, 1, 0) with a constant
- Forecast for day 130: 287.0
- 95 percent interval: 257.3 to 316.8

### Exam tips and important questions
- What are AR, MA and ARIMA? | Past values, past errors, differencing; order p, q and d
- Choosing p, d and q | Difference until stationary; PACF cuts at p for AR, ACF cuts at q for MA
- Steps of Box and Jenkins | Identify, estimate, check residuals, forecast
- Numerical on AR(1) | Estimate by regression; forecast change = c + phi times last change

### Summary
- ARIMA(p, d, q): Difference d times, then AR(p) and MA(q)
- Identification: PACF cut after lag 1 with ACF decay: ARIMA(1, 1, 0)
- Fit and check: Coefficient phi 0.688, AIC 149.5, residuals clean
- Forecast: 10 days ahead: 287.0, interval 257.3 to 316.8

### References
- J. Han, M. Kamber, J. Pei, Data Mining: Concepts and Techniques, 3rd ed., Morgan Kaufmann
- Student's Handbook for Associate Analytics, named in the syllabus
- Time series: standard statistics textbooks
- Explanations, examples and numbers in this video are original
