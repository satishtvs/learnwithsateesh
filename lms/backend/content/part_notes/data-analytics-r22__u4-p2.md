### Recap and today's goal
- Segmentation: Groups found without answers: k-means
- Supervised learning: Learns from rows whose answer is known
- Classification: Predicts a class, such as churn or stay
- Regression: Predicts a number, such as units sold

### Today in four steps
- Anatomy: Root, branches and leaves
- Impurity: Entropy and Gini measure mixing
- Growing by hand: Fourteen customers, best question first
- Regression trees: Same idea with variance

### Anatomy of a decision tree
- Root: the first question
- Internal nodes and branches: more questions
- Leaves: the final answer

### Our training data
- Fourteen customers, three questions
- 6 churned, 8 stayed
- Tenure, discount used, support tickets

### Classification tree versus regression tree
- Predicts a class: churn or stay | Predicts a number: units sold
- Impurity: entropy or Gini | Impurity: variance of the target
- A leaf gives the majority class | A leaf gives the mean of its rows
- Example: will this customer churn? | Example: how many units on a 12 percent discount?

### Impurity: how mixed is a group?
- Pure group: impurity is zero
- Entropy of our 14 customers: 0.985
- Gini index of our 14 customers: 0.490

### Entropy of the root, step by step
- Churn yes | 6 | 0.4286 | 0.5239
- Churn no | 8 | 0.5714 | 0.4613
- Entropy | 14 | 1.0000 | 0.9852

### Information gain of every question
- Tenure | Long 1/7 Short 5/1 | 0.5892 | 0.3960 | 0.2457
- Discount | No 4/5 Yes 2/3 | 0.9839 | 0.0013 | 0.0009
- Tickets | Low 3/6 High 3/2 | 0.9371 | 0.0481 | 0.0327

### Entropy versus Gini index
- Minus the sum of p times log of p | One minus the sum of p squared
- Largest value is one for two classes | Largest value is one half for two classes
- Needs logarithms | Needs only squares, a little cheaper
- Used in ID3 and C4.5 | Used in CART

### Growing the tree: the greedy loop
- Choose the best question: Largest information gain
- Split the rows: One branch for each answer
- Repeat in every branch: Treat each branch as a smaller problem
- Stop and make a leaf: When the branch is pure or nothing is left to ask

### The finished tree
- Root: tenure, gain 0.396
- Second level: discount used in both branches
- 6 leaves, all pure

### Numeric attributes: a threshold
- 40 customers: orders per year, days since last order
- Try every midpoint as a threshold, keep the best
- Best first question: days <= 51.5

### A tree cuts the plane into boxes
- Depth 1: one cut, accuracy 0.950
- Depth 2: orders per year at most 20
- Depth 5: 6 boxes, accuracy 1.000

### Regression tree: choosing the split
- Ten days: discount percent and units sold
- Split quality is the total S S E of the two sides
- Best threshold 27.5: S S E 591.38

### Growing the regression tree
- One leaf: S S E 2,268.4
- Two leaves: S S E 591.38
- Six leaves: S S E 15.17

### When to stop growing
- Pure node: All rows have the same answer
- Too few rows: A minimum leaf size, such as five rows
- Depth limit: At most a chosen number of questions
- No useful gain: The best split barely improves impurity

### Exam tips and important questions
- Parts of a decision tree | Root, internal nodes, branches, leaves, depth; a leaf gives the answer
- Entropy, information gain, Gini | Write the formulas in words; gain is entropy before minus weighted entropy after
- Build a tree for a table | Entropy of root, gain of each attribute, split on the largest, repeat
- Regression tree | Split to minimise S S E; leaf predicts the mean

### Summary
- Anatomy: Root, branches, leaves
- Impurity: Entropy 0.985, Gini 0.490 at the root
- Greedy growth: Tenure first, gain 0.396; six pure leaves
- Regression trees: Split by S S E; four leaves reach 23.83

### References
- J. Han, M. Kamber, J. Pei, Data Mining: Concepts and Techniques, 3rd ed., Morgan Kaufmann
- Student's Handbook for Associate Analytics, named in the syllabus
- Explanations, examples and numbers in this video are original
