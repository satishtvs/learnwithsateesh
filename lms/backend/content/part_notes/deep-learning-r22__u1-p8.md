### Where we stopped in Part 7
- XOR: One hidden layer solved what a single neuron could not
- Cost function: Maximum likelihood gives cross entropy or squared error
- Output units: Linear, sigmoid or softmax, to match the task
- Hidden units: ReLU is the default choice

### Depth versus width
- One hidden layer, very many units | Many layers, fewer units each
- Memorises each pattern separately | Builds simple features, then combines them
- Units needed can grow explosively | Parameters often grow only slowly
- Easy to fit, may generalise poorly | Harder to train, often generalises better

### Universal approximation, in words
- The theorem: One hidden layer can approximate any continuous function
- The catch: It may need an enormous number of units
- Not learnability: Gradient descent may still fail to find the weights
- Not generalisation: No promise of good results on new data
- The lesson: Use depth to spend units wisely

### Why depth helps: folding
- Feed each output into the next layer
- The pieces double with every layer
- One wide layer gives only a few pieces

### A computational graph
- Each node is one simple operation
- Forward pass: values flow left to right
- Backward pass: gradients flow right to left

### The chain rule and shared values
- Chain rule: multiply along a path
- Where two paths meet, add
- Forgetting the sum is a common mistake

### The worked network
- Two inputs, two ReLU hidden units, one output
- Loss: half of the squared error
- Nine parameters to differentiate

### Forward, then backward
- Forward: z, then h, then y, then the loss
- Backward: from the loss to the hidden units
- ReLU passes the gradient only where z is positive

### From node gradients to weight gradients
- -0.96: Gradient at the output: y minus target
- -1.44: Output weight of h1: (-0.96) x 1.5. The other is -0.096
- -1.344: First-layer weight x1 to h1: (-0.672) x 2

### Check it: finite differences
- Nudge one parameter up and down by 0.00001
- Divide the change in loss by 0.00002
- Compare with back-propagation: they agree

### Training with the gradients
- Update: parameter minus 0.02 x its gradient
- Step 1: loss 0.4608 falls to 0.3178
- Step 10: loss 0.0120; step 20: 0.0002

### Forward mode and reverse mode
- Forward mode: one sweep per input
- Reverse mode: one sweep for all inputs
- One scalar loss, so reverse mode wins

### Cost of back-propagation
- 2 to 3 x: The backward pass costs a small multiple of the forward pass
- 18: Extra forward passes for finite differences, with 9 parameters
- Memory: Forward values are stored until the backward pass uses them

### Other differentiation algorithms
- Symbolic | Algebra produces a formula | Formulas swell in size
- Numerical | Nudge and measure, as we did | Slow and approximate
- Forward mode | Carry derivatives with the values | One sweep per input
- Reverse mode | Store values, then sweep back | Needs memory

### Exam tips and important questions
- Depth versus width: Compare them and explain why depth helps
- Universal approximation: State it, and give its limitations
- Computational graph: Draw one and label the forward values
- Back-propagation: Do a numeric example: forward, then backward
- Automatic differentiation: Forward versus reverse mode

### Summary of Unit I and up next
- Deep feedforward nets: XOR, hidden units, back-propagation (Parts 7 and 8)
- Learning algorithms: Classical methods and stochastic gradient descent (Part 6)
- Estimation: Maximum likelihood and Bayesian views (Part 5)
- Generalisation: Capacity, validation, bias and variance (Parts 2 to 4)
- Learning basics: Task, performance, experience, linear regression (Part 1)

### References
- I. Goodfellow, Y. Bengio, A. Courville, Deep Learning, MIT Press, 2016 (ch. 6.4 to 6.5)
- Explanations and examples in this video are original summaries
