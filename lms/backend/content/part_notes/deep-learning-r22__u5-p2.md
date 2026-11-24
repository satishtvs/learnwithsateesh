### Where we left off
- Performance metric: Decide what to measure before building
- Precision and recall: Accuracy alone can hide the rare errors
- Default baseline: Start with a simple model that runs end to end
- Target error: Set a goal so we know when to stop

### Today in four steps
- More data?: Check training error first, then validation
- Capacity: Match model size to the data, the U-shaped curve
- Learning rate: The one setting to tune first
- Automatic search: Grid, random and model-based

### Check training error first
- Training error above target: improve the model
- Training good, validation high: gather data
- After more data, the gap closed

### Learning curves
- Train and validation error against data size
- Simple model: curves meet high, at 0.16
- Flexible model: curves meet near the floor

### Watch the gap close
- Small set: a huge gap
- Medium set: the gap shrinks
- Large set: almost no gap

### Reading a learning curve
- Curves meet high | High | High | Bigger model
- Big gap | Low | High | More data
- Gap shrinking | Rising | Falling | Data helps
- Curves flat, near floor | Low | Low | Done

### When more data helps and when not
- Large gap between validation and training | Training error already above the target
- Flexible model, few examples | Model too simple for the pattern
- Validation curve is still falling | Both curves are flat
- Costs are acceptable | Noise in the labels sets the limit

### When you cannot get more data
- Data augmentation: Make new examples by flipping, shifting or cropping
- Regularisation: Weight decay, dropout and early stopping
- Smaller model: Fewer units when the data is small
- Better data: Fix wrong labels and duplicates

### Hyperparameters
- Learning rate: Step size of the update
- Number of layers: The depth of the network
- Hidden units: The width of each layer
- Weight decay: Strength of the penalty on large weights
- Dropout rate: Fraction of units switched off

### Capacity and error
- Training error keeps falling with capacity
- Validation error falls, then rises
- The best model sits at the bottom of the U

### How settings move capacity
- Hidden units | More units | Goes up
- Number of layers | Deeper network | Goes up
- Weight decay | Stronger penalty | Goes down
- Dropout rate | More units off | Goes down
- Training time | More epochs | Goes up

### The learning rate
- Too small: slow, loss 2.75 at rate 0.001
- Good range: loss 0.0087 at rate 0.1
- Too large: diverges, loss 1865 at 0.28

### Three learning rates side by side
- Blue: rate 0.01, too small
- Green: rate 0.1, good
- Red: rate 0.28, too large

### Setting the learning rate in practice
- Log scale: Try 0.001, 0.003, 0.01, 0.03: steps of about three
- Watch training: The training loss shows the rate is wrong
- Go just below: Pick a rate a little under the largest stable one
- Decay it: Lower the rate later in training

### Searching automatically
- Pick ranges: A low and a high value for each setting
- Choose trials: Decide which combinations to train
- Train and score: Use the validation error for each
- Narrow down: Search again in a smaller range

### Grid versus random
- Grid: 3 by 3, only 3 learning rates
- Random: 9 trials, 9 learning rates
- Random beat the grid 90 percent of the time

### Nine trials, one by one
- Left: grid search, 3 values per axis
- Right: random search, new values each time
- Best so far appears below

### Why random search wins
- Values repeat across the grid | Every trial uses a new value
- 9 trials give 3 values per setting | 9 trials give 9 values per setting
- Cost grows fast with more settings | The number of trials is your choice
- Wastes trials on unimportant settings | Covers the important one well

### Model-based search
- Try a setting: Train one model and record its score
- Fit a guesser: Learn how the score depends on the settings
- Pick the next: Choose a promising or uncertain setting
- Repeat: Each result improves the guesser

### A practical checklist
- Set the target: Metric and goal error from Part 1
- Training error first: Above target? Raise capacity or tune the rate
- Then the gap: Large gap? More data, augmentation or regularisation
- Learning rate, log scale: Always first, watch the training loss
- Random search: When many settings, with a fixed budget of trials

### What to remember
- Training first: High training error means more data will not help
- Learning curve: A closing gap says data pays off
- U-shaped curve: Pick capacity at the lowest validation error
- Random search: More distinct values per trial than a grid

### Summary
- Check training error first, then the validation gap
- Learning curves show whether more data helps
- Validation error is U-shaped in capacity
- Learning rate first, on a log scale
- Random search beats grid search; next: debugging

### References
- I. Goodfellow, Y. Bengio, A. Courville, Deep Learning, MIT Press, 2016 (ch. 11)
- Explanations and examples in this video are original summaries
