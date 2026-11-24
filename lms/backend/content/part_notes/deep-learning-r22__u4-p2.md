### Where we left off
- Unfolding: A loop in the graph becomes a chain through time
- Shared weights: The same weights are used at every step
- Three patterns: Output every step, output feedback, or one output
- Teacher forcing: Train with the true previous output

### Today in four steps
- Bidirectional layer: A forward and a backward chain, by hand
- Where it fits: Offline tasks yes, live prediction no
- Encoder-decoder: Any input length to any output length
- The bottleneck: One vector is not enough; so attention

### The past is not always enough
- The state at step t knows the past only | The state at step t knows past and future
- Right for predicting what comes next | Right when the whole input is available
- A word judged by earlier words only | A word judged by words on both sides
- One chain, left to right | Two chains, in opposite directions

### The bidirectional layer
- Forward chain h: start to end
- Backward chain g: end to start
- Output uses both states joined

### A bidirectional layer by hand
- 1 | +1.0 | +0.76 | +0.59
- 2 | -1.0 | -0.55 | -0.65
- 3 | +0.5 | +0.22 | +0.46

### Forward, backward, join
- Blue states fill left to right
- Orange states fill right to left
- Green outputs join both

### Reading the numbers
- 0.76: Forward h1: used x1 alone
- 0.59: Backward g1: used all three inputs
- -0.65: Backward g2: shaped by x2 and x3

### Computing the layer
- Forward pass: Run network one over x1 to xT, keep all states
- Backward pass: Run network two over xT to x1, keep all states
- Join: Put h and g side by side as one vector
- Output layer: Predict from the joined vector, per position

### Does the future help? A test
- Task: is the next digit larger than this one?
- Forward only: 75.0 percent, the best possible
- Bidirectional: 100.0 percent

### Where bidirectional layers are used
- Speech recognition: A sound is clearer once the next sounds are heard
- Handwriting: Each stroke is read with its neighbours on both sides
- Biological sequences: A label for every position of a protein or DNA string
- Text tagging: Parts of speech and names, from the full sentence

### Offline yes, online no
- Recorded audio, a scanned page, a full sentence | Live speech, a sensor stream, text typed now
- The backward chain can start at the end | The end does not exist yet
- Use a bidirectional layer | Use a forward only layer
- About twice the computation | One chain; an answer after every step

### Input and output of different lengths
- Translation: Five words in, seven words out
- Summarising: A page in, a few lines out
- Question answering: A question in, an answer of any length
- Speech to text: Many sound frames in, fewer words out
- Dialogue: A message in, a reply out

### The encoder-decoder architecture
- Encoder reads the input into a vector C
- Decoder starts from C and writes
- END tells the decoder to stop

### Four details of the decoder
- Start symbol: A special start token is read at the first step
- Feeding back: At test time each written symbol is the next input
- END symbol: Writing END stops the loop, so length is free
- Teacher forcing: In training, feed the true previous symbol

### Toy task: write it backwards
- Input: four random letters from a, b, c, d
- Target: the letters reversed, then END
- Trained model: 6 of 6 correct here

### An encoder-decoder by hand
- Encoder: h = tanh(W h + input), two units
- Context C is the last encoder state
- Decoder: s = tanh(V s + E last output)

### The trained model at work
- Blue rows: the encoder reads
- Orange row: the context C
- Green rows: the decoder writes

### How fast it learned
- Loss from about 10.5 to under 0.001
- 99 percent exact match after 50 steps
- 32 hidden units, 2500 steps

### When the sequence grows
- Short sequences: both contexts fine
- Context of 8 falls from length 6 to 8
- Context of 32 holds longer

### Why one vector is a bottleneck
- One size for all: A short and a long input get the same size vector
- Fading memory: Early symbols are overwritten by later steps
- Long gradient path: The learning signal crosses every step back

### The idea behind attention
- Keep all states: Do not throw away the encoder states h1 to hT
- Score: At each output step, rate which input matters
- Mix: Give the decoder a weighted mix as its context

### The two ideas compared
- Lengths | Same: one output per step | Any: END decides
- What it reads | Input in both directions | All input, then writes
- Needs the end | Yes: offline only | Yes: reads all first
- Weak point | No live prediction | One-vector bottleneck
- Cost | Two chains | Two networks

### What to remember
- Bidirectional: Forward and backward chains, joined at each step
- Encoder: Reads the input into the context C
- Decoder: Writes the output from C until END
- The limit: A fixed C is a bottleneck; attention helps

### Summary
- Bidirectional: forward and backward chains, joined at each step
- Needs the whole input: offline tasks, not live prediction
- Encoder-decoder: context C in, an output of any length out
- One fixed vector limits long inputs; attention is the fix
- Next: deep recurrent networks and recursive networks

### References
- I. Goodfellow, Y. Bengio, A. Courville, Deep Learning, MIT Press, 2016 (ch. 10)
- Explanations and examples in this video are original summaries
