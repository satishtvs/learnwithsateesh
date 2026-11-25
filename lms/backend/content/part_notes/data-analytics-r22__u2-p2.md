### Recap: four kinds of analytics
- Descriptive: What happened: totals and charts
- Diagnostic: Why: drill down to the cause
- Predictive: What next: forecast and test it
- Prescriptive: What to do: pick the best action

### Today in four steps
- Five tools: What each is good at
- Same answer: One question in four tools
- Notebook: A workflow you can repeat
- Choosing: Match the tool to the job

### Where each tool is strongest
- Spreadsheet: small data, quick answers
- SQL: large tables, precise questions
- Python and R: any analysis you can code
- BI dashboard: sharing with many people

### Five tools at a glance
- Spreadsheet | Small tables, quick checks | Row limit, hidden manual edits
- SQL | Filtering, joining, grouping | Not made for modeling
- R | Statistics and graphics | Smaller industry use
- Python | Data work and machine learning | More code to learn
- BI dashboard | Live views for managers | Fixed questions only

### Our data in rows
- 504: Hourly summary rows for 21 days
- 277,713: Order rows in the same days
- 7.8M: Click rows, assuming 28 clicks an order
- 1,048,576: Rows in one worksheet

### Clicks outgrow the spreadsheet
- Day 3: 952,422 rows, still fits
- Day 4: 1,276,865 rows, over the limit
- 21 days: 7,778,614, over seven times the limit

### The spreadsheet's strength: the pivot
- Rows are weeks, columns are weekdays
- Week 3 Saturday is the maximum: 22.6 million
- Week totals: 119.7, 123.5, 130.2 million

### SQL groups the rows
- Weekday: 15 days, 183,203 orders, 16.4 million a day
- Weekend: 6 days, 94,510 orders, 21.2 million a day
- One query, the same on a million rows

### One question, four tools
- Question: average revenue of weekend days
- Four tools, four different ways to write it
- The answer is 21,237,057 rupees in all four

### R versus Python
- Designed for statistics and graphics | A general-purpose programming language
- Many statistical methods ready to use | Strong libraries for data and machine learning
- Common in research and teaching | Common in industry and production systems
- Free, open source, runs in notebooks | Free, open source, runs in notebooks

### A notebook workflow
- Load: Read the data in
- Clean: Fix or flag bad rows
- Explore: Summarise and plot
- Model: Fit and test
- Share: A report or a dashboard

### Running the notebook
- Load: 504 rows, 6 columns
- Clean: 4 rows with failures above 20%
- Explore: busiest hour 20, 1,051 orders

### The notebook's chart
- Quietest: hour 0, 206 orders
- Evening rise from hour 16
- Peak at hour 20: 1,051 orders

### A dashboard for managers
- Tiles: 373.4 million, 277,713 orders, 4.3% failed
- Revenue by day, with day 9 marked
- Orders by hour: the busy evening

### From data to decision: the tool chain
- Storage: A database or a warehouse
- Preparation: SQL or Python cleans and joins
- Analysis: Python or R fits the models
- Presentation: A BI dashboard for the users

### Choosing the tool
- Check 300 rows before a meeting | Spreadsheet
- Ask questions of a 50 million row table | SQL
- Fit and test a forecast, repeatable | Python or R in a notebook
- Managers need the numbers every morning | BI dashboard

### Exam tips and important questions
- Tools used in analytics | Five tools, one use and one limit each
- R versus Python | Purpose, libraries, users, cost
- Why use a notebook? | Code, results and notes; repeatable
- Spreadsheet or database? | Row limit, repeatability, sharing

### Summary
- Five tools: Spreadsheet, SQL, R, Python, BI
- Same answer: The tool changes the writing, not the maths
- Notebook: Load, clean, explore, model, share
- Choosing: Data size, repeat, audience

### References
- J. Han, M. Kamber, J. Pei, Data Mining: Concepts and Techniques, 3rd ed., Morgan Kaufmann
- Student's Handbook for Associate Analytics, named in the syllabus
- Reference books: Tan, Steinbach and Kumar; Zaki and Meira
- Explanations, examples and numbers in this video are original
