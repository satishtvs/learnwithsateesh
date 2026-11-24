### Where we left off
- Structured outputs: The network outputs a grid, such as a class for every pixel
- Data types: Convolution works on signals, images and volumes, with channels
- Efficient algorithms: Separable kernels and the Fourier transform save work

### Today's four circles
- Random features: Kernels that are never trained, and how well they work
- Layer wise pretraining: An older way to start a deep network without labels
- A small CNN by hand: Forward pass, back propagation and training
- Unit III wrap up: A map of the five parts and exam tips

### Our tiny image task
- Three classes: bar, cross, L shape
- 8 x 8 pixels, random position, a little noise
- 180 training images, 300 test images

### Random kernels or trained kernels
- Values learned by gradient descent | Values drawn once at random, then frozen
- Every layer is updated by back propagation | Only the final dense layer is trained
- Kernels turn into edge and corner detectors | Kernels are random blobs of positive and negative weights
- Costly: gradients through all the layers | Cheap: one linear problem on fixed features

### Random kernels on our task
- Linear on raw pixels: 76.7 percent
- Random kernels, 4, 16, 64: 73.9, 80.5, 87.8 percent
- Four trained kernels: 89.0 percent

### What the kernels look like
- Top row: four random kernels at the start
- Bottom row: the same kernels after training
- Kernel 3 now resembles the corner of an L

### Why random kernels are useful
- Cheap baseline: A reference score before any real training
- Architecture search: Rank designs using random weights, train only the best
- Start for training: Training begins from random kernels anyway

### Greedy layer wise pretraining
- Train layer one: Learn features of the raw input, with no labels
- Freeze it: Keep layer one fixed and compute its outputs
- Train layer two: Learn features of those outputs, again no labels
- Repeat upwards: Add layers one at a time
- Fine tune: Add the output layer, train everything with labels

### The visual cortex and convolution
- Simple cells react to a small patch of the visual field | A convolution unit sees a small local window
- Complex cells stay active when the pattern shifts a little | Pooling hardly changes under small shifts
- The eye sees sharply only in a small centre | A network sees every pixel at the same resolution
- Vision also uses attention and feedback | A basic convolutional net is feed forward only

### Our small network
- Image: 8 x 8 pixels, one channel
- Convolution: 4 kernels of 3 x 3, stride 1, no padding
- ReLU: Replace every negative value by zero
- Max pooling: Keep the biggest value of each 2 x 2 block
- Dense, softmax: 36 numbers to 3 scores, then probabilities

### Shapes and parameters
- Input image | 8 x 8 | 0
- Convolution, 4 kernels | 4 maps of 6 x 6 | 36 weights + 4 biases = 40
- ReLU | 4 maps of 6 x 6 | 0
- Max pooling, 2 x 2 | 4 maps of 3 x 3 | 0
- Flatten | 36 numbers | 0
- Dense layer | 3 scores | 108 weights + 3 biases = 111
- Softmax | 3 probabilities | 0, so the total is 151

### One output value by hand
- Window: rows 3 to 5, columns 4 to 6
- Nine products with kernel 3 add up to 2.37
- Bias 0, ReLU keeps it, pooling passes it on

### The forward pass, stage by stage
- Image, convolution, ReLU
- Pooling and flattening
- Ready for the output layer

### From scores to a loss
- Scores: -0.04, 0.22, -0.03
- Softmax: 0.30, 0.39, 0.31
- Loss: minus log of 0.39, about 0.9356

### Back propagation, layer by layer
- Softmax error: Probabilities minus the true answer: 0.30, -0.61, 0.31
- Dense layer: Gradient on the 36 inputs is the error times the weights
- Max pooling: Only the winner of each block receives the gradient
- ReLU: The gradient passes only where the convolution was positive
- Convolution: Kernel gradient: window times gradient, summed over positions

### The gradient travels backwards
- Error, dense layer, pooling
- ReLU cuts the gradient
- One step lowers this image's loss

### Checking the gradients
- Nudge each of the 151 parameters, up and down
- Compare with the back propagation gradient
- Largest gap: about 2e-11, rounding error

### Training: the loss falls
- 0 (random start) | 1.1483 | 32.3 percent
- 1 | 1.1207 | 36.7 percent
- 10 | 1.0219 | 45.3 percent
- 100 | 0.7336 | 64.3 percent
- 300 | 0.2985 | 90.7 percent
- 600 | 0.1146 | 94.0 percent

### Training, step by step
- Loss curve drawn step by step
- Kernels change from random to patterned
- Fastest drop between steps 100 and 300

### The result on unseen images
- Loss: 1.148 down to 0.115
- Test accuracy: 32.3 up to 94.0 percent
- 18 of 300 test images wrong, 12 of them L shapes

### The classic pattern
- Convolution: Local kernels shared across all positions
- Nonlinearity: Usually a ReLU after each convolution
- Pooling: Shrink the map, keep the strongest responses

### Unit III at a glance
- 1 | The convolution operation | Sparse interactions, shared weights, equivariance
- 2 | Pooling and the prior | Small shift invariance, an infinitely strong prior
- 3 | Variants of convolution | Stride, padding, tied and unshared kernels
- 4 | Outputs, data types, speed | Structured outputs, separable kernels, Fourier
- 5 | Random features, small CNN | Random kernels work, gradients sum over positions

### Exam tips for Unit III
- Count parameters: Kernel size times kernels, plus one bias each; sharing saves
- Output size: Input minus kernel plus one, then divide by the pooling size
- Draw the pipeline: Image, convolution, ReLU, pooling, dense, softmax
- Back propagation: Pooling routes to the winner, ReLU cuts negatives
- Compare: Random against trained kernels, and layer wise pretraining

### Summary and up next
- Random kernels beat raw pixels; trained kernels need far fewer
- 151 parameters, gradients summed over all positions
- Next: Unit IV, recurrent networks

### References
- I. Goodfellow, Y. Bengio, A. Courville, Deep Learning, MIT Press, 2016 (ch. 9)
- Explanations and examples in this video are original summaries
