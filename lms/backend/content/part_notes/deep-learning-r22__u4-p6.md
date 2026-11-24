### Where we left off
- Leaky units: A unit that keeps most of its old value gives slow time scales
- Gated networks: Gates between 0 and 1 decide what to keep, write and show
- The LSTM cell: A cell state with input, forget and output gates

### Today's four circles
- Clipping gradients: Stop one huge step from ruining training
- Information flow: A penalty that keeps gradients at a steady size
- Better optimisation: Second order ideas and a good start
- Explicit memory: Slots to write to and read from

### Why long sequences are hard
- Weight 1.2: the gradient grows to 197.8 after 29 steps back
- Weight 1.0: it stays at exactly 1
- Weight 0.8: it shrinks to 0.0015

### Clip by value or clip by norm
- Cut each number into the range minus c to c | Shrink the whole vector if its length exceeds c
- Every component is treated on its own | All components get the same scale factor
- The direction can change | The direction is kept, only the length changes
- Very cheap | One extra length computation per step

### The geometry of clipping
- Raw gradient: 120,273 and 12,707, angle 6.0 degrees
- By value, threshold 5: both become 5, angle 45 degrees
- By norm, threshold 5: 4.97 and 0.53, angle still 6.0

### One exploding step, before and after
- Gradient, recurrent weight | 120,273 | 4.97
- Gradient, input weight | 12,707 | 0.53
- Length of the gradient | 120,942 | 5.00
- New recurrent weight | -1201.6 | 1.0503
- Loss after the step | 3.4e182 | 392.76

### Twelve steps on the loss map
- Star: the start, w 1.1 and u 0.5
- Red arrow: no clipping lands at w = -1201.6
- Orange and green: clipped paths into the valley

### Training for forty steps
- Clip by norm: loss 2983.55 down to 0.0547
- Clip by value: best 0.12, then bounces up to 2.26
- No clipping: loss overflows within 3 steps

### Practical notes on clipping
- Choose the threshold: Watch typical gradient sizes, then set it a little above
- Only for exploding: It cannot bring back a gradient that has vanished
- Cheap insurance: Most steps stay unchanged; only huge ones are cut

### Regularising for information flow
- The goal: Keep the gradient at a steady size as it flows back in time
- Measure the ratio: Gradient size at one step divided by its size one step later
- The penalty: The ratio minus one, squared, added up over all steps
- The effect: Recurrent weights are nudged towards a ratio of one

### The penalty at work
- The penalty is smallest at weight 1
- Weight 1.3 moves to 1.105, 1.013, 1.0005 at steps 10, 30, 60
- Gradient 29 steps back: 2015 before, about 1.02 after

### First order or second order
- Uses only the slope | Also uses the curvature of the loss
- Cheap: one gradient per step | Costly: a matrix of second derivatives
- Same step size, steep or flat | Small steps where steep, large where flat
- Zigzags in narrow ravines | Handles ravines much better

### Good initialisation helps too
- Start the recurrent matrix with a scale close to 1
- Raise the momentum value as training goes on
- No single trick is enough: combine them all

### Why a hidden state is not enough
- Hidden and cell state: only 256 numbers
- A memory of 128 slots by 20 numbers: 2,560
- Controller parameters: 82,432, unchanged by more slots

### Four limits of hidden state
- Size tied to weights: More state means a bigger weight matrix and more training
- Everything is mixed: Stored facts and ongoing work share the same numbers
- Copying is hard: Keeping a fact for long needs gates held shut
- No lookup: The network cannot ask for one stored fact

### A neural Turing machine
- Controller: A neural network that reads the input and decides
- Read head: Gives weights over slots, returns a weighted mix
- Memory: A matrix of many slots, each a list of numbers
- Write head: Erases part of slots, then adds new content
- Output: The answer for this step, using what was read

### One time step as a loop
- Read: Look up memory with the head's weights
- Think: The controller combines input and the read vector
- Write: Update slots with erase and add

### How a head chooses slots
- Content based: Slots whose content matches a key get large weights
- Location based: The head shifts to a neighbouring slot, like walking a tape
- Soft attention: Every slot gets a weight; the weights add up to one
- Why soft: Smooth weights let gradient descent learn where to look

### Content based addressing, computed
- Key: 0.9, 0.4, 0.0
- Cosine similarity: 0.91, 0.97, 0.41, 0.00, -0.82
- Weights, sharpness 5: 0.41, 0.55, 0.03, 0.00, 0.00

### The arithmetic, slot by slot
- Slot 1: 1.0, 0.0, 0.0 | 0.91 | 0.41
- Slot 2: 0.8, 0.6, 0.0 | 0.97 | 0.55
- Slot 3: 0.0, 1.0, 0.0 | 0.41 | 0.03
- Slot 4: 0.0, 0.0, 1.0 | 0.00 | 0.00
- Slot 5: -1.0, 0.0, 0.5 | -0.82 | 0.00

### Looking up memory, frame by frame
- Cosine similarity for every slot
- Softmax at sharpness 1, 5 and 20
- Read vector: 0.85, 0.36, 0.00

### Writing to memory
- Erase vector 1, 1, 0 and add vector 0, 0.5, 2
- Slot 1 becomes 0.59, 0.20, 0.82
- Slot 2 becomes 0.36, 0.54, 1.11

### Memory networks and neural Turing machines
- Stores facts, such as story sentences, in slots | Learns to write and to read at every step
- Answers by soft attention over the slots | Content and location based addressing
- The original form needs hints on which slot to read | Trained end to end by gradient descent

### Part 6 in three numbers
- 5: Clip threshold: a gradient of length 120,942 is cut to 5
- 1: The ratio of gradient sizes that the penalty aims for
- 0.55: Weight on the best slot in our addressing example

### Unit IV at a glance
- 1 | Unfolding, recurrent nets | Same weights at every step, back propagation through time
- 2 | Bidirectional, encoder decoder | Past and future context; sequence to sequence
- 3 | Deep and recursive nets | Depth in three places; the same weights over a tree
- 4 | Long dependencies, echo states | Repeated multiplication; a fixed reservoir
- 5 | Leaky units, gated nets | Slow time scales; gates; the LSTM cell
- 6 | Optimisation, explicit memory | Clipping, information flow, memory slots

### Exam strategy for Unit IV
- Draw and unfold: Sketch the unfolded graph with shared weights and time steps
- Long dependencies: Repeated multiplication: below 1 vanishes, above 1 explodes
- Compare the cures: Echo state, leaky, gated, clipping, memory: what each fixes
- Write equations: LSTM gates and cell update, with every symbol named
- Use a number: A small worked example shows understanding

### References
- I. Goodfellow, Y. Bengio, A. Courville, Deep Learning, MIT Press, 2016 (ch. 10)
- Explanations and examples in this video are original summaries
