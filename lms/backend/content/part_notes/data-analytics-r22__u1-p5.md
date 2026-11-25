### Recap: Part Four
- Missing values: Reasons, disguises, MCAR, MAR, MNAR
- Delete or fill: Deletion loses rows; filling shrinks spread
- Duplicates: Exact by key; near by edit distance
- Linkage: Clean, block, compare, classify, merge

### Today in four steps
- The pipeline: Steps from raw data to analysis-ready data
- Clean and integrate: Repair each source, then join them
- Transform: Change the form: normalization, bins
- Reduce: Fewer rows, values and columns

### A processing pipeline
- Collect: Keep an unchanged raw copy
- Clean: Fix missing, noisy, duplicate data
- Integrate: Join the sources into one table
- Transform: Scale, bin and derive columns
- Reduce: Keep what the analysis needs

### A table travels through the pipeline
- Raw: 11,913 rows, 6 columns, 71,478 cells
- After transform: 138,540 cells, the largest
- After reduce: 1,155 rows, 5 columns, 5,775 cells

### Cleaning brings everything together
- Missing values: Delete or fill, knowing why they are gone
- Noise: Smooth it, for example by moving average
- Outliers: Detect, then investigate before removing
- Duplicates: Find them and link the records

### Integration: joining sources
- Naming conflicts: cust_id in one table, customer in another
- Unit conflicts: Rupees in one source, paise in another
- Format conflicts: Day first or year first dates
- Same entity twice: One person under two IDs: record linkage
- Redundant columns: A column that repeats another

### Spotting a redundant column
- Correlation r measures a straight line link, from minus 1 to 1
- Amount and amount with tax: r = 1.00
- Amount and hour of the day: r = minus 0.01

### The transformation menu
- Smoothing: Remove noise, as in Part Three
- Aggregation: Orders into daily totals per city
- Normalization: Put columns on a common scale
- Discretization: Replace numbers by intervals
- New attributes: Build hour of day from the order time

### Why we normalise
- Raw units: the nearest customer is 13 years older
- Min-max units: age and spend count equally
- The nearest customer is now age 49, spend 2,036

### Min-max and z-score by hand
- 1,968.70 | 1.00 | 1.77
- 687.06 | 0.21 | -0.40
- 347.37 | 0.00 | -0.97
- 813.02 | 0.29 | -0.18
- 509.90 | 0.10 | -0.70
- 1,203.58 | 0.53 | 0.48

### Min-max or z-score?
- Range is always 0 to 1 | No fixed range: centred on 0, spread 1
- 0.5 means halfway between min and max | 1.0 means one standard deviation above the mean
- One huge value squeezes all others near 0 | Less squeezed, but mean and spread are still pulled
- Use when inputs need a fixed range | Use when data are roughly bell shaped

### Discretization: numbers to intervals
- Equal width: 91 percent of orders in one bin
- Equal frequency: about 2,383 orders in each bin
- Edges: 95, 617, 923, 1,308, 1,976, 13,442

### Three ways to reduce data
- Fewer rows: Sampling: analyse a random subset
- Fewer values: Discretization: intervals instead of numbers
- Fewer columns: Dimensionality reduction: fewer, combined columns

### Sampling: how many rows are enough?
- 10 orders: typical error 357 rupees, 26 percent
- 100 orders: 107 rupees, 7.7 percent
- 5,000 orders: 11 rupees, 0.8 percent

### Dimensionality reduction in one picture
- 200 customers: age and spend correlate at 0.80
- Direction 1 keeps 90.1 percent of the variation
- Dropping direction 2 loses only 9.9 percent

### A pipeline in code
- Each step takes a table and returns a table
- Log the size after every step
- Re-run from the raw copy when a rule changes

```python
def run_pipeline(raw):
    data = raw
    for step in [clean, integrate, transform, reduce]:
        data = step(data)
        print(step.__name__, len(data))
    return data
```

### Habits of a good pipeline
- Keep the raw copy | You can always start again
- Automate every step | The same input gives the same output
- Log counts after each step | Silent data loss becomes visible
- Check quality rules on the output | Bad data is stopped early
- Write the rules down | Others can review and repeat the work

### Exam tips and important questions
- Data preprocessing tasks | Cleaning, integration, transformation, reduction, with examples
- Normalization | Min-max and z-score formulas; a small worked example
- Discretization and reduction | Equal width and equal frequency; sampling; dimensionality
- Processing pipeline | Steps in order; keep raw copy; log counts

### Summary of Part Five and of Unit I
- Architecture and sources: Five layers; six sources; three shapes
- Management and quality: Governance, six dimensions, outliers
- Missing and duplicate: MCAR, MAR, MNAR; edit distance, linkage
- Processing pipeline: Clean, integrate, transform, reduce

### References
- J. Han, M. Kamber, J. Pei, Data Mining: Concepts and Techniques, 3rd ed., Morgan Kaufmann
- Student's Handbook for Associate Analytics, named in the syllabus
- Reference books: Tan, Steinbach and Kumar; Zaki and Meira; Leskovec, Rajaraman and Ullman
- Explanations, examples and numbers in this video are original
