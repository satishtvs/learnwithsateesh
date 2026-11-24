### Where we left off
- The convolution operation: A small kernel slides over the input and gives one output per place
- Sparse interactions: Each output sees only a few inputs
- Parameter sharing: The same kernel weights are used at every place
- Equivariance: If the input moves, the output map moves with it

### Today's map
- Pooling: Three kinds, computed by hand
- Invariance: What a small shift does before and after pooling
- Downsampling: Fewer values, fewer weights
- The prior view: A built-in belief, and when it fails

### Three stages of a layer
- Convolution: Several kernels, each giving a map of linear responses
- Detector: A nonlinear function: how strongly is the feature there?
- Pooling: Replace each place by a summary of its neighbours
- Next layer: Receives a smaller, steadier map

### Our running example
- Task A: a bar, a cross or an L shape, anywhere
- Task B: is the cross in the left or the right half?
- Model: a small network written in numpy

### Pooling by hand
- Max: the largest value in the window
- Average: the sum divided by the window size
- L2: the square root of the sum of squares

### The choices side by side
- Max | The largest value | Strongest response | Most common
- Average | The mean value | Overall level | Smoother
- L2 | Root of sum of squares | Energy of the window | Less common
- Weighted average | Centre counts more | Level near the centre | Rare

### A window sliding over a real map
- Two by two window, stride two: nine windows
- Max pooled output fills in, three by three
- Every window also has an average and an L2 value

### A shift of one place
- Detector row: the strong value moves, 3 of 8 values differ
- Max pooling, width 3, stride 1
- Pooled row: only 2 of 6 values differ

### Moving an L shape
- Detector map: change between 1.13 and 1.46
- Pooled map (3 by 3, stride 1): change between 0.31 and 0.63
- Largest value of the whole map: always 5

### Bigger windows, steadier output
- No pooling: average change 1.30
- Two by two: 0.55; three by three, stride one: 0.44
- Four by four: 0.21; the whole map: 0

### Invariance: help or harm?
- Is there a face in the picture? | Where is the face in the picture?
- Is this digit a seven? | Where is the corner of the digit?
- Shapes appear anywhere: pool a lot | Location is the answer: pool little or not at all
- Dropping the exact place is a feature | Dropping the exact place destroys the answer

### Pooling over learned features
- Three detectors: vertical, horizontal and diagonal line
- Each picture lights up its own detector with a 6
- Max over the three detectors: 6 every time

### Pooling with downsampling
- A stride of 2 halves the map in each direction
- Next layer: 90 weights instead of 360
- Window sizes 3, 5, 7: a 2 by 2 output for any image

### The numbers of downsampling
- 64: pixels in the image
- 36: values in the detector map
- 9: values after two by two pooling
- 4 times: fewer weights in the next layer: 90, not 360

### Prior beliefs
- A prior: Our belief about the weights, held before seeing any data
- A weak prior: Probability spread widely: the data easily moves the weights
- A strong prior: Probability packed narrowly: much data is needed
- Infinitely strong: Zero probability for some values: data can never change that

### A convolution is a dense layer with a prior
- Dense layer: 48 free weights
- Convolution as a matrix: 3 free values, 30 forced zeros
- Same output as sliding the window

### Beliefs built into the network
- Local: Weights zero outside a small window: only neighbours interact
- Shared: Weights identical at every place: a feature looks the same everywhere
- Pooling: A small shift of a feature does not matter
- What data decides: Only the few free values, never the rules

### When the prior is wrong
- Task B: the answer is the position of a cross
- Whole-map pooling: stuck near 72 percent
- Two by two pooling and a plain network: 100 percent

### The prior helps, and the prior hurts
- Task A: whole-map pooling 99.8, plain network 67.7
- Task B: whole-map pooling 69.5, the others about 100
- 300 training pictures, mean of five random starts

### Using the prior wisely
- High training error: suspect the prior, not the data
- Pool only some channels, or pool less in the last layers
- Compare a convolutional model with other convolutional models

### Exam tips and important questions
- Pooling: Define it; show max, average and L2 on a small window
- Invariance: Draw the detector row and pooled row before and after a shift
- Downsampling: How a stride cuts values and next-layer weights
- The prior view: Zero outside a window, identical across places
- Underfitting: When pooling hurts: the position example

### Summary and up next
- Pooling summarises a neighbourhood: max, average, L2
- Pooling gives small-shift invariance; larger windows give more
- Pooling over detectors can learn other invariances
- A stride cuts the values and the weights
- Convolution and pooling are a strong prior: great unless place matters

### References
- I. Goodfellow, Y. Bengio, A. Courville, Deep Learning, MIT Press, 2016 (ch. 9)
- Explanations and examples in this video are original summaries
