### Where we left off
- Bidirectional network: One state reads left to right, another right to left
- Context on both sides: Each output sees the past and the future
- Encoder decoder: An encoder reads the input, a decoder writes the output
- The context vector: One vector must carry the whole input

### Unit IV in six parts
- Unfold and recurrent nets: Computational graphs; parameter sharing through time
- Both ways, encoder decoder: Reading both ways; sequence to sequence
- Deep and recursive nets: Today: depth, then tree-shaped computation
- Long-term dependencies: Why gradients vanish; echo state networks
- Gated networks: Leaky units, LSTM and gated cells
- Optimisation, memory: Clipping gradients; explicit memory

### Two kinds of depth
- Comes from unrolling: one step per element | Comes from stacking computations
- Already there: a long input is a long graph | We choose how many to add
- The same weights repeat at every step | Each layer can have its own weights
- Makes gradients travel far | Makes each step more expressive

### Three ways to add depth
- A deep hidden-to-hidden step
- Deep input and output layers
- Skip links across time

### Way one: a deep transition
- Ordinary step: New state = one layer applied to old state and input
- Deep step: New state = a small multi-layer network of the same inputs
- More expressive: One step can compute a richer function of the past
- The catch: Gradients now cross more layers per time step

### Way two: deep input and output
- Deep input: Several layers turn raw input into a useful code
- Hidden state: The recurrent memory stays one layer
- Deep output: Several layers turn the state into the answer

### Way three: skip connections
- An extra link jumps s steps ahead
- Step 0 to step 12: 12 edges without it
- With s = 4: only 3 edges

### Shortest path, computed
- 12: No skip: the ordinary chain from step 0 to step 12
- 6: Skip of 2: hops of two, six edges
- 4: Skip of 3: three hops of three, four edges
- 3: Skip of 4: only three edges

### Deeper steps against skips
- Each time step crosses several layers | Each time step still crosses several layers
- The path between time steps gets longer | A skip gives a short route across time
- Gradients shrink on a long route | Gradients can follow the short route
- Learning long spans is harder | Learning long spans is eased

### Stacked recurrent layers
- Layer 1 reads the input, each higher layer reads the layer below
- Every layer also passes its own state to the next time step
- The top layer feeds the output

### Counting the parameters
- 10 inputs, 32 hidden units per layer, 5 outputs
- One layer: 1,541; three layers: 5,701
- A deep transition adds 1,056 per extra step

### Where the numbers come from
- 1,376: Layer 1: 10 x 32 input weights, 32 x 32 recurrent, 32 biases
- 2,080: Each higher layer: 32 x 32 twice, plus 32 biases
- 165: Output layer: 32 x 5 weights plus 5 biases

### Recursive neural networks
- A tree, not a chain: Computation is shaped like a tree
- One shared rule: The same weights combine every pair
- Bottom up: Leaves first, the root last
- Shallower: Depth grows like log n, not n
- Structure needed: Someone must choose the tree

### Chain against tree
- Red chain: n - 1 compositions end to end
- Green tree: only log2 n from a leaf to the top
- For 64 elements: 63 against 6

### Depth, computed
- 4 | 3 | 2 | 1.5
- 16 | 15 | 4 | 3.8
- 64 | 63 | 6 | 10.5
- 256 | 255 | 8 | 31.9
- 1,024 | 1,023 | 10 | 102.3

### Depth against length
- Both axes use a log scale
- The chain climbs like a straight line of slope one
- At n = 1024 the tree is ten deep

### A tree composed by hand
- Four word vectors, two numbers each
- Parent = tanh of W times [left, right]
- The root is a vector for the whole sentence

### Watch the tree compose
- Step 1: combine the and cat
- Step 2: combine sat and down
- Step 3: combine the two phrases

### The same words as a chain
- Depth 2: the two pairs are built side by side | Depth 3: one word is added at a time
- Root vector: 0.45, 0.85 | Last state: 0.06, 0.94
- Meaning built phrase by phrase | Meaning built left to right
- One W used 3 times | One W used 3 times

### Who chooses the tree?
- Given: A parser or a human supplies the tree
- Balanced: Always pair neighbours: log n depth
- Learned: The model scores merges and picks

### Three structures, one sentence
- Chain: depth 5 for six words
- A given parse: depth 3
- Greedy learned merges: depth 4

### Exam tips and important questions
- Three ways to add depth: Deep transition, deep input and output, skip links
- Stacked layers: Each layer reads the layer below; count the weights
- Why skip links help: They give a shorter path across time
- Recursive network: Tree computation with shared weights
- Chain against tree depth: n - 1 against about log2 n

### Summary and up next
- Deep recurrent nets: Deep transition, deep input and output, or skip links
- Stacked layers: 5,701 weights for three layers of 32 units
- Recursive nets: Shared weights over a tree: depth log n
- Choosing the tree: Given, balanced or learned
- Up next: Part 4: long-term dependencies and echo state networks

### References
- I. Goodfellow, Y. Bengio, A. Courville, Deep Learning, MIT Press, 2016 (ch. 10)
- Explanations and examples in this video are original summaries
