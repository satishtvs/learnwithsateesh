### Recap and today's goal
- Tree growth: Ask the best question, then repeat in each branch
- Impurity: Entropy and Gini score each split
- Stopping: Pure node, minimum size, depth limit
- Today: Why unlimited growth hurts, and the cure

### Today in four steps
- Overfitting: Training versus test accuracy
- Pre-pruning: Stop the tree early
- Post-pruning: Grow fully, then cut back
- Many trees: Bagging and random forests

### Training accuracy versus test accuracy
- Depth 1: training 0.850, test 0.810
- Depth 3: test peaks at 0.841
- Unlimited depth: training 1.000, test 0.777

### Watch the boundary get more complicated
- Depth 1: 2 leaves, test 0.810
- Depth 4: 14 leaves, test 0.821
- Depth 9: 26 leaves, test 0.777

### Underfitting versus overfitting
- Tree is too small to see the pattern | Tree is too big and follows the noise
- Training accuracy is low | Training accuracy is very high
- Test accuracy is low | Test accuracy is lower than training
- Cure: allow more splits | Cure: prune, or average many trees

### What causes overfitting
- A very deep tree: More questions fit more noise
- Tiny leaves: A leaf with one or two rows is unreliable
- Noisy labels: Wrong labels are memorised
- Few training rows: Little data, easy to memorise

### Pre-pruning: stop early
- depth at most 2 | 4 | 0.850 | 0.810
- depth at most 3 | 8 | 0.892 | 0.841
- depth at most 4 | 14 | 0.925 | 0.821
- leaf at least 5 rows | 13 | 0.875 | 0.835
- leaf at least 10 rows | 8 | 0.850 | 0.810
- leaf at least 20 rows | 5 | 0.850 | 0.810

### Post-pruning: grow, then cut back
- Grow a full tree: Let it overfit on purpose
- Price each subtree: Error plus alpha times leaves
- Cut the weakest link: Remove the branch that helps least
- Choose by validation: Pick the alpha with the best held-out score

### The pruning path
- Full tree: twenty six leaves, CV 0.808
- Chosen: ten leaves, CV 0.825
- Test accuracy 0.824, up from 0.777

### Pruning step by step
- 26 leaves: training 1.000
- 16 leaves: training 0.958
- 10 leaves: chosen by cross-validation

### Pre-pruning versus post-pruning
- Stops the tree while it grows | Cuts back after the full tree exists
- Fast: the big tree is never built | Slower: needs the full tree first
- May stop too early, missing a later useful split | Sees the whole tree before deciding
- Settings: depth, leaf size | Setting: alpha, chosen by validation

### Bagging: many trees, one vote
- Draw rows with replacement: a bootstrap sample
- Each sample misses about 37 percent of rows
- Train one tree per sample, then vote

### Adding trees to the vote
- 1 tree: test accuracy 0.791
- 10 trees: 0.838
- 100 trees: 0.823

### One tree wobbles, the vote is steady
- 100 bootstrap trees: test accuracy from 0.694 to 0.834
- Average single tree: 0.773
- The vote of the trees: 0.823

### The random forest algorithm
- Bootstrap a sample: A different sample for every tree
- Random features: At each split, look at only a few columns
- Grow deep trees: No pruning: let each tree be detailed
- Vote: Majority of all trees gives the answer

### Useful extras of a forest
- Out-of-bag error: Score each tree on the rows it never saw: 0.825
- Feature importance: Days since last order 0.748, orders 0.252
- Number of trees: More trees: steadier, never worse
- Features per split: The main setting to tune
- Less tuning: No pruning needed; hard to overfit

### Our results on the test customers
- 0.777: One full tree, no pruning
- 0.824: Pruned tree, 10 leaves
- 0.823: Bagging, 100 trees
- 0.823: Random forest, 100 trees

### Exam tips and important questions
- What is overfitting? How to detect it? | High training accuracy, low test accuracy; use a held-out set
- Pre-pruning and post-pruning | Stop early versus cut back; cost is error plus alpha times leaves
- What is bagging? | Bootstrap samples, one tree each, majority vote; reduces variance
- Random forest versus bagging | Random subset of features at every split; trees less alike

### Summary
- Overfitting: Training 1.000, test only 0.777
- Pruning: Alpha chosen by CV: 10 leaves, test 0.824
- Bagging: Bootstrap samples, majority vote
- Random forest: Bagging plus random features at each split

### References
- J. Han, M. Kamber, J. Pei, Data Mining: Concepts and Techniques, 3rd ed., Morgan Kaufmann
- Student's Handbook for Associate Analytics, named in the syllabus
- Explanations, examples and numbers in this video are original
