### Today in five stops
- Why debugging is hard: A bad result has two possible causes
- Five strategies: Look, fit small, check, monitor
- The gradient check: A computed test of back-propagation
- Street view project: Metrics, baseline, diagnosis
- Coverage and depth: Computed illustrations to finish

### Why debugging is hard
- A bug usually gives a crash or a clear wrong answer | A bug often just gives a slightly worse score
- The behaviour is written down line by line | The behaviour is learned from data
- Fix the line, the fault is gone | Is it the code, the data or the model?
- Tests compare with a known answer | Often no known answer exists

### A poor result has many causes
- A code bug: A wrong gradient or a swapped label
- Bad data: Wrong labels or leaked test cases
- Bad settings: A learning rate that is too big
- A weak model: Too small to fit the task
- Adaptation: The network adjusts around a bug

### Five debugging strategies
- Visualise the model: Watch it work on real inputs
- Visualise worst mistakes: Sort errors by confidence
- Fit a tiny dataset: Even a buggy model should memorise ten cases
- Compare derivatives: Back-propagated against numerical
- Monitor statistics: Histograms of activations and gradients

### Visualise the model in action
- Look at outputs: Draw boxes, text or masks on the input
- Trust the picture: A score can hide nonsense a picture shows
- Check the pipeline: Inspect data before the model sees it

### Visualise the worst mistakes
- 400 examples, 20 labels flipped on purpose
- The 20 most confident mistakes, ringed
- 19 of the 20 are wrong labels

### Fit a tiny dataset
- Ten examples, a small network
- Correct gradients: loss falls to 0.021
- A bug in back-propagation: stuck near 0.5

### Compare with numerical derivatives
- Pick a weight | Call its current value w
- Nudge up and down | Compute the loss at w plus h and w minus h
- Numerical slope | (loss up - loss down) divided by 2h
- Relative error | |a - n| divided by (|a| + |n|)

### A gradient check, computed
- Network with 2, 5, 4 and 2 units, 30 examples
- Correct code: worst error below one in ten million
- Without the tanh derivative: error up to 1.00

### Strategy five, monitor statistics
- Six layers of 100 tanh units
- Small start: the spread falls from 0.42 to 0.02
- Moderate start: from 0.63 to 0.32

### Three starting scales, computed
- Too small: all activations pile up at zero
- Moderate: a healthy spread, layer after layer
- Too large: units stuck at plus or minus one

### Gradient size per layer
- Too small: layer 1 is 49 times weaker than layer 6
- Too large: layer 1 is 14 times stronger
- Moderate: the ratio is only 3.2

### Reading the statistics
- Activations collapse to zero | Weights start too small | Scale the start up
- Units stuck at plus or minus one | Weights too large or inputs unscaled | Scale down, normalise
- Gradient grows toward the input | Exploding gradients | Clip the norm
- Gradient fades toward the input | Vanishing gradients | Better start, shorter paths

### The street view task
- The photos: Street level images with house numbers
- The output: A string of digits, not one digit
- The use: Add buildings to a map
- The bar: About human accuracy, 98 percent

### The practical design loop
- First choose the goal and the metric
- Then build a baseline end to end
- Then find the problem and change one thing

### Choosing the metric
- Of the answers given, how many are right | Of all photos, how many are answered
- Reject a doubtful photo: accuracy rises | Reject a doubtful photo: coverage falls
- A wrong address on a map is costly | A missing address can be added later
- We want about 98 percent | We want it as high as we can

### Rejecting unsure answers
- Answer only above a confidence threshold
- Threshold 0.5: everything answered, 81.9 percent right
- Threshold 0.95: 24.1 percent answered, 97.8 percent right

### The coverage and accuracy curve
- Threshold 0.7: 75.8 percent covered, 88.4 percent right
- Threshold 0.9: 39.6 percent covered, 96.0 percent right
- Accuracy 98 percent costs coverage: only 23 percent

### Baseline, then find the problem
- Baseline: A convolutional net that reads all digits at once
- Result: Far below the human accuracy bar
- Train against test: The two errors were close together
- Visualise the mistakes: Look at the training failures

### What the pictures showed
- Training error is high | Training error is low
- Test error is close to training error | Test error is much higher
- Remedy: a bigger model, better data | Remedy: more data, regularise
- Here: the crops cut off some digits | Not the case in this project

### Fix the crop, then tune
- Widen the crop: The book reports a gain of about ten points
- Tune the settings: Learning rate, size and depth, one by one
- Add depth: Deeper stacks gave better accuracy

### Does depth help? A small test
- One layer: 61.6 percent on unseen patterns
- Two layers: 82.0, three layers: 86.6
- Four layers: 88.1 percent, same width

### Exam tips and important questions
- Why hard: Bug or bad model; adaptation hides bugs
- Five strategies: Name and explain all five
- Gradient check: Write the formula and the relative error
- Statistics: Vanishing, exploding, saturated units
- Street view: Metric, baseline, diagnosis, tuning

### Summary and up next
- A poor result may be a bug or a bad model
- Look, fit tiny, gradient check, monitor statistics
- Coverage trades answers for accuracy
- Street view: baseline, picture, wider crop, depth
- Next: large-scale deep learning and computer vision

### References
- I. Goodfellow, Y. Bengio, A. Courville, Deep Learning, MIT Press, 2016 (ch. 11)
- Explanations and examples in this video are original summaries
