### Where we left off
- Regularisation: Weight penalties, augmentation and early stopping
- Bagging and dropout: Train and average many networks
- Optimisation: Momentum and adaptive learning rates
- Initialisation: A sensible starting scale for every layer

### Unit III in five parts
- Convolution: The operation and why it works; today
- Pooling: Summarise a neighbourhood; a strong prior
- Stride and padding: Variants of the basic convolution
- Structured outputs: Data types and fast algorithms
- Features, worked CNN: Random features, then a small network end to end

### Our running example
- 8 by 8 pixels, so 64 numbers per image
- Four shapes: two bars, a cross, an L
- A convolutional network keeps the grid

### What is a convolutional network?
- Grid data: Images are 2D grids, time series are 1D grids
- Convolution: Used instead of matrix multiplication
- Small kernel: A few weights reused at every position
- Feature maps: The outputs, one map per kernel
- Many uses: Vision, speech, video, text

### Convolution as a weighted average
- A noisy sensor tracks a moving object
- Average neighbours: weights 1/3, 1/3, 1/3
- Error spread: 0.71 raw, 0.37 smoothed

### The formulas
- Continuous | s(t) = integral of x(a) w(t - a) da
- Discrete | s(t) = sum over a of x(a) w(t - a)
- Two dimensions | S(i, j) = sum of I(m, n) K(i - m, j - n)
- Cross-correlation | S(i, j) = sum of I(i + m, j + n) K(m, n)
- Output size | input size - kernel size + 1

### Three names
- Input: The data: an image, a signal, or the maps of a layer
- Kernel: A small grid of weights; learned in a network
- Feature map: The output of the convolution

### A convolution by hand
- Image: 5 by 5 with a bright vertical stripe
- Kernel: -1, 0, 1 in every row
- Output: 5 - 3 + 1 = 3, so 3 by 3

### Sliding the kernel
- The window moves one step at a time
- Left edge of the stripe: about +24
- Right edge of the stripe: about -24

### Three outputs, checked
- 24: Top left: 8 + 8 + 8, brighter to the right
- 1: Top middle: 1 - 1 + 1, a flat region
- -24: Top right: -9 - 7 - 8, darker to the right

### Convolution or cross-correlation?
- Flips the kernel, then slides it | Slides the kernel as it is
- Uses i - m and j - n on the image | Uses i + m and j + n on the image
- Commutative: image and kernel can swap | Not commutative
- The form in the textbook formulas | The form in most libraries

### What flipping does to our example
- Same image, same kernel, two conventions
- Turned-around kernel here is minus the kernel
- Learning finds the flipped kernel by itself

### Why convolution helps
- Sparse interactions: Each output sees only a few inputs
- Parameter sharing: The same weights at every position
- Equivariant representations: Shift the input, the output shifts

### Sparse interactions
- Matrix multiplication: 7 x 5 = 35 links
- Kernel of width 3: only 15 links
- A small kernel still finds edges

### Receptive field grows with depth
- Layer 1: each unit sees 3 inputs
- Each layer adds 2 inputs: 3, 5, 7, 9
- Deep units are connected to all of the input, indirectly

### Parameter sharing
- A separate weight for every link | One kernel reused at every position
- Each weight is used once | Each weight is used at every position
- Weights grow with the image size | Weights do not change with image size
- Our small picture: 35 weights | Our small picture: 3 weights

### Counting the weights
- 8 by 8 image: 4,096 weights against 9
- 28 by 28 image: 614,656 against 9
- 224 by 224 image: 2,517,630,976 against 9

### The textbook's edge example
- 8,003,072,000: Matrix entries to turn a 320 by 280 picture into its edge picture
- 2: Weights in the convolution kernel that does the same job
- 267,960: Operations: 3 per output pixel, for 319 by 280 pixels

### Equivariance to translation
- Shift the L shape from -3 to +3 pixels
- The feature map shifts by the same amount
- Biggest difference after shifting back: 0.0

### What equivariance does not give
- Shifts: yes: The map moves with the input
- Rotation: no: Turn the image and the map is not simply turned
- Scale: no: Zooming in or out changes the pattern
- At the border: A shifted pattern may be cut off

### Hand-made edge kernels
- Vertical edge kernel: strong on the vertical bar
- Horizontal edge kernel: strong on the horizontal bar
- Each kernel asks one question everywhere

### One convolution layer
- Take the input: An image or the maps of the layer below
- Convolve: Slide each kernel and add the products
- Add a bias: One number per kernel
- Apply a nonlinearity: For example the rectifier; later parts

### Exam tips and important questions
- Define convolution: Give the formula and explain the flip
- Cross-correlation: State the difference from convolution
- Three ideas: Sparse, shared, equivariant
- Parameter count: Compare weights, fully connected versus kernel
- Hand example: Output size n - k + 1; show every product

### Summary and up next
- Convolution slides a kernel and sums the products
- Sparse interactions: few links per output
- Parameter sharing: the same weights everywhere
- Equivariance: shift the input, the output shifts
- Next: pooling and the infinitely strong prior

### References
- I. Goodfellow, Y. Bengio, A. Courville, Deep Learning, MIT Press, 2016 (ch. 9)
- Explanations and examples in this video are original summaries
