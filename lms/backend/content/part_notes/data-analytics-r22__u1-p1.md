### Recap: databases
- Table: Rows are records, columns are attributes
- Keys: A primary key names a row; a foreign key links tables
- Query: SQL can select, join and group rows
- Transaction: All of the changes happen, or none do

### Recap: the statistics we need
- Mean 1,393 and median 1,092 rupees
- Standard deviation 1,079 rupees: the spread
- 468 of 11,913 payments failed: 3.9 percent

### Today in four steps
- Why architecture: One plan instead of many private copies
- Five layers: Sources, ingestion, storage, processing, serving
- Warehouse or lake: Where the data is kept
- Batch or stream: How fast it is processed

### One day of the retailer
- 11,913: Orders in one day, each with a payment record
- 332,627: Clicks on product pages
- 216,000: Delivery GPS pings from 150 couriers
- 572,453: Events in total, about 209 MB

### The five layers
- Sources: Where the data is born: shop database, website, payments, couriers
- Ingestion: Moves the data in, as batches or as a stream
- Storage: Keeps it: a lake, a warehouse, or both
- Processing: Cleans, joins and summarises
- Serving: Gives results to people and programs

### The retailer's architecture
- Four sources feed two ways of ingestion
- Raw copy to the lake, clean tables to the warehouse
- Batch and stream jobs feed three kinds of users

### Following one busy minute
- The busiest minute: 17:33
- 1,136 events in, 25 clean orders in the warehouse
- 24 paid orders: revenue 31,557 rupees

### Four ways to ingest data
- Batch file load: Copy a file of records on a schedule
- Change capture: Read each change from the database log
- Message queue: Producers write, consumers read at their own pace
- API or webhook: A service pushes an event when it happens

### A queue absorbs a sale-day spike
- Normal: 100 events a second, capacity 200
- Sale spike: 400 a second for 20 seconds
- Queue peaks at 4,000, drained by second 80

### Data warehouse versus data lake
- Cleaned, structured tables | Raw data of any form: files, logs, images
- Schema on write: checked before loading | Schema on read: structure applied when used
- Best for reports and trusted numbers | Best for exploration and machine learning
- Dearer storage, fast queries | Cheap storage, risk of a data swamp

### The same orders, two homes
- 11,913 order records arrive
- Warehouse: 11,545 clean rows, 368 rejected
- Lake: all 11,913 kept, bad ones too

### Extract, transform, load
- Extract: Read the data from the sources
- Transform: Clean and reshape it before loading
- Load: Write it into the warehouse

### Batch against stream, on a timeline
- 18 payment events in 30 minutes
- Batch runs at minutes 10, 20 and 30
- Average wait: batch 5.1 minutes, stream 1 second

### Batch versus stream
- Processes a large chunk at fixed times | Processes each event as it arrives
- Delay of minutes to hours | Delay of seconds or less
- Simple, cheap, easy to re-run | Harder: handle late and repeated events
- Daily sales report, monthly payroll | Fraud alert, live courier map

### Using both: the lambda design
- Batch layer: full history, accurate, run hourly
- Speed layer: only the last few minutes
- Serving adds both: 5,942,891 rupees at 14:07

### Choosing the design
- Monthly finance report | Warehouse, batch | Trusted, repeatable
- Fraud check on a payment | Stream | Answer in seconds
- Keep raw GPS for new models | Lake | Cheap, flexible
- Live courier map | Stream, serving | Always fresh

### Goals of a good design
- Scalability: Add machines when the volume grows
- Reliability: Survive a failed machine or a bad record
- Security: Only the right people see personal data
- Governance: Know what each data set means and who owns it
- Cost: Pay for what you use; move old data to cheap storage

### Exam tips and important questions
- Draw a data architecture | Five layers, one example in each, arrows
- Warehouse versus lake | Structure, schema time, users, cost
- Batch versus stream | Delay, complexity, one example each
- Why use a queue? | Absorbs spikes, separates producers and consumers

### Summary
- Five layers: Sources, ingestion, storage, processing, serving
- Warehouse and lake: Clean and trusted, or raw and flexible
- Batch and stream: Chunks at fixed times, or each event now
- Queue and goals: Absorb spikes; scale, protect, govern

### References
- J. Han, M. Kamber, J. Pei, Data Mining: Concepts and Techniques, 3rd ed., Morgan Kaufmann
- Student's Handbook for Associate Analytics, named in the syllabus
- Reference books: Tan, Steinbach and Kumar; Zaki and Meira; Leskovec, Rajaraman and Ullman
- Explanations, examples and numbers in this video are original
