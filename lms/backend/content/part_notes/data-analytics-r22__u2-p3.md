### Recap: the analyst's tools
- Spreadsheet: Small tables, quick checks
- SQL: Precise questions of large tables
- Python and R: Any analysis, in a notebook
- BI dashboard: Live views for managers

### Today in four steps
- Relational: Tables, keys and SQL
- NoSQL: When tables are the wrong shape
- Variable types: Categorical and numeric
- Variable roles: Dependent, independent, confounding

### Two tables linked by a key
- Customers: one row per customer
- Orders: one row per order
- The key customer_id links the two

### The size of our database
- 400: Customers, four columns each
- 1,042: Orders, five columns each
- 343: Customers who ordered at least once
- 5: Cities, three segments

### GROUP BY: counting orders per city
- Hyderabad is first: 311 orders
- Mumbai is last: 148 orders
- The counts add up to 1,042

### JOIN: matching orders to customers
- Each order finds its customer by the key
- Six orders from six different customers
- Totals by segment: 1,271, 2,126 and 2,851

### Three queries and their answers
- Orders per city: Hyderabad 311, the most
- Spend: premium 855,997, regular 507,508, new 200,471
- Average order: app 1,700, web 1,230 rupees

### Relational versus NoSQL
- Fixed tables and columns | Flexible documents, keys or graphs
- Rules checked on write; joins link tables | Often stores related data together
- Strong guarantees: transactions | Built to spread over many machines
- Orders, payments, accounting | Catalogues, sessions, social links

### One order: a document or linked tables
- Document: the whole order in one record
- Tables: three tables joined to rebuild it
- Item names are invented for the example

### Four kinds of NoSQL store
- Key-value: A key gives one value, very fast
- Document: Nested records such as JSON
- Column family: Wide rows, built for huge volumes
- Graph: Nodes and links, like friends

### Types of variable
- Categorical: labels, no arithmetic
- Ordinal: categories with an order
- Numeric: discrete counts, continuous measures

### The right summary for each type
- City | Nominal | Mode | Hyderabad, 31%
- Segment | Ordinal | Median | regular
- Items in an order | Discrete | Mean | 3.5
- Order amount | Continuous | Mean, median | 1,501 and 1,218

### Three roles in one question
- Dependent: The outcome we study: order amount
- Independent: The factor we change or compare: channel
- Confounding: A third variable behind both: segment

### The app looks better, but why?
- All customers: app 1,700, web 1,230
- Inside each segment the gap is small
- Gaps: new minus 20, regular minus 127, premium plus 153

### Why the gap appeared
- Premium: 53% of app orders, 15% of web orders
- New: 13% of app orders, 40% of web orders
- Premium customers spend more on every channel

### Exam tips and important questions
- Relational versus NoSQL | Structure, joins, scale, one use each
- Types of variables | Nominal, ordinal, discrete, continuous, examples
- Dependent, independent, confounding | Define each; give one example
- What is a confounder? | Linked to both; it misleads comparisons

### Summary
- Relational: Tables, keys and joins; queried with SQL
- NoSQL: Key-value, document, column family, graph
- Variable types: Categorical or numeric, each with two kinds
- Roles: Dependent, independent, confounding

### References
- J. Han, M. Kamber, J. Pei, Data Mining: Concepts and Techniques, 3rd ed., Morgan Kaufmann
- Student's Handbook for Associate Analytics, named in the syllabus
- Standard statistics textbooks for variables and confounding
- Explanations, examples and numbers in this video are original
