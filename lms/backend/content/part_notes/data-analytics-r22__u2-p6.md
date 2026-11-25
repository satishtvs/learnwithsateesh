### Recap: filling the gaps
- Five methods: Mean, median, mode, regression, kNN
- Best fill: Use other columns when they explain the gap
- Side effect: Fills shrink the variance
- Good practice: Fit on training rows, add a flag

### Today in four steps
- Why model: From a question to a decision
- Framing: Business question to model type
- Four cases: Churn, demand, credit, basket
- Unit summary: All six parts in one view

### Why business modeling is needed
- Focus: A question that a decision depends on
- Evidence: Data in place of opinion
- Measure: A number that says if we are winning
- Action: A step that someone can take

### From a business question to a model
- Who is about to leave us? | Classification | Churn: yes or no
- How many units next week? | Forecasting | Units a day
- Will this applicant repay? | Classification | Default: yes or no
- What is bought together? | Association rules | Item sets and rules

### Case one: churn leaves a trail
- Under 1 month since the last order: 8.8% churn
- 6 months or more: 45.9% churn
- All 2,000 customers: 17.2% churn

### Ranking customers by risk
- Calling at random reaches churners in proportion
- Top 10%, 60 customers: 38 of 101 churners
- Top 30%, 180 customers: 68 churners, 67%

### Is the campaign worth it?
- Assumed: a call costs 100; keeps 20% of churners, worth 2,000 each
- Best: call the top 77; profit 10,700
- Calling all 600 loses 19,600

### Case two: demand and stock
- Forecast = last week's same day times 1.054
- Typical error 6.0%; day 22: 386 plus or minus 33
- Short costs 300 a unit, extra costs 100 (assumed)

### How much to stock?
- Stock = forecast, 386 units: cost 5,243 a day
- Stock 408 units: cost 4,176, 20% lower
- Rule: stock at the 75% point of demand

### Case three: credit risk
- Approve all 1,000: profit minus 6,000
- Limit 0.15: approve 437, 42 defaults, profit 136,200
- Limit 0.50: approve 986, profit only 9,600

### Case four: the market basket
- 3,000 simulated baskets, 8 products
- Phone and case: lift 4.2
- Lamp and bedsheet 3.1; shirt and jeans 2.5

### Support, confidence and lift
- Support | Share of baskets with both | 176 of 3,000: 5.9%
- Confidence | Of phone baskets, share with a case | 176 of 363: 48.5%
- Lift | Confidence divided by case share | 0.485 over 0.115: 4.2
- Unrelated pair | Phone and shirt | Lift 1.0

### Model score or business value?
- Accuracy, error, lift | Profit, cost saved, customers kept
- Judges the model | Judges the decision
- Same for every user | Depends on our costs
- Needed to compare models | Needed to decide what to do

### The churn case end to end
- Ask, data, model, test, decide
- Test: top 10% hold 37.6% of churners
- Decision: call 77, profit 10,700

### Unit Two in one view
- Introduction: Four kinds of analytics, the lifecycle
- Tools: Spreadsheet, SQL, R, Python, BI
- Databases and variables: Relational, NoSQL; types and roles
- Data modeling: ER diagram, normalization, star schema
- Missing values: Mean, median, regression, kNN, variance
- Business modeling: Churn, demand, credit, basket

### Exam tips and important questions
- Need for business modeling | Focus, evidence, measure, action; example
- Applications of modeling | Churn, demand, credit, basket; model type each
- Support, confidence, lift | Definitions, formula in words, worked example
- Frame a business question | Question, data, model, metric, action

### Summary
- Why model: A question that leads to an action
- Four cases: Churn, demand, credit and basket
- Costs decide: The best decision depends on costs
- Unit Two: From tools to business models

### References
- J. Han, M. Kamber, J. Pei, Data Mining: Concepts and Techniques, 3rd ed., Morgan Kaufmann
- Student's Handbook for Associate Analytics, named in the syllabus
- Standard statistics textbooks for classification and forecasting
- Explanations, examples and numbers in this video are original
