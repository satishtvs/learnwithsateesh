### Recap: databases and variables
- Relational: Tables, keys and joins
- NoSQL: Key-value, document, column, graph
- Variable types: Categorical and numeric
- Variable roles: Dependent, independent, confounding

### Today in four steps
- Three levels: Conceptual, logical, physical
- ER and tables: Entities, keys and normalization
- Star schema: Facts and dimensions
- Two kinds of model: Data model and statistical model

### Three levels of data model
- Conceptual: What things matter, and how they relate
- Logical: Tables, columns and keys, no vendor
- Physical: Data types, indexes, files and partitions

### The retailer as an ER diagram
- Entities are boxes: customer, order, product
- Lines show relationships and their counts
- PK names a row, FK points to another

### Reading the relationships
- Customer places order | One to many | Order holds customer id
- Order has payment | One to one (assumed) | Payment holds order id
- Order contains products | Many to many | Needs an order line table

### Why one big table causes trouble
- Customer 62 has 12 orders
- Flat table: 12 rows to change
- Normalized: 1 row to change

### Flat table against two tables
- Flat: 1,042 rows, 8 columns, 8,336 cells
- Split: 6,810 cells, 18% fewer
- 57 customers have no order yet

### Normal forms in plain words
- First normal form: Each cell holds one value, no repeating groups
- Second normal form: Every column depends on the whole key
- Third normal form: No column depends on a non-key column
- Our flat table: City depends on customer id, not order id

### The physical level: an index
- Question: find the 12 orders of customer 62
- Without an index: read all 1,042 rows
- With an index: about 23 steps

### Physical design choices
- Data types: The smallest type that fits the values
- Indexes: Fast search, extra space and slower writes
- Partitions: Split a big table by date or region
- Storage format: Rows for writing, columns for analysis

### The star schema
- Fact table: 3,000 sales lines
- Dimensions: date 21, customer 400, product 12
- Facts are added up, dimensions group them

### Slice and dice the star
- Total revenue: 9,055,290 rupees
- By category: Electronics is highest, 3,006 thousand
- Electronics on a weekend: 185 thousand a day

### A grid for decisions
- Every category earns more on weekend days
- Apparel: 70.2 against 122.0 thousand
- Home: 62.2 against 111.1 thousand

### Normalized design versus star schema
- Made for writing one order at a time | Made for reading and summarising
- Many small tables, little repetition | A few wide tables, some repetition
- Queries need many joins | Queries need few joins
- Keeps data correct | Keeps reports fast and simple

### A statistical model
- Revenue = 15.14 + 0.125 x day + 4.40 x weekend
- R squared 0.87; typical error 0.98 million
- Day 9 is 2.1 million below the model

### Data model versus statistical model
- What is it? | The structure that stores data | An equation for patterns and noise
- Our example | The star schema | Revenue against day and weekend
- Judged by | Correct, clear, fast to query | Fit, error and assumptions

### Exam tips and important questions
- Conceptual, logical, physical models | One line each, one example each
- Draw an ER diagram | Entities, attributes, keys, one to many lines
- What is normalization? | Remove repetition; three normal forms; example
- Star schema | Fact, dimensions, example query, versus snowflake

### Summary
- Three levels: Conceptual, logical, physical
- Normalization: Split tables so each fact is stored once
- Star schema: Facts to add up, dimensions to group by
- Two meanings: Data model stores; statistical model explains

### References
- J. Han, M. Kamber, J. Pei, Data Mining: Concepts and Techniques, 3rd ed., Morgan Kaufmann
- Student's Handbook for Associate Analytics, named in the syllabus
- Standard database and statistics textbooks for normal forms and fitting
- Explanations, examples and numbers in this video are original
