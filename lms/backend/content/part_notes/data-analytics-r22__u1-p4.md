### Recap: Part Three
- Manage the data: Governance, metadata, lineage
- Six dimensions: Complete, valid, consistent, accurate, timely, unique
- Noise: Random error, reduced by smoothing
- Outliers: Detected by z-score or the IQR rule

### Today in four steps
- Why values go missing: Reasons, disguises and three mechanisms
- Delete or fill: What each choice costs
- Find duplicates: Exact copies and near copies
- Link the records: Block, compare, decide, merge

### Why do values go missing?
- Not applicable: A company name for a private customer
- Not collected: A form field that was skipped
- Lost on the way: A failed transfer or a bad merge
- Sensor failure: The device was off or out of range
- Refused: The person chose not to answer

### Missing values wear disguises
- Blank cell or NULL | Honest: most tools skip it
- Text such as NA or unknown | The whole column turns into text
- Zero in the age column | 90 of 1,000 ages are 0: mean 36.7, true 40.4
- Minus one or 999 | Looks like data, so it is averaged in

### A map of the gaps
- First 40 rows: 9 rows have a gap
- All 1,000 rows: 4.3 percent of cells missing
- Only 710 rows have all 8 columns filled

### Three mechanisms of missingness
- MCAR: Completely at random: no link to any value
- MAR: At random given other data: depends on age
- MNAR: Not at random: depends on the hidden value

### Same gaps, different damage
- Random gaps: mean 1,723 against the true 1,724
- Gaps depend on age: answers lean old, mean 1,799
- Gaps depend on spend: mean 1,622

### Delete or fill?
- Keeps only real values | Adds an estimate that may be wrong
- Loses information and sample size | Keeps every row and its other columns
- Safe when few rows are lost and gaps are MCAR | Better when many rows would be lost
- Biased if the gaps are MAR or MNAR | Also biased if the estimate ignores the reason

### The cost of deleting rows
- One column needed: 937 rows kept
- Four columns needed: 818 rows kept
- Eight columns needed: 710 kept, 29 percent lost

### Ways to fill a gap
- Constant or flag | Write unknown, or add a was-missing column | Keeps the fact of missingness
- Mean | Use the average of the known values | Pulled by outliers
- Median | Use the middle of the known values | Safer for skewed data
- Mode | Use the most common value | For categories
- Previous value | Copy the last reading in time order | Only for slow changes
- Model based | Predict it from the other columns | Unit Two, Part Five

### Worked example: filling two gaps
- Eight values, two missing | 12, 15, 14, gap, 18, gap, 13, 40
- Mean of the six known | 18.67
- Median of the six known | 14.5
- Spread of the six known | 10.65
- Filling with the mean: new spread | 9.00
- Filling with the median: new spread | 9.21

### Duplicates inflate every count
- 690: Customer records in the table
- 600: Real customers behind them
- 15 %: The customer count is too high
- 40: Exact copies; the other 50 differ slightly

### Finding exact duplicates
- Choose the key: Fields that identify a record: name, phone, PIN
- Group by the key: Sort or hash the records on that key
- Count the groups: A group of more than one is a duplicate: 40 extra rows
- Keep one: Delete or mark the others

### Near duplicates and edit distance
- Edit distance: inserts, deletes, replacements
- Sunita to Sunitha: distance 1
- Similarity 0.857 for a 7 letter name

### Blocking: do not compare everything
- All pairs of 690 records: 237,705
- Compare only within a PIN code: 19,973, 11.9 times fewer
- Cost: 5 real pairs with a wrong PIN are missed

### Record linkage in five steps
- Clean: Same case, trimmed spaces, standard spellings
- Block: Group likely matches, here by PIN code
- Compare: Score the similarity of name and phone
- Classify: Match, possible match, or non-match
- Merge: Keep one golden record

### Choosing the threshold
- Threshold 1.00: 40 flagged, recall 42.6 percent
- Threshold 0.85: 89 flagged, all real, recall 94.7
- Threshold 0.70: 96 flagged, 7 wrong, precision 92.7

### Same name is not same person
- Identical in every field | Exact copy: merge
- Name differs by one letter, same phone and PIN | Near copy: merge
- Similar name and phone, different PIN | Possible: a person reviews
- Same name only, phone and PIN differ | Different people: keep both

### Exam tips and important questions
- Missing values: causes and types | Reasons; MCAR, MAR, MNAR with one example each
- Delete versus fill | Cost of each; listwise deletion; mean, median, mode, flag
- Duplicate detection | Exact by key; near by edit distance; blocking
- Record linkage | Clean, block, compare, classify, merge; threshold

### Summary
- Missing values: Reasons, disguises, MCAR, MAR, MNAR
- Delete or fill: Deletion loses rows; filling shrinks spread
- Duplicates: Exact by key; near by edit distance
- Linkage: Clean, block, compare, classify, merge

### References
- J. Han, M. Kamber, J. Pei, Data Mining: Concepts and Techniques, 3rd ed., Morgan Kaufmann
- Student's Handbook for Associate Analytics, named in the syllabus
- Reference books: Tan, Steinbach and Kumar; Zaki and Meira; Leskovec, Rajaraman and Ullman
- Explanations, examples and numbers in this video are original
