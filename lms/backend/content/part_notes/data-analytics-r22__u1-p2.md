### Recap: Part One
- Five layers: Sources, ingestion, storage, processing, serving
- Warehouse and lake: Clean tables, or raw data of any form
- Batch and stream: Chunks at fixed times, or each event now
- Queue: A buffer that absorbs a spike in traffic

### Today in four steps
- Where data is born: Sensors, GPS, logs, transactions, web, social
- Three shapes: Structured, semi-structured, unstructured
- Four scales: Nominal, ordinal, interval, ratio
- Which maths fits: The scale decides the summary to use

### Six families of sources
- Sensors: Physical measurements: temperature, weight, door open
- GPS signals: Position of a courier, every few seconds
- Logs: A machine's automatic diary of what happened
- Transactions: A business event: an order, a payment
- Web data: Clicks and page views of shoppers
- Social data: Reviews and posts written by people

### Sensors and sampling
- One reading an hour: 0 of 6 openings seen
- Every 10 minutes: 37 samples, 5 of 6 seen
- Every 5 minutes: all 6 seen, peak 8.38

### GPS: from pings to distance
- 24 pings in 11.5 minutes
- Distance from the pings: 4,087 metres
- Average speed 21.3 km/h; the real speed is 21.6

### Logs: a machine's diary
- Client address | 49.39.135.41
- Time | 12/Mar/2026:17:00:02 +0530
- Request | GET /search?q=shoes
- Status code | 200, which means success
- Bytes sent | 679

### Reading three thousand log lines
- 3,000 lines parsed with one pattern
- 2,688 successes and 147 not changed
- 90 not found, 75 server errors: 5.5 percent

### Transactions: the shop's records
- 100001 | 00:00 | 1,968.70 | cash on delivery | yes
- 100002 | 00:00 | 687.06 | card | yes
- 100003 | 00:01 | 347.37 | card | yes
- 100004 | 00:01 | 813.02 | U P I | yes

### Web data: the path to a purchase
- 106,918 sessions, 83,396 viewed a product
- 20,015 added to cart: 24 percent of viewers
- 11,913 paid: about 11 percent of sessions

### Social data: opinions in text
- Fast delivery, great fit, happy | 4 | 0 | positive
- Box damaged, support slow, not happy | 1 | 3 | negative
- Good quality, will buy again | 3 | 0 | positive
- Courier late, product poor | 0 | 2 | negative

### Three shapes of data
- Structured: Fixed columns: a table row, a spreadsheet
- Semi-structured: Each value has its own label: JSON, XML, logs
- Unstructured: No fixed layout: text, images, audio, video

### One order in three shapes
- Table row: 5 fixed columns
- JSON: 141 bytes, labels inside the record
- Free text: the facts are hidden in a sentence

### How much data is in each shape?
- Structured: 17 MB, 5 percent
- Semi-structured: 192 MB, 56 percent
- Unstructured: 136 MB, 39 percent

### Four scales of an attribute
- Nominal: Names only: payment method, city. Equal or not equal
- Ordinal: Names with an order: rating one to five
- Interval: Equal gaps, no true zero: temperature, clock time
- Ratio: Equal gaps and a true zero: amount, weight, minutes

### Interval is not ratio
- 20 and 40 degrees Celsius: ratio 2.00
- The same in Kelvin: 293.15 and 313.15, ratio 1.068
- A true zero is needed for ratios

### The scale decides the summary
- Nominal | Test equal | Mode: U P I, 6,140 orders
- Ordinal | And put in order | Median rating: 4
- Interval | And subtract | Mean and differences
- Ratio | And divide | Mean, ratios, percent

### Classify the columns
- Order number | Nominal | A label, no order
- Rating one to five | Ordinal | Ordered, gaps unequal
- Clock time of order | Interval | Zero is a convention
- Amount in rupees | Ratio | True zero, ratios fine
- Paid, yes or no | Nominal, binary | Only two names
- Delivery minutes | Ratio | Zero means no time

### Exam tips and important questions
- Sources of data | Sensors, GPS, logs, transactions, web, social, one example each
- Structured, semi, unstructured | Define, one example each, volume
- Attribute types | Four scales, example, allowed operations
- Interval versus ratio | True zero; temperature in Celsius and Kelvin

### Summary
- Six sources: Sensors, GPS, logs, transactions, web, social
- Three shapes: Structured, semi-structured, unstructured
- Four scales: Nominal, ordinal, interval, ratio
- Scale picks the maths: Mode, median, mean, ratios

### References
- J. Han, M. Kamber, J. Pei, Data Mining: Concepts and Techniques, 3rd ed., Morgan Kaufmann
- Student's Handbook for Associate Analytics, named in the syllabus
- Reference books: Tan, Steinbach and Kumar; Zaki and Meira; Leskovec, Rajaraman and Ullman
- Explanations, examples and numbers in this video are original
