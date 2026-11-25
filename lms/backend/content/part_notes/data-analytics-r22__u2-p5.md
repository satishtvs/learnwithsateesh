### Recap: why values go missing
- MCAR: Missing completely at random, a pure accident
- MAR: Depends on other columns we can see
- MNAR: Depends on the value itself
- Delete or fill: Deleting loses rows; filling adds guesses

### Today in four steps
- Worked table: Ten rows, three gaps
- Five methods: Mean, median, mode, regression, kNN
- Side effects: Variance, bias and flags
- Exam tips: What to write

### Ten customers, three gaps
- Monthly spend is missing for C3, C6, C9
- Age and orders are known for every row
- Hidden true values: 3,178, 1,952, 1,713

### Five ways to fill a gap
- Mean | Average of the known values | Numeric, fairly symmetric
- Median | Middle of the known values | Numeric, with outliers or skew
- Mode | Most common known value | Categories such as city
- Regression | A prediction from other columns | Columns that explain it
- kNN | Average of the nearest rows | Similar rows exist

### The four fills for our three gaps
- Mean 1,618 and median 1,405 are one value for all
- Regression: 2,130, 1,822, 1,569
- kNN: 1,949, 1,561, 1,561

### A bigger test
- 400: Customers with age, orders and spend
- 80: Spends hidden at random, 20 percent
- 1,916: True mean spend, in rupees
- 1,909: Mean of the known 320 values

### Watching the four methods
- Mean and median give a flat line of fills
- Regression follows the trend with age
- kNN follows the local neighbourhood

### Error of each method
- Mean 571 and median 570: no use of other columns
- kNN 463: uses similar rows
- Regression 388: uses the relation

### How nearest neighbours fill one gap
- Customer 16: age 30, 6 orders a year
- Neighbours spent 1,920, 2,059 and 2,367
- Fill 2,115; the true value was 2,469

### Which fill for which column?
- Mean: Symmetric numbers, few gaps
- Median: Skewed numbers or outliers
- Mode: Categories: city, segment
- Model-based: Regression or kNN when other columns help

### Filling shrinks the spread
- 0% missing: standard deviation 548
- 20% missing, mean fill: 485
- 50% missing, mean fill: 375

### Spread after each method
- True spread: 548; mean and median fills: 485
- Regression 512 and kNN 530 keep more spread
- Regression plus random noise: 534

### A missing value can be a signal
- 91 customers have no address on file
- Churn: 31.9% with a gap, 10.0% without
- Add a flag column: address_missing

### Fill without cheating
- Split first: Keep a test set apart
- Learn the fill: Compute means and models on training rows
- Apply to both: Use the same fill values on test data
- Add the flag: Mark which cells were filled

### Pitfalls of imputation
- Less variance: Fills make data look more alike
- Hidden MNAR: Fills cannot repair self-hiding values
- Leakage: Learning the fill from the test set
- False confidence: Treating guesses as real data

### Exam tips and important questions
- Methods of imputation | Mean, median, mode, regression, kNN; one use each
- Effect on variance | Mean fill shrinks the spread; example
- Why add an indicator flag? | The gap itself can carry information
- Worked kNN fill | Scale, distances, k nearest, average

### Summary
- Five methods: Mean, median, mode, regression, kNN
- Best fill: Use other columns when they explain the gap
- Side effect: Fills shrink the variance
- Good practice: Fit on training rows, add a flag

### References
- J. Han, M. Kamber, J. Pei, Data Mining: Concepts and Techniques, 3rd ed., Morgan Kaufmann
- Student's Handbook for Associate Analytics, named in the syllabus
- Standard statistics textbooks for imputation and multiple imputation
- Explanations, examples and numbers in this video are original
