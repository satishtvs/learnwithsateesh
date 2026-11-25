### Recap: Unit One
- Architecture: Five layers, from sources to serving
- Sources and types: Where data is born; nominal to ratio
- Quality and cleaning: Outliers, missing and duplicate values
- Pipelines: Clean, integrate, transform, reduce

### Today in four steps
- Four kinds: Descriptive to prescriptive
- Lifecycle: Six phases of an analytics project
- Three fields: Analytics, data mining, statistics
- Exam tips: Questions and the points to write

### Four kinds of analytics
- Descriptive and diagnostic look back
- Predictive looks forward
- Prescriptive recommends an action

### Three weeks of the retailer
- 21: Days of orders, counted hour by hour
- 373.4M: Total revenue in rupees
- 17.8M: Average daily revenue
- 14.2M: Lowest day: day 9

### Descriptive: what happened
- Total: 373.4 million in 21 days
- Average: 17.8 million a day
- Best day 20: 22.6 million

### Reading the weekly pattern
- Saturday is the best day: 21.7 million
- Tuesday is the weakest: 15.1 million
- Weekends sell more than weekdays

### Diagnostic: why did day 9 dip?
- Day 9 fell 13.3% from day 8
- Failures: 12.6% on day 9, about 4% usually
- Hours 14 to 17: 1,081 of 2,367 payments failed

### Four habits of diagnosis
- Drill down: Split a total by hour, product or region
- Compare: Against last week or another group
- Segment: Find which customers or channels changed
- Correlate: See what moved together

### Predictive: forecast the next day
- Forecast = same day last week
- Day 15: forecast 16.4, actual 16.6
- Day 16: forecast 14.2, actual 16.2

### Which forecast is better?
- All-days average: error 10.1%
- Yesterday's value: error 8.9%
- Same day last week: error 5.2%

### Prescriptive: choose a discount
- Assumed: 70% cost; each 1% discount adds 5% orders
- No discount: profit 5.58 million a day
- Best: 5% discount, 5.81 million, up 4.2%

### The analytics lifecycle
- Business understanding: What decision do we support?
- Data understanding: What data exists, and is it good?
- Data preparation: Clean, join and shape it
- Modeling: Build and tune the models
- Evaluation: Does it meet the goal?
- Deployment: Put it to work, then monitor

### The lifecycle on the retailer
- Business understanding | Reduce lost sales; aim: revenue loss under 2%
- Data understanding | Hourly orders and payment logs; 21 days
- Data preparation | Join payments to orders, drop bad records
- Modeling | Seasonal forecast; failure alert rule
- Evaluation | Error 5.2% on days 15 to 21
- Deployment | Daily forecast and an hourly dashboard

### Analytics, data mining and statistics
- Statistics: models, tests, uncertainty
- Data mining: patterns in big data
- Analytics: from question to decision

### Statistics versus data mining
- Starts from a question and a model | Starts from the data and searches
- Often works with samples | Often works with very large data
- Explains and tests with uncertainty | Finds patterns and predicts well
- Needs checking of assumptions | Judged by accuracy on new data

### Exam tips and important questions
- Four kinds of analytics | Name, question answered, one example each
- Analytics lifecycle | Six phases, one line each, the loop
- Analytics versus data mining | Goal, data size, method, output
- Why test a forecast? | Unseen days, error measure, baseline

### Summary
- Four kinds: Describe, diagnose, predict, prescribe
- Lifecycle: Six phases in a loop, from question to deployment
- Evaluation: Judge a model on unseen data with an error measure
- Three fields: Analytics uses statistics and data mining

### References
- J. Han, M. Kamber, J. Pei, Data Mining: Concepts and Techniques, 3rd ed., Morgan Kaufmann
- Student's Handbook for Associate Analytics, named in the syllabus
- Standard statistics textbooks for forecasting and error measures
- Explanations, examples and numbers in this video are original
