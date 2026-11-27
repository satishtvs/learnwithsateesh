### Recap: what Unit III gave us
- Linear regression: Predicts a number such as sales
- Logistic regression: Predicts a class such as churn or stay
- A known answer: Both learn from past rows with a known outcome
- Unit IV: Now we look for groups, then for trends over time

### Today in four steps
- Two questions: Predict a number, or discover groups
- Two kinds of learning: With a teacher, or without one
- K-means by hand: Twelve customers, step by step
- Using it well: Choosing k, scaling, bad starts

### Regression versus segmentation
- Goal: predict a number from other columns | Goal: put similar objects into groups
- Needs a column with the known answer | Needs no answer column
- Output: a formula and a prediction | Output: a group label for every object
- Example: tomorrow's sales for a given spend | Example: which customers behave alike

### A line cannot find groups
- Twelve customers: orders per year, average basket
- Best line explains only 8.5 percent of the variation
- The three groups are obvious to the eye

### Supervised and unsupervised learning
- Regression: Supervised: learn to predict a number
- Classification: Supervised: learn to predict a class
- Clustering: Unsupervised: find groups, no answer given

### Why companies segment customers
- Targeted offers: A different message for each group
- Product design: Build what each group wants
- Retention: Spot groups likely to leave
- Pricing: Test prices per segment
- Store layout: Place items where each group shops

### Similarity means distance
- Customers A and G: 4 and 18 orders
- Euclidean distance: 14.56
- Manhattan distance: 18

### The k-means loop
- Choose k centres: Pick k starting centres, here k is three
- Assign: Each customer joins the nearest centre
- Update: Move each centre to the mean of its group
- Repeat: Stop when nothing changes

### Step one: assign, a worked example
- D | 6.71 | 4.47 | 5.00 | group 2
- E | 16.00 | 14.04 | 13.04 | group 3
- G | 14.56 | 12.37 | 12.08 | group 3
- I | 14.14 | 13.00 | 15.03 | group 2
- L | 10.77 | 9.22 | 11.05 | group 2

### Step two: update the centres
- Group 1 | A | (4, 3) | (4, 3)
- Group 2 | B D I J K L | (6, 4) | (8.5, 12.5)
- Group 3 | C E F G H | (7, 2) | (19, 4.2)

### Watch k-means converge
- Start at A, B, C: S S E 1,675
- Second pass: S S E 247.46
- Final, after four passes: S S E 121.75

### Why k-means always stops
- 1,675: S S E after the first assignment
- 247.46: after the second pass
- 145.75: after the third pass
- 121.75: after the fourth, then no change

### A bad start gets stuck
- Start at E, F, H: S S E 2,006
- The loop stops at S S E 406
- Groups of eight, two and two customers

### Choosing k: the elbow
- k = 1: S S E 1,057.25
- k = 3: S S E 121.75
- k = 6: S S E 38.17

### Scaling changes the groups
- Basket in rupees: values near 1000
- Orders: values near 20; they are ignored
- Standardised: groups of 4, 4, 4

### Reading the segments
- Blue group: few orders, small basket
- Orange group: few orders, big basket
- Green group: many orders, medium basket

### Limits and common mistakes
- Forgetting to scale: Large units swamp small ones
- One start only: Can end in a poor local minimum
- Outliers: One far point drags a centre
- Fixed k: You must choose k yourself
- Round groups only: Works best for compact, similar-sized groups

### Exam tips and important questions
- Regression versus segmentation | Predict a number with known answers versus find groups with none
- Supervised versus unsupervised | Teacher and answer column versus no answers; clustering is unsupervised
- Explain the k-means algorithm | Choose k, assign to nearest centre, update means, repeat until no change
- Numerical on k-means | Distance table, new means, S S E; show two passes

### Summary
- Two questions: Regression predicts; segmentation groups
- Two families: Supervised has answers; unsupervised has none
- K-means: Assign, update, repeat; S S E 121.75
- Good practice: Scale, many starts, choose k by the elbow

### References
- J. Han, M. Kamber, J. Pei, Data Mining: Concepts and Techniques, 3rd ed., Morgan Kaufmann
- Student's Handbook for Associate Analytics, named in the syllabus
- Explanations, examples and numbers in this video are original
