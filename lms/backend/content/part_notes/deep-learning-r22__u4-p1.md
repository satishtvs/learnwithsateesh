### Where we left off
- Convolution: A small kernel slides over the grid
- Pooling: Summarise a neighbourhood
- Stride and padding: Variants and fast algorithms
- Learned features: A small network built end to end

### Unit IV in six parts
- Unfolding, recurrence: Graphs through time and the basic network; today
- Bidirectional, seq to seq: Reading both ways; encoder and decoder
- Deep and recursive: Stacked recurrent layers; tree structured nets
- Long-term dependencies: Why it is hard; echo state networks
- Gates and memory: Leaky units, gated nets, optimisation, memory

### Sequences are everywhere
- Speech and audio: A long list of pressure readings
- Text: A list of words or characters
- Sensor readings: A temperature every second
- Video: A list of frames
- Variable length: A sentence has five words or fifty

### Feedforward versus recurrent
- A fixed input size | Any sequence length
- Separate weights for each position | The same weights at every time step
- No memory of earlier inputs | A hidden state carries a summary
- Output depends on this input only | Output depends on the whole past

### Our running example
- The symbols a, b, a, c repeat forever
- After a comes b or c: the symbol before decides
- With no memory, every a is a coin flip

### The recurrence
- Classical recurrence | s(t) = f(s(t - 1); theta)
- Unfolded for 3 steps | s(3) = f(f(f(s(0))))
- With an external input | s(t) = f(s(t - 1), x(t); theta)
- Hidden state | h(t) = f(h(t - 1), x(t); theta)

### Circuit and unfolded graph
- Left: one node with a loop and a delay of one step
- Right: the same computation written out in time
- f(s) = 0.5 s + 1 from s0 = 0 gives 0, 1, 1.5, 1.75

### Unrolling, step by step
- Start: one node with a loop
- Each step adds one more copy of f
- Four uses of f and no new parameters

### Why unfolding helps
- A fixed-size step: Each step takes one state and one input, whatever the length
- Any length: A longer sequence just adds more copies of the step
- The same function: One f, learned once, used at every time
- Clear gradients: The graph shows how an error flows backwards

### Parameter sharing across time
- A new weight set at each time step | One weight set, reused at every step
- Must see every position in training | Learns once, applies anywhere
- Cannot handle a length never seen | Handles any length
- Our task network, 12 steps: 1,476 weights | Our task network, any length: 123 weights

### Three design patterns
- Output every step: Recurrence between hidden units
- Output to hidden loop: Recurrence only from the output to the next hidden state
- One output at the end: Read the whole sequence, then answer

### The patterns, drawn
- Pattern 1: an output at every step, hidden loop
- Pattern 2: the output feeds the next hidden state
- Pattern 3: one summary output at the end

### Equations of the first pattern
- Pre-activation | a(t) = b + W h(t - 1) + U x(t)
- Hidden state | h(t) = tanh(a(t))
- Output | o(t) = c + V h(t)
- Prediction | y-hat(t) = softmax(o(t))

### A tiny network to compute by hand
- U | Input to hidden | [0.5, -0.4] and [0.3, 0.8]
- W | Hidden to hidden | [0.6, -0.2] and [0.4, 0.5]
- b | Hidden bias | [0.1, -0.1]
- V and c | Output layer | V = [0.7, -0.5], c = 0.05
- Inputs | Three time steps | [1, 0], [0, 1], [1, 1]

### The forward pass, three steps
- Step 1: h1 = [0.537, 0.197], output 0.327
- Step 2: h2 = [-0.017, 0.767], output -0.346
- Step 3: h3 = [0.036, 0.880], output -0.365

### Counting the parameters
- Input weights U: Hidden size times input size
- Recurrent weights W: Hidden size times hidden size
- Hidden bias b: One for each hidden unit
- Output V and c: Output size times hidden size, plus biases

### Three networks, counted
- Tiny network: 13 parameters
- Task network, 8 hidden units: 123
- Large network, 256 hidden units: 117,092

### The trained network at work
- The hidden state: 8 numbers that change every step
- Step 1 has no history: a coin flip
- From then on every prediction is right

### Teacher forcing
- Input is the true previous symbol | Input is the network's own last output
- Used while training | Used to generate new sequences
- Every step starts from a correct context | One early mistake changes every later input
- Pattern 2 can train all steps at once | Steps must run one after another

### Both modes on our network
- Teacher forced: 11 of 12 correct
- The one miss is the first step: no history
- Free run: a valid a, b, a, c cycle

### Back-propagation through time
- Forward pass: Run left to right and store every hidden state
- Loss: Add the loss of every time step
- Backward pass: Run right to left; gradients flow back through time
- Update: Each step adds to one shared gradient; then step

### The gradient travels back
- The loss is measured at step 8 only
- The gradient flows backwards, one step at a time
- Early steps get a much smaller gradient

### Learning the sequence
- Loss: 1.161 at step 1, 0.0017 at step 600
- Guessing would give 1.099 (the natural log of 3)
- Hand gradient against numerical gradient: error 4e-10

### Exam tips and important questions
- Unfolding: Draw the circuit and the unfolded graph; write s(3)
- Parameter sharing: Why one f at every step gives any length
- Three patterns: Sketch all three; know the equations of the first
- Parameter count: Name U, W, b, V, c; give the formula
- Training: Teacher forcing; back-propagation through time

### Summary and up next
- Unfolding turns a recurrence into a graph without loops
- The same function and parameters at every step
- Three patterns; the first has an output at every step
- Teacher forcing; back-propagation through time
- Next: bidirectional and encoder-decoder networks

### References
- I. Goodfellow, Y. Bengio, A. Courville, Deep Learning, MIT Press, 2016 (ch. 10)
- Explanations and examples in this video are original summaries
