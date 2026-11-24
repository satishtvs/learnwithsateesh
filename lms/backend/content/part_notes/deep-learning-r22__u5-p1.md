### Unit V in six parts
- Metrics, baselines: Measuring a model and a first design; today
- Data, hyperparameters: More data or not; choosing settings
- Debugging: Finding faults; digit recognition
- Scale, vision: Large systems; computer vision
- Speech, language: Speech and natural language
- Other uses, exam: More applications; summary and tips

### The practical design process
- Set goals: Choose the error metric and a target value
- Build end to end: A working pipeline with a baseline model
- Find the bottleneck: Is the fault in the data, model or code?
- Change and repeat: Small changes, measure again

### Goals come first
- Error metric: How success will be measured
- Target value: The error level you hope to reach
- Cost of mistakes: Some errors hurt more than others
- Best possible error: A floor that no model can beat

### Different mistakes, different costs
- Blocking a good message is costly | Missing a sick patient is costly
- We want few false alarms: high precision | We want few misses: high recall
- A person can check the spam folder | A doctor can review the flagged cases
- Raise the threshold to protect good mail | Lower the threshold to catch every case

### The four counts
- True positive | Called positive, really positive
- False positive | Called positive, really negative
- False negative | Called negative, really positive
- True negative | Called negative, really negative

### A confusion matrix, computed
- 73 true positives, 27 false negatives
- 16 false positives, 284 true negatives
- Accuracy is 0.892 on 400 test examples

### Four metrics
- Accuracy: Correct answers out of all examples
- Precision: Of those flagged, how many were real
- Recall: Of the real ones, how many were found
- F score: One number that is low if either is low

### Reading the numbers
- 0.820: Precision: 73 of 89 flagged were real
- 0.730: Recall: 73 of 100 real ones found
- 0.772: F score: sits between the two
- 0.892: Accuracy: 357 of 400 correct

### Moving the threshold
- High threshold: precision 1.000, recall 0.400
- Usual threshold: precision 0.820, recall 0.730
- Low threshold: precision 0.682, recall 0.880

### The precision-recall curve
- Each threshold gives one point on the curve
- Best F score 0.800 at a threshold of about 0.28
- Area under the curve: 0.873

### Coverage
- Confident cases: The system answers them
- Unsure cases: Passed to a person
- Coverage: The share of examples answered

### Coverage against accuracy
- Answer every example: coverage 1.000, accuracy 0.892
- Middle setting: coverage 0.885, accuracy 0.929
- Strictest setting: coverage 0.695, accuracy 0.978

### Class imbalance
- Balanced data: accuracy 0.856, always negative 0.500
- As the positive class gets rare, the rule catches up
- At 2% positive: rule 0.980, classifier 0.937, F score 0.323

### Accuracy against F score
- Red: always negative climbs towards 1
- Green: F score falls from 0.843 to 0.208
- At 1% positive: accuracy 0.939, F score 0.208

### Which metric when
- Balanced classes, equal costs | Accuracy or error rate
- Rare positives | Precision, recall and F score
- Threshold can still change | The precision-recall curve
- A person handles hard cases | Coverage with accuracy

### What is a baseline?
- A first working model: The quickest reasonable system, built end to end
- Chosen by input type: Copy what already works on similar problems
- Judged on your metric: Every later change is compared with it

### Baseline by problem type
- Fixed-size vector: feedforward network, ReLU units
- Image or grid: convolutional network
- Sequence: gated recurrent network, LSTM or GRU

### Defaults for a vector input
- Feedforward net: A few hidden layers of rectified linear units
- Optimiser: Momentum with a decaying rate, or Adam
- Early stopping: Stop when validation loss stops improving
- Regularise: Dropout, or batch normalisation

### Start simple, or start deep?
- A small or simple problem | Images, speech, translation
- Logistic regression or another linear model | A deep network from the start
- Fast and easy to inspect | Linear models are known to fall short
- Keep it as the yardstick | Compare against a smaller deep net

### Training the baseline
- Early epochs: both losses fall quickly
- Epoch 188: lowest validation loss, 0.357
- Epoch 400: training 0.182, validation 0.398

### The stop point and the linear baseline
- The dashed line marks epoch 188
- Linear baseline: validation accuracy 0.803
- Network at the stop: validation accuracy 0.850

### Unsupervised pretraining
- Unlabelled data: Plenty of cheap examples
- Pretrain: Learn features without labels
- Fine-tune: Train on the few labels you have

### Exam tips and important questions
- Metrics: Define precision, recall and F score; draw the confusion matrix
- Imbalance: Explain why accuracy misleads; give a number example
- Coverage and curve: Sketch the precision-recall curve; define coverage
- Baselines: Name the default model for vectors, images and sequences

### Summary and up next
- Fix the error metric and the target before building
- Precision, recall, F score, curve and coverage
- Accuracy misleads when the classes are unequal
- Default baseline: feedforward, convolutional or gated recurrent
- Next: more data, and choosing hyperparameters

### References
- I. Goodfellow, Y. Bengio, A. Courville, Deep Learning, MIT Press, 2016 (ch. 11)
- Explanations and examples in this video are original summaries
