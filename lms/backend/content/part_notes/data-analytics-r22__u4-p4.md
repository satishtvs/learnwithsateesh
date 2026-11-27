### Recap and today's goal
- Trees and forests: Part Three ended with pruning and forests
- Rows were independent: We could shuffle the rows without harm
- A time series: Values in time order; the order carries information
- Today: Components, stationarity, ACF and PACF, STL

### Today in four steps
- Components: Trend, seasonality, cycle and noise
- Decomposition: Splitting a series, classical and S T L
- Stationarity: A series whose behaviour does not drift
- Memory: ACF and PACF show how the past matters

### Our data: 48 months of sales
- Monthly sales of the retailer, four years
- Rising trend: 90 to 189 thousand rupees
- A peak every November

### The four components of a series
- Trend: The long-run direction, up or down
- Seasonality: A pattern that repeats at a fixed period
- Cycle: Longer waves of no fixed length
- Noise: Random variation that cannot be predicted

### Additive or multiplicative?
- Additive: the swing stays 55.0 then 54.1
- Multiplicative: the swing grows 62.0 then 87.8
- Swing grows with the level: multiplicative or logs

### Finding the trend: a moving average
- Average twelve months around each month
- Month 7: average 110.43
- Month 37: average 163.78

### Worked example: trend and detrended values
- July | 104.29 | 110.43 | -6.13
- August | 118.21 | 112.04 | 6.17
- September | 116.68 | 113.67 | 3.01
- October | 127.97 | 115.78 | 12.19
- November | 142.21 | 117.69 | 24.51
- December | 125.48 | 119.44 | 6.04

### Classical decomposition
- Seasonal index: November 24.08, February -14.55
- Trend: smooth, but missing at the ends
- Remainder: small, between about -5 and 5

### S T L: seasonal and trend decomposition using loess
- Remove the trend: Subtract the current trend estimate
- Smooth each month: Smooth all the Januaries, all the Februaries, and so on
- Strip the slow part: Filter out what is left of the trend; the rest is seasonal
- Re-estimate the trend: Smooth the result for a better trend

### S T L against the classical method
- Seasonal error against the truth: classical 1.77, STL 1.75
- Trend error: classical 1.97, STL 1.67
- S T L gives a trend for every month

### What is a stationary series?
- Constant mean: The average level does not drift
- Constant variance: The spread does not grow or shrink
- Stable memory: Correlation depends only on the lag, not on the date

### Making a series stationary: differencing
- Original: halves average 119.13 and 162.80
- First difference: 2.46 and 1.77
- First and seasonal difference: 0.11 and 0.08

### Autocorrelation: the series remembers
- Lag 1: autocorrelation 0.875
- Lag 6: 0.491
- Lag 12: 0.394, a seasonal echo

### ACF and PACF
- ACF falls slowly: 0.88, 0.71, 0.60
- PACF: lag 1 0.88, lag 2 -0.23
- Band: plus or minus 0.283

### Reading ACF and PACF patterns
- Trend | Starts high, falls slowly | Large at lag 1, then small
- Seasonality, period 12 | A bump at lag 12, 24, and so on | Spike near the seasonal lag
- White noise | All bars inside the band | All bars inside the band
- AR(1) with coefficient 0.7 | Decays: 0.70, 0.49, 0.343 | One spike at lag 1, then zero

### Exam tips and important questions
- Components of a time series | Trend, seasonality, cycle, noise; additive versus multiplicative
- Stationarity; how to achieve it | Constant mean and variance; differencing, seasonal differencing, logs
- ACF and PACF | Define; band plus or minus 1.96 over root n; patterns for trend and seasonality
- Decomposition | Moving average trend, seasonal indices, remainder; S T L uses loess

### Summary
- Components: Trend, seasonality, cycle, noise
- Decomposition: Seasonal index for November: 24.08
- Stationarity: Differencing brings half means to 0.11 and 0.08
- Memory: ACF at lag 1 is 0.875; the band is 0.283

### References
- J. Han, M. Kamber, J. Pei, Data Mining: Concepts and Techniques, 3rd ed., Morgan Kaufmann
- Student's Handbook for Associate Analytics, named in the syllabus
- Time series: standard statistics textbooks
- Explanations, examples and numbers in this video are original
