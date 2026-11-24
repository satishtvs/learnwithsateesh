### Where we left off
- Adversarial training: Train on tiny nudges that fool the model
- Tangent distance: A distance that ignores small transformations
- Tangent propagation: A penalty for changing along known directions
- Manifold tangent classifier: Learn those directions with an autoencoder

### Today's three questions
- Learning versus optimisation: How training differs from pure optimisation
- Minibatches: Why we update on small groups of examples
- The challenges: What makes the cost surface hard to descend

### Pure optimisation versus learning
- The cost is the goal itself | The cost is a stand-in for a goal we cannot measure
- Reach the lowest value you can | Do well on new data
- Needs only the cost function | Cost on training data, score on test data
- Stop when the minimum is found | Often stop early, before the minimum

### Empirical risk minimisation
- The risk we want: Average loss over the true data distribution
- What we can reach: Only a training set drawn from it
- Empirical risk: Average loss over the training examples
- Minimise that: Use empirical risk as the stand-in, and hope

### Surrogate loss functions
- Zero-one loss: flat, so the slope is zero
- Logistic and hinge losses: smooth stand-ins
- Minimise the surrogate, then report the real error

### Early stopping: a different finish
- Training loss keeps falling
- Validation loss bottoms out at epoch 70
- Stop there, not at the minimum

### Batch, minibatch and stochastic
- Batch | All of them | Exact gradient, slow updates
- Stochastic (online) | One example | Very noisy, very fast
- Minibatch | A small group, such as 32 | Best compromise

### Why small batches work
- Error shrinks like one over the square root of the batch
- Batch 1: 13.89, batch 1024: 0.41
- A thousand times the work, 34 times less error

### One epoch of minibatch training
- Shuffle: Put the examples in random order
- Take a minibatch: Pick the next small group
- Compute the gradient: Average over only that group
- Update: Step downhill a little

### What makes optimisation hard
- Ill-conditioning: Steep in one direction, flat in another
- Local minima: Valleys that are not the lowest
- Plateaus and saddles: Flat places with zero slope
- Cliffs: Sudden steep walls, exploding gradients
- Long dependencies: Gradients that vanish or explode over time
- Inexact gradients: Noisy or approximate slopes

### Ill-conditioning: the condition number
- Condition number: steepest curvature over flattest
- Condition 10 needs 39 steps
- Condition 1000 needs 5008 steps

### See it run: the zig-zag
- Condition number 100
- Steps bounce across the steep walls
- Cost 50.5 at the start, 10.2 after forty steps

### Local minima
- Slope zero in both valleys
- Start A ends at the local minimum, cost 1.25
- Start B ends at the global minimum, minus 0.42

### Why many minima are equally good
- 120: Ways to reorder five hidden units
- 32: Ways to flip signs of five tanh units
- 3840: Equivalent copies of one minimum

### Saddle points beat local minima
- Random curvature in n directions
- One parameter: 49.6 percent look like minima
- Five parameters: 0.02 percent

### See it run: the saddle
- Cost: parameter one squared minus parameter two squared
- Exactly on the axis: stuck at the saddle
- 0.001 off the axis: escapes along the downhill side

### Local minimum or saddle point
- Slope is zero | Slope is zero too
- All curvatures are positive | Some positive, some negative
- Every direction goes up | At least one direction goes down
- Descent gets stuck for good | Descent slows, then escapes

### Cliffs and exploding gradients
- Gentle floor, steep wall on the right
- Plain step: gradient 18.46 flings the parameter to minus 6.93
- Clipped step: stays near the wall

### Gradient norm clipping
- Compute: Find the gradient g for this minibatch
- Check: Is its length above the threshold?
- Rescale: Shrink it to the threshold, keep its direction
- Update: Take the usual step with the clipped gradient

### Long-term dependencies
- Same weight multiplied at every step
- Weight 0.9: after 50 steps, 0.0052
- Weight 1.1: after 50 steps, 117.4

### Inexact gradients
- Minibatch noise: A sample estimate of the true gradient
- Intractable objective: The exact gradient is too costly, so we approximate
- Surrogate loss: We follow the slope of a different cost

### Local and global structure
- Slope points downhill, not at the minimum
- Three of five starts reach the global minimum
- Two get stuck: cost 0.873 against 0.008

### What theory says
- Training some small networks is hard in the worst case
- No guarantee that a good minimum is reached
- Theory often assumes things networks do not satisfy
- Practice: find a cost low enough, not the lowest

### Exam tips and important questions
- Compare: Learning versus pure optimisation
- Define: Empirical risk, surrogate loss, minibatch
- Explain: Ill-conditioning with the condition number
- Distinguish: Local minimum, saddle point, plateau
- Describe: Cliffs and gradient clipping

### Summary and up next
- Learning minimises a stand-in, and may stop early
- Minibatches: cheap, noisy, good enough
- Challenges: ill-conditioning, saddles, cliffs, vanishing gradients
- Next: SGD, momentum and initialisation

### References
- I. Goodfellow, Y. Bengio, A. Courville, Deep Learning, MIT Press, 2016 (ch. 8)
- Explanations and examples in this video are original summaries
