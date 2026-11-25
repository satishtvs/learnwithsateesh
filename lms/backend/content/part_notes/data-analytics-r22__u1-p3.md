### Recap: Part Two
- Six sources: Sensors, GPS, logs, transactions, web, social
- Three shapes: Structured, semi-structured, unstructured
- Four scales: Nominal, ordinal, interval, ratio
- Scale picks the maths: Mode, median, mean, ratios

### Today in four steps
- Govern: Who owns the data and who may use it
- Describe and trace: Metadata and lineage
- Measure quality: Six dimensions and a scorecard
- Noise and outliers: Smooth the noise, detect the outliers

### What is data management?
- Governance: Rules: who may do what with which data
- Metadata: Data about data: meaning, type, owner
- Lineage: The journey of a number, source to report
- Quality: Is the data fit for the job?

### Governance: who does what
- Data owner: Accountable for a data set; approves who may use it
- Data steward: Defines the meaning and the quality rules
- Data custodian: Runs storage: backups, access, security
- Data consumer: Analyst or program that uses the data within the rules

### Why governance matters: three revenues
- 16.59 M: Team A adds every order record, rupees
- 16.05 M: Team B adds only clean orders
- 15.43 M: Team C adds clean orders that were paid
- 7.5 %: Gap between the highest and the lowest figure

### Three kinds of metadata
- Technical: Type, size, table, format, rules
- Business: Meaning, unit, owner, allowed use
- Operational: When refreshed, how many rows, how good

### A catalogue entry
- Technical: decimal type, table clean_orders
- Business: order value in rupees, owned by finance
- Operational: refreshed nightly, 11,545 rows

### Lineage: the journey of a number
- Shop database: The source record of every order
- Raw copy: Stored unchanged in the lake
- Clean orders: Malformed records are rejected
- Paid orders: Failed payments are left out
- Dashboard: Revenue is shown to managers

### Tracing the dashboard number back
- Dashboard: 15.43 million rupees from 11,094 orders
- One step back: 451 failed payments left out
- Back to the lake: 368 rejected, 11,913 raw rows

### Six dimensions of data quality
- Completeness | Is anything missing? | Price absent in some orders
- Validity | Does it follow the rules? | PIN code not six digits
- Consistency | Is it the same everywhere? | One city spelled three ways
- Accuracy | Is it true? | Order and payment amounts differ
- Timeliness | Is it fresh enough? | Records arriving late
- Uniqueness | Recorded only once? | The same order saved twice

### A quality scorecard
- Completeness 96.9 percent: 368 prices missing
- Weakest: consistency 94.2 and timeliness 94.6
- Strongest: accuracy 99.2 and uniqueness 99.4

### Noise: random error
- Raw readings: error 0.49 degrees
- Average of 5 readings: error 0.19
- Window 15: error 0.08; window 31: back up to 0.11

### Noise or outlier?
- A small random error on every reading | One value far from all the others
- Caused by sensor limits, rounding, interference | A fault, a typing slip, or a rare real event
- Reduced by averaging or smoothing | Investigate first, then keep, fix or remove
- A temperature that wobbles by half a degree | A 95 minute delivery among 30 minute ones

### The z-score rule
- Mean: Add the 15 delivery times and divide: 36.5 minutes
- Spread: Standard deviation of the sample: 16.6 minutes
- z-score: How many spreads a value is from the mean
- Flag: Mark values with z above 3 or below minus 3

### Detecting the 95 minute delivery
- Mean 36.5 and spread 16.6, both pulled up by one value
- 95 minutes: z-score 3.51, above 3, flagged
- IQR fences 20.5 and 44.5: only 95 is flagged

### The interquartile range rule
- Q1, the 25th percentile | 29.5 minutes
- Q3, the 75th percentile | 35.5 minutes
- IQR = Q3 minus Q1 | 6.0 minutes
- Lower fence = Q1 minus 1.5 IQR | 20.5 minutes
- Upper fence = Q3 plus 1.5 IQR | 44.5 minutes
- Values outside the fences | 95 only

### A flagged value is not always an error
- Fence at 3,373 rupees: 624 orders above it
- Largest order: 13,442 rupees
- Real big orders: check before you remove

### What to do with an outlier
- Detect: Flag it with the z-score or the IQR rule
- Investigate: Ask the source: an error or a real event?
- Decide: Fix it, keep it, cap it or remove it
- Document: Record what was done and why

### Exam tips and important questions
- Governance, metadata, lineage | Define each, roles, three metadata kinds, one example
- Dimensions of data quality | Six dimensions with a one line example each
- Noise versus outlier | Random error versus far value; smooth or investigate
- Detect outliers | z-score above 3; IQR fences 1.5 times IQR; worked example

### Summary
- Manage: Governance roles, metadata, lineage
- Six dimensions: Complete, valid, consistent, accurate, timely, unique
- Noise: Random error: reduce it by smoothing
- Outliers: z-score or IQR to detect; investigate before removing

### References
- J. Han, M. Kamber, J. Pei, Data Mining: Concepts and Techniques, 3rd ed., Morgan Kaufmann
- Student's Handbook for Associate Analytics, named in the syllabus
- Reference books: Tan, Steinbach and Kumar; Zaki and Meira; Leskovec, Rajaraman and Ullman
- Explanations, examples and numbers in this video are original
