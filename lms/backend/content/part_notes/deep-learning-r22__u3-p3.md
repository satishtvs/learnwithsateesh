### Where we left off
- Convolution basics: A small kernel: sparse links, shared weights, equivariance
- Pooling: Summarise a neighbourhood by one number
- Invariance: A small shift barely changes the pooled output
- Strong prior: Weights are local and repeated everywhere

### Today's map
- Stride: The window skips positions
- Zero padding: Zeros around the input set the output size
- Unshared and tiled: Relax the rule of one kernel
- Channels: Many kernels, many feature maps

### Our running task
- Shapes: bar, cross, L shape
- Train on 60 images, test on 600
- Noise added, random position

### Stride: skipping positions
- The window jumps by the stride
- 8 by 8 in, 3 by 3 out
- Middle row is large: the horizontal arm

### Strided convolution is downsampling
- Ordinary convolution, then keep every second output
- Same numbers as a direct stride 2 convolution
- Half the multiplications: 9 instead of 18

### Why we pad
- Valid: no zeros, output shrinks, edges seen less
- Same: one zero on each side, output as long as input
- Full: windows run off both ends, every value seen by all

### Padding grows the output
- No padding: 6 by 6 output
- Border of zeros: 8 by 8 output
- Two borders: 10 by 10 output

### Valid, same and full
- Valid | 0 | 6 | Output shrinks by k minus 1
- Same | (k minus 1) / 2 | 8 | Output as long as input
- Full | k minus 1 | 10 | Every value seen k times

### The output size formula
- Pad: Add p zeros at both ends: length n plus 2 p
- Fit: Subtract the kernel width k
- Divide: Divide by the stride s and round down
- Count: Add one for the first window

### Worked examples
- 8 | 3 | 1 | 0 | 6
- 8 | 3 | 1 | 1 | 8
- 8 | 3 | 2 | 0 | 3
- 8 | 3 | 2 | 1 | 4
- 28 | 5 | 1 | 0 | 24
- 28 | 5 | 2 | 2 | 14
- 224 | 7 | 2 | 3 | 112

### Tied, tiled and unshared
- Tied: one kernel for every position
- Tiled: a few kernels, cycled in a pattern
- Unshared: every position has its own kernel

### When to leave weights unshared
- Location matters: A feature may live in one region, like eyes in a face
- No weight sharing: Parameters grow with the number of positions
- No equivariance: A shifted pattern is not treated the same way
- Still sparse: Each output sees only a small patch

### Counting weights
- Tied | 1 | 40 | 26
- Tiled 2 by 2 | 4 | 160 | 104
- Unshared | 36 | 1440 | 14976

### Tiling in one dimension
- Position 1: Uses kernel A
- Position 2: Uses kernel B
- Position 3: Uses kernel C
- Position 4: Back to kernel A

### Parameters on a log scale
- Green: tied, 40 weights
- Blue: tiled, 160 and 360
- Orange: unshared, 1440; red: dense, 9360

### Channels and multiple kernels
- Input: 3 channels of 8 by 8
- One kernel is a 3 by 3 by 3 block
- 4 kernels give 4 output channels

### Three numbers to remember
- 112: Parameters: 4 kernels of 3 by 3 by 3, plus 4 biases
- 144: Output values: 4 channels of 6 by 6
- 27648: Weights a dense layer of the same shape would need

### Designing one layer
- Kernel size: How big a patch each output sees
- Number of kernels: Sets the number of output channels
- Stride: How far the window moves
- Zero padding: Controls the output size
- Sharing: Tied, tiled or unshared

### See it run: three ways to share
- Same data, three kinds of sharing
- Unshared learns the training set fastest
- Tied wins on the test images

### Which one generalises?
- Mean test accuracy: tied, then tiled, then unshared
- Even the worst tied start beats the best unshared start
- All three fit the training images perfectly

### Exam tips and important questions
- Output size: Write the formula and work one example
- Padding: Valid, same and full: what each one does
- Stride: Convolution followed by downsampling
- Sharing: Tied, unshared, tiled, with parameter counts
- Channels: Count the weights of a multi channel layer

### Summary and up next
- Stride skips positions: convolve, then downsample
- Output size: floor of (n + 2p - k) / s, plus 1
- Padding: valid shrinks, same keeps, full grows
- Tied, tiled and unshared: 1, a few, or all kernels
- Next: structured outputs, data types, fast algorithms

### References
- I. Goodfellow, Y. Bengio, A. Courville, Deep Learning, MIT Press, 2016 (ch. 9)
- Explanations and examples in this video are original summaries
