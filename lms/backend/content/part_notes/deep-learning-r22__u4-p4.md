### Unit IV in six parts
- Unfolding and RNNs: Graphs over time, parameter sharing
- Bidirectional, seq to seq: Read both ways; encoder and decoder
- Deep and recursive nets: Depth in three places, and trees
- Long-term dependencies: Why memory fades; echo state networks; today
- Leaky units and gates: Several time scales, then the gated cells
- Optimisation, memory: Clipping, and explicit memory

### Short range and long range
- The answer depends on the last few inputs | The answer depends on an input far back
- Example: next letter after 'q' is 'u' | Example: a verb must agree with a subject ten words earlier
- The gradient path is short | The gradient path crosses many time steps
- Ordinary training copes well | Ordinary training struggles

### The same weight, again and again
- Forward: h(t) = w h(t-1), same w every step
- Backward: gradient is multiplied by w each step
- After 5 steps: 0.9 ^ 5 = 0.59

### The algebra of repeated products
- Linear recurrence | h(t) = W h(t-1), so h(t) = W^t h(0)
- Eigendecomposition | W = Q diag(lambda) Q^T for a symmetric W
- Power of W | W^t = Q diag(lambda^t) Q^T
- Spectral radius | rho = largest |lambda|
- Gradient after t steps | grows or shrinks like rho^t

### The scalar example, computed
- w = 0.9: 0.349 at 10 steps, 0.00515 at 50
- w = 1.0: stays at 1
- w = 1.1: 2.59 at 10 steps, 117 at 50

### A hundred steps back
- 0.0000266: Vanishing: w = 0.9, after 100 steps
- 1: Balanced: w = 1.0, the only knife-edge
- 13,781: Exploding: w = 1.1, after 100 steps

### A ten by ten matrix, computed
- Same matrix at every step, three spectral radii
- Radius 0.9: 0.203, 0.0246, 0.00104 at 10, 30, 60
- Radius 1.1: 1.51, 10.1, 177

### Where the eigenvalues sit
- Eigenvalues of three random 100 by 100 matrices
- Inside the circle: 0.90 ^ 50 = 0.00515
- Outside: 1.10 ^ 50 = 117

### A gradient travelling back
- Gradient of size 1 starts at the last step
- Factor 0.9: only 0.314 reaches the start
- Factor 1.1: 2.85 reaches the start

### What goes wrong in practice
- Vanishing: Early steps get no learning signal
- Exploding: A huge update throws the weights away
- Short memory: The model only learns nearby links

### Vanishing against exploding
- Spectral radius below 1 | Spectral radius above 1
- Loss barely changes; training stalls | Loss jumps or becomes not a number
- Hard to notice: it looks like slow learning | Easy to notice: numbers blow up
- Needs a better design of the cell | Can be cut by clipping the gradient

### Why long memory is hard
- Long links get tiny weight: Their gradient is exponentially smaller than short links
- Noise drowns the signal: Small fluctuations from short links dominate the sum
- Training takes very long: Reaching a span of 60 steps may need huge training time
- Storing needs stability: A stable memory means a radius below one, so it fades

### A different idea
- Random recurrent weights: Chosen once and never trained
- Spectral radius near 1: Set by scaling the matrix
- Input scaling: How strongly the input drives the units
- Trained readout: The only weights learned
- Least squares: No backpropagation through time at all

### Architecture
- 200 units, 4034 fixed recurrent weights
- 200 fixed input weights
- 201 trained readout weights

### The recipe
- Draw random weights: Sparse recurrent W and input weights
- Scale the radius: Divide W so its spectral radius is rho
- Run and collect: Feed the inputs, store every state
- Solve the readout: One least squares problem

### The equations
- Reservoir state | x(t) = tanh( Win u(t) + W x(t-1) )
- Radius control | W = W0 x rho / (spectral radius of W0)
- Readout | y(t) = Wout x(t) + b
- Least squares | Wout = (X^T X + c I)^-1 X^T Y

### How far back can it remember?
- Task: repeat the input from k steps ago
- Radius 0.5: recall drops below half at k = 12
- Radius 1.0: below half only at k = 18

### The knobs to set
- Spectral radius: Near 1 for long memory; lower for short tasks
- Input scaling: Small: nearly linear; large: saturated
- Reservoir size: More units give richer features
- Sparsity: About 10 percent of weights are non-zero
- Ridge term: A tiny number stops overfitting

### A toy sequence task
- Random input; target: sin(2 (u(t-1) + u(t-3)))
- Echo state network, test error 0.042
- Linear model on last 10 inputs: 0.488

### Running on unseen steps
- Top: the input, step by step
- Middle: five of the 200 reservoir units
- Bottom: prediction against target; error 0.039 over 80 steps

### Turning the knobs
- Radius 0.3: 0.006; 0.9: 0.042; 1.5: 0.455
- Input scaling 0.01: 0.499; 1: 0.042; 5: 0.198
- Size 20: 0.346; 200: 0.042; 400: 0.038

### Advantages and limits
- Training is one linear solve | Recurrent weights are random, not learned
- No gradient through time, so no vanishing | Memory is finite: it fades after about twenty steps here
- Very fast and easy to code | Needs many units and careful tuning of the radius
- Works for small, smooth tasks | Weak on tasks needing long, exact memory

### Exam tips and important questions
- Explain the problem: Repeated product of W; eigenvalues decide
- Vanishing and exploding: Radius below or above 1; give the scalar example
- Why long memory is hard: Tiny long links, noise, long training
- Describe an echo state net: Fixed reservoir, only readout trained
- Pros and cons: One linear solve; finite memory

### Summary and up next
- Repeated product: The same W at every step: shrink or blow up
- Spectral radius: Below 1 vanishes, above 1 explodes
- Hard memory: Long links get tiny gradients and drown in noise
- Echo state network: Fixed reservoir, least squares readout
- Up next: Part 5: leaky units and gated cells

### References
- I. Goodfellow, Y. Bengio, A. Courville, Deep Learning, MIT Press, 2016 (ch. 10)
- Explanations and examples in this video are original summaries
