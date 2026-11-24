### Where we left off
- Learning is not optimisation: We care about test error but minimise the training cost
- Ill-conditioning: A long narrow valley: steep across, flat along
- Local minima: There are many, but most are good enough
- Saddle points: Flat spots: a minimum in some directions only
- Cliffs: Very steep walls that can throw a step far away

### Three tools and a good start
- Stochastic gradient descent: Step downhill using a minibatch gradient
- Momentum: Keep a velocity so steps build up speed
- nester of momentum: Measure the slope at a look ahead point
- Initialisation: Choose the starting weights so training can begin

### Stochastic gradient descent
- Sample a minibatch: Pick m examples at random from the training set
- Compute the gradient: Average the gradient of the cost over those m
- Take a step: Move the weights downhill: step size times gradient
- Repeat: Until the validation error stops improving

### Why the learning rate must decay
- Minibatch noise does not shrink near the minimum
- Decay the step: excess cost 0.0195 becomes 0.0004
- Textbook rule: steps add up to infinity, squares stay finite

### Too small, right, too large
- Step 0.005: too small, cost 2.402 after 120 steps
- Step 0.0198: about right, cost 0.4578
- Step 0.0205: too large, cost above six million

### The idea of momentum
- Velocity: A running average of the past gradients
- Friction: The factor beta keeps part of the old velocity
- Smoothing: Zigzags across the valley cancel; steps along it add

### The momentum update
- velocity = beta * velocity - step * gradient
- weights = weights + velocity
- beta = 0.9 in our runs; 0.5 to 0.99 is typical

### Same valley, three methods
- Plain steps: 215 steps to reach cost 0.01
- Momentum 0.9: 62 steps, with big swings
- Nesterov 0.9: 24 steps, swings damped

### See it run: a tanh network
- Unit II example: one hidden layer of 10 tanh units
- Blue curve: plain S G D, loss 0.1239 at epoch 60
- Orange curve: momentum 0.9, loss 0.0363 at epoch 60

### Momentum multiplies the step
- Small beta: 0.5: On a steady slope the step grows to 2 times
- The usual choice: 0.9: On a steady slope the step grows to 10 times
- Very large beta: 0.99: On a steady slope the step grows to 100 times

### Nesterov: look before you measure
- Momentum measures the slope where it stands
- Nesterov measures it at the look ahead point
- One step from cost 26.53: 5.812 against 4.868

### Momentum against Nesterov
- Gradient at the current weights | Gradient at the look ahead weights
- Can overshoot across the valley | Corrects the overshoot one step early
- Fast rate only with exact gradients | Better rate on smooth convex problems
- Our valley: 62 steps | Our valley: 24 steps

### Same network, different starts
- Tiny weights, spread 0.01: loss stays at 0.503
- Xavier: loss 1.277 falls to 0.065
- Huge weights, spread 2.5: only 0.568 after 100 epochs

### Symmetry must be broken
- Equal weights give equal gradients, forever
- Equal units are really one unit: loss 0.2034
- A random start separates them: loss 0.0449

### Too small and too large, layer by layer
- Ten Re L U layers, 256 units each
- Half the right spread: signal 0.0011 at layer 10
- Twice the right spread: signal 1104 at layer 10

### Variance of one neuron
- A sum of n independent terms: n times Var(w) times Var(x)
- Fixed spread 0.1: predicted 10.24, measured 11.19 at n = 1024
- Spread 1 over root n: measured 0.89 to 1.20

### Deriving the rule
- One neuron: y = w1 x1 + ... + wn xn, with n inputs
- Independent terms: The variances of independent terms add up
- Variance of y: Var(y) = n Var(w) Var(x)
- Choose Var(w): Var(w) = 1 / n keeps Var(y) = Var(x)

### Xavier and He
- Tanh with Xavier style: settles near 0.235
- Re L U with the same rule: 0.034 at layer 10
- Re L U with He, variance 2 over n: stays near 1

### Which rule for which unit
- LeCun | 1 / n_in | Linear and tanh units
- Xavier or Glorot | 2 / (n_in + n_out) | Tanh and sigmoid units
- He | 2 / n_in | Re L U and its relatives
- Fixed small number | Same everywhere | Breaks as width or depth grow

### What about the biases?
- Hidden biases: zero: The random weights already break the symmetry
- Re L U bias: about 0.1: A small positive bias keeps units active at the start
- Output bias: Set it so the output matches the average target
- Gate biases: In gated units, start with the gate open

### Starting from learned values
- Pretrained weights: Copy layers from a network trained on a related task
- Layer by layer: Train one layer at a time, then fine tune the whole
- Orthogonal start: Matrices that keep the signal size across layers
- Sparse start: Each unit gets only a few non-zero weights

### Exam tips and important questions
- Write the S G D loop: Minibatch, gradient, step; noise and decay
- Momentum equations: Velocity and weight update; the role of beta
- Momentum or Nesterov: Gradient at the current or the look ahead weights
- Why random initialisation: Symmetry breaking and signal size
- Derive Xavier and He: Var(y) = n Var(w) Var(x), then 1/n or 2/n

### Summary and up next
- S G D: A noisy minibatch gradient, so decay the step
- Momentum: A velocity: 62 steps against 215 in our valley
- Nesterov: The slope at the look ahead point: 24 steps
- Initialisation: Random weights with variance 1/n or 2/n
- Up next: Part 7: adaptive learning rates

### References
- I. Goodfellow, Y. Bengio, A. Courville, Deep Learning, MIT Press, 2016 (ch. 8)
- Explanations and examples in this video are original summaries
