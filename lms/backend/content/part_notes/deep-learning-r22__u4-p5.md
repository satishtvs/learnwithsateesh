### Where we left off
- Long gaps: A fact at step 1 must still matter at step 100
- Vanishing: A factor below one, repeated, shrinks to almost zero
- Exploding: A factor above one, repeated, blows up
- Echo state: Fixed recurrent weights near the edge of stability

### Today in five steps
- Several time scales: Skip connections, leaky units, removed links
- The idea of a gate: A number between zero and one that controls flow
- The LSTM: Cell state with three gates, worked by hand
- The GRU: A lighter cell with two gates
- Choosing: Why gates help, and which one to use

### Three ways to reach across time
- Skip connections: A link that jumps several steps at once
- Leaky units: A unit that blends its old value with the new input
- Removed connections: Drop the one step links; keep longer ones

### Skip connections through time
- Plain chain: 12 hops across 12 steps
- A jump of 4: only 3 hops across 12 steps
- 100 steps at 0.9 per hop: 0.00003 against 0.12

### The leaky unit
- Update | mu(t) = alpha mu(t - 1) + (1 - alpha) v(t)
- Small alpha | Forgets quickly; follows the input closely
- Alpha near 1 | Forgets slowly; keeps a long memory
- Input k steps ago | Weight (1 - alpha) times alpha to the power k
- Alpha as a parameter | Fixed by hand, or learned

### A pulse through leaky units
- Same input for all three: 1 for five steps, then 0
- Alpha 0.5 follows the input, then forgets at once
- Alpha 0.99 never gets far, but never lets go

### How long does a leaky unit remember?
- Half-life = log of one half over log alpha
- Time constant = one over minus log alpha
- Alpha near one: memory grows very quickly

### What is left after 20 steps?
- 0.0000010: Alpha 0.5: less than one in a million is left
- 0.1216: Alpha 0.9: about one eighth of the input is left
- 0.8179: Alpha 0.99: more than four fifths is left

### Removing connections
- Fast group updates every step: 12 updates
- Medium group updates every 2 steps: 6 updates
- Slow group updates every 4 steps: 3 updates

### The idea of gating
- Leaky units are fixed: The same alpha at every step, whatever the input
- A gate is a decision: A number between zero and one for each unit
- It depends on the input: Computed from the current input and the previous state
- It is learned: The network chooses when to keep, write and read

### The LSTM at a glance
- Cell state: A protected memory line, updated by addition
- Forget gate: How much of the old cell to keep
- Input gate: How much of the new candidate to write
- Output gate: How much of the cell to show as output
- Hidden state: What the rest of the network sees

### One LSTM step
- Input 1.0, old h 0.5, old cell 2.0
- Cell: 0.846 x 2 + 0.657 x 0.848 = 2.248
- New h = 0.668 x tanh(2.248) = 0.653

### The LSTM equations, in words
- Forget gate f | sigmoid of (W_f x + U_f h + b_f)
- Input gate i | sigmoid of (W_i x + U_i h + b_i)
- Candidate g | tanh of (W_g x + U_g h + b_g)
- New cell c | f times old c, plus i times g
- Output gate o | sigmoid of (W_o x + U_o h + b_o)
- New hidden h | o times tanh of c

### Reading the worked step
- 1.691: Kept from the old cell: 0.846 times 2.0
- 0.557: Written from the candidate: 0.657 times 0.848
- 0.653: Shown as the new hidden value

### A memory that holds for 17 steps
- Step 3: input gate opens, forget gate closes, value stored
- Steps 4 to 19: forget gate 0.998, cell 0.944 to 0.908
- Step 20: output gate opens, h = 0.717

### Parameters in an LSTM layer
- One block: n x (n + d) + n parameters
- 128 inputs, 256 units: plain RNN 98,560
- LSTM 394,240: exactly 4 times, GRU 295,680

### The GRU
- Update gate u: How much of the old state to keep
- Reset gate r: How much of the old state the candidate may see
- Candidate: A new proposal from the input and the reset state
- Blend: New state = u times old, plus (1 - u) times candidate

### One GRU step
- Input 1.0 and old h 0.5, as in the LSTM step
- Update 0.668, reset 0.599, candidate 0.845
- New h = 0.668 x 0.5 + 0.332 x 0.845 = 0.6146

### Reading the GRU step
- 0.668: Update gate: two thirds of the old state is kept
- 0.845: Candidate proposed from the reset state
- 0.6146: New state: between the old 0.5 and the candidate

### Does the gradient survive?
- Random weights, same input, 40 steps, true Jacobians
- Plain RNN: 0.005 after 10 steps, 1.3e-10 after 40
- LSTM forget bias 3: 0.86 after 40; forget bias 0: 7.9e-08

### Why gates help the gradient
- Additive update: New cell = f times old + something, not a matrix power
- Forget gate near one: The factor on the memory path stays close to one
- Gates are learned: Training sets the factor per unit and per step
- Input is protected: A closed input gate blocks noise from the cell

### LSTM or GRU?
- Separate cell state and hidden state | A single state
- Three gates: forget, input, output | Two gates: update and reset
- Four blocks of parameters: 394,240 | Three blocks of parameters: 295,680
- Slower, a little more expressive | Faster, often as good

### When to prefer which
- Plain RNN: Short dependencies, tiny budget, a quick baseline
- LSTM: Long gaps, a lot of data, the standard first choice
- GRU: Less data or time; fewer parameters, similar accuracy
- Leaky or skip: A cheap boost when you know the time scale

### Exam tips and important questions
- Leaky unit: Write the update rule and explain alpha and the half life
- LSTM: Draw the cell; write the six equations; name the three gates
- Parameter count: 4 n (n + d + 1) for an LSTM, 3 for a GRU, 1 for a plain RNN
- GRU: Update and reset gates; one blended state
- Why it works: The additive cell path and a forget gate near one

### Summary and up next
- Time scales: Skip links, leaky units and removed links give short paths
- Leaky unit: Alpha 0.99 keeps 82 percent after 20 steps; alpha 0.5 almost nothing
- LSTM: A protected cell, three gates, 394,240 parameters in our layer
- GRU: Two gates, 295,680 parameters, a single state
- Up next: Part 6: optimisation for long-term dependencies and memory

### References
- I. Goodfellow, Y. Bengio, A. Courville, Deep Learning, MIT Press, 2016 (ch. 10, sections 10.9 and 10.10)
- Explanations and examples in this video are original summaries
