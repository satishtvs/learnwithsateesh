### Where we left off
- Stride: The kernel jumps several positions, so the output is smaller
- Padding: Zeros at the border keep the output size under control
- Unshared and tiled: Different weights per position, or a small set reused in turn
- Channels: Each filter reads all input channels and makes one map

### Today's three questions
- Structured outputs: One label for every pixel
- Data types: Sound, pictures, scans and video
- Fast convolution: Separable kernels and the Fourier route

### One answer or many answers
- One class for the whole image | A class for every pixel
- Last layers squeeze space away | The output keeps height and width
- Is this a cross? | Which pixels belong to the cross?
- The target is one number | The target is a mask shaped like the image

### Labelling every pixel
- Input: 8 by 8 image with noise added
- Target: a mask, 1 on the shape, 0 elsewhere
- One 5 by 5 kernel: accuracy 0.9553 on 200 test images

### Watching the labels appear
- Start: all background, accuracy 0.9083
- Step 10: the cross appears, overlap 0.4012
- Step 600: accuracy 0.9553, overlap 0.5763

### What the kernel learned
- Middle weight 3.97, the largest
- Four direct neighbours average 1.16, corners minus 0.14
- Bias minus 5.89: ink needs plenty of evidence

### A bigger window helps
- Background everywhere | 0 | 0.9083 | 0
- 1 by 1 kernel | 2 | 0.9351 | 0.3831
- 3 by 3 kernel | 10 | 0.9477 | 0.5099
- 5 by 5 kernel | 26 | 0.9553 | 0.5763

### Beyond one pass
- Predict: A probability for every pixel, often on a slightly smaller grid
- Feed back: The labels become extra input channels
- Refine: The same kernels run again, so neighbours agree
- Clean up: Optionally group pixels with a graph model

### Which data can a convolution read?
- One axis: sound, with one or more channels
- Two axes: grey and colour images
- Three axes: scan volumes and colour video

### Counting the outputs
- 15,998: Audio: 16,000 samples, kernel of width 3
- 26 by 26: Grey image 28 by 28, kernel 3 by 3
- 222 by 222: Colour image 224 by 224, per filter
- 62 cubed: CT cube 64 on each side, kernel 3 by 3 by 3

### Channels and batches
- Batch axis: 32 colour images of 224 by 224 hold 4,816,896 numbers
- Channel axis: Three colour channels, later feature maps
- Space axes: The kernel slides here
- Filters: 16 filters of 3 by 3 on 3 channels: 448 numbers

### Inputs of varying size
- The same 5 by 5 kernel on 8 by 8, 8 by 24 and 16 by 16
- The output is always as large as the input
- Pixel accuracy 0.9844, 0.9635, 0.9609

### Why speed matters
- Convolution is the most expensive step of the network
- 224 by 224 image, 7 by 7 kernel: 47,524 outputs
- 2,328,676 multiplications for one filter on one channel

### A kernel from two short ones
- A column 1, 2, 1 and a row 1, 0, minus 1
- Their outer product is a 3 by 3 kernel
- Nine numbers described by 3 plus 3

### Two short passes
- Row pass: 8 by 8 becomes 8 by 6, 144 multiplications
- Column pass: 6 by 6, 108 more
- 252 in all against 324, and the same output

### The saving grows with the kernel
- Full kernel: k times k per output
- Two passes: k plus k per output
- Width 7: 49 against 14; width 11: 121 against 22

### The Fourier route
- Pad: Add zeros so both signals have the full output length
- Transform: Take the Fourier transform of the signal and of the kernel
- Multiply: Multiply the two results one frequency at a time
- Invert: The inverse transform gives the convolution

### The Fourier route, step by step
- Signal of 16 samples, moving average kernel of width 5
- Padded to 20, transformed, multiplied, inverted
- Last frame: the Fourier answer sits on the direct answer

### Checking the two routes
- Signal of 32 values, kernel of 5, output of 36
- Direct and Fourier answers coincide at all 36 positions
- Largest error below two in a thousand trillion

### Which method when
- Direct sum | Small kernels, the usual case | Outputs times kernel size
- Separable | The kernel is an outer product | Sum, not product, of widths
- Fourier | Large kernels, long signals | Signal length, not kernel width
- Approximate | An active research area | Trade a little accuracy

### Exam tips and important questions
- Structured outputs: One label per pixel; feed labels back to refine
- Data types: Examples for one, two and three axes, with channels
- Varying size: Same kernel on any size; pooling regions fix the end
- Separable kernels: Outer product; cost falls from k times k to k plus k
- Fourier route: Pad, transform, multiply, invert

### Summary and up next
- Structured outputs: One label per pixel: accuracy 0.9553
- Any data type: Audio, images, volumes; any size
- Faster convolution: Separable: 3.45 times fewer; Fourier: same answer
- Up next: Part 5: Random and unsupervised features, a small CNN

### References
- I. Goodfellow, Y. Bengio, A. Courville, Deep Learning, MIT Press, 2016 (ch. 9)
- Explanations and examples in this video are original summaries
