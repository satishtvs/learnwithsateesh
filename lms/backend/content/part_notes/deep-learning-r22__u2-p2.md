### Where we left off
- L2 weight decay: Adds the sum of squared weights to the cost
- L1 penalty: Adds the sum of absolute weights: many weights become zero
- Constraint view: A penalty equals keeping the weights inside a ball
- Under-constrained: A penalty picks one stable solution

### Five more tools
- Augmentation: Make more examples by changing the ones we have
- Noise robustness: Train with random disturbances
- Semi-supervised: Also use examples with no labels
- Multi-task: Related tasks share layers
- Early stopping: Stop at the right moment

### The running example
- Ten noisy points from a sine wave
- A polynomial of degree 9 passes through all of them
- Test error 0.4753; the noise floor is 0.0625

### Augmentation: more data from old data
- Change the input, keep the label
- A shifted 7 is still a 7: a new example
- Danger: a turned 6 becomes a 9

### Which transforms are safe?
- Shift or crop | Objects in images | Position carries meaning
- Flip left to right | Photos of animals | Digits and letters
- Small rotation | Photos, handwriting | Six and nine
- Brightness, colour | Photos in any light | Colour is the answer
- Added noise | Speech, sensor signals | Noise hides the signal

### Augmenting our ten points
- The same degree 9 model every time
- Extra copies of each point, jittered
- Test error: 0.4753 with no copies

### Four places to add noise
- At the input: Small random values added to every input
- On the weights: Disturb the weights a little each step: flat minima
- On the labels: Real labels are sometimes wrong: soften them
- In hidden units: Random switching off: the idea of dropout

### Noise on features is a penalty
- Add noise of size s to the features while training
- Average loss = error + s squared times sum of w squared
- Best test error 0.0859 at s = 0.21

### Label smoothing in numbers
- 0.9000: Target for the right class, instead of 1
- 0.0111: Target for each of the nine wrong classes, instead of 0
- 4.39: The largest logit gap the loss wants

### Using examples without labels
- Every example needs a person to label it | Also uses examples nobody has labelled
- Labels are costly and slow | Raw data is cheap and plentiful
- Few points give only a rough boundary | Unlabelled points show where the data clumps
- Learns only the answer given the input | Also learns the shape of the inputs

### Semi-supervised learning at work
- 6 labelled points, 300 unlabelled
- Every point shares in moving the class centres
- Test accuracy rises from 0.827 to 0.8685

### The loop behind it
- Fit on labelled data: A first model from the few labels
- Guess missing labels: Softly, or keep only confident guesses
- Refit on everything: Labelled plus guessed points
- Repeat: Until nothing changes

### Multi-task learning: a shared trunk
- Shared layers learn features common to all tasks
- One small head for each task
- Every task sends gradient into the shared part

### Does sharing help? An experiment
- 10 inputs, only 12 examples per task
- Each task alone: test error about 0.50
- Shared direction, 8 tasks: 0.059

### When does multi-task help?
- Shared factors: The tasks are explained by the same underlying factors
- Little data per task: Small tasks borrow strength from the others
- Auxiliary tasks: A cheap extra task can improve the shared layers
- Conflicting tasks: Opposite pulls hurt: keep more layers separate

### Early stopping in four steps
- Train: Take gradient steps as usual and keep going
- Check: Every so often, measure the validation error
- Save: Keep a copy of the weights when the error is the best so far
- Stop: When there is no gain for a fixed patience, return the copy

### Early stopping on our example
- Gradient descent from zero weights
- Training error falls all the time
- Validation error is lowest at step 13

### Why stopping early is a penalty
- Few steps: the weights have not travelled far
- Steep directions are learned first, flat ones last
- Stopping at 13 steps is like L2 with strength 0.0772

### The numbers behind the match
- 0.00094 (flat) | 1.22 percent | 1.21 percent
- 0.0510 (medium) | 49.2 percent | 39.8 percent
- 0.1537 (steeper) | 88.5 percent | 66.6 percent
- 1.0037 (steepest) | 100.0 percent | 92.9 percent

### Using the validation data again
- Start again from fresh random weights | Start from the weights saved at the best step
- Train on all data for the same number of steps | Train on all data until the loss matches the earlier one
- Simple, but costs one more full run | Cheaper, but may never reach the target loss
- Only the step count is carried over | Weights and the loss level are carried over

### The five tools in one table
- Augmentation | The data: more varied examples | A transform that changes the label
- Noise | The inputs, weights or labels | Too much noise underfits
- Semi-supervised | Adds unlabelled data | A wrong first model repeats itself
- Multi-task | Shares layers across tasks | Tasks that conflict
- Early stopping | The stopping time | Needs a validation set

### Same ten points, five ways
- No regularisation: test error 0.4753
- Augmentation 0.0892, noise 0.0858, early stopping 0.0909
- L2 from Part 1: 0.0856; noise floor 0.0625

### Exam tips and important questions
- Augmentation: Define it, list three transforms, give one that fails
- Noise: Noise on inputs is a weight penalty; label smoothing
- Semi-supervised: Uses unlabelled data; boundary moves into the gap
- Multi-task: Draw the shared trunk with one head per task
- Early stopping: Draw the two curves, mark the best step, link to L2

### Summary and up next
- Overfit: training error 0, test error 0.4753
- Four tools bring the test error to about 0.09
- Unlabelled data and shared layers add structure
- Next: parameter tying, sparsity, bagging, dropout

### References
- I. Goodfellow, Y. Bengio, A. Courville, Deep Learning, MIT Press, 2016 (ch. 7)
- Explanations and examples in this video are original summaries
