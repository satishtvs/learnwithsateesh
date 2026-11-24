### Where we left off
- SGD: Step against the gradient of a small batch
- Momentum: Keep a running velocity of past gradients
- Nesterov: Measure the gradient at the looked ahead point
- Initialisation: Break symmetry with small random weights

### One rate for every parameter
- Loss bowl stretched in one direction
- SGD with rate 0.3 flips w2 every step
- Meanwhile w1 shrinks slowly

### Steep and shallow directions
- Gradient is large: 7.5 | Gradient is small: 0.8
- Step with rate 0.3: 2.25 | Step with rate 0.3: 0.24
- Overshoots the valley floor | Crawls towards the minimum
- Wants a small rate | Wants a large rate

### The idea: a rate for each parameter
- AdaGrad: Divide by the root of all past squared gradients
- RMSProp: Divide by a moving average of squared gradients
- Adam: RMSProp plus momentum and bias correction

### AdaGrad in four steps
- Gradient: Compute g on the mini batch
- Accumulate: r = r + g times g, for each parameter
- Scale: Step size is the rate times g over root r
- Update: Subtract the step from the parameters

### AdaGrad worked by hand
- 1 | 0.80, 7.50 | 0.64, 56.25 | 1.00, 1.00 | 3.00, 0.50
- 2 | 0.60, 2.50 | 1.00, 62.50 | 0.60, 0.32 | 2.40, 0.18
- 3 | 0.48, 0.92 | 1.23, 63.34 | 0.43, 0.12 | 1.97, 0.07

### Step sizes, parameter by parameter
- SGD: w2 step is 9 times w1 step at first
- AdaGrad starts both at the same size
- w2 settles quickly, w1 keeps moving

### Forgetting the distant past
- AdaGrad: every old gradient counts fully
- RMSProp: weight 0.1 times 0.9 to the k
- Memory of about 10 steps

### RMSProp in three layers
- Moving average: r = rho r + (1 minus rho) g times g
- Scaled step: Step is rate times g over root r
- Typical settings: rho 0.9, rate 0.001, small constant 1e-6

### RMSProp worked by hand
- 1 | 0.80, 7.50 | 0.064, 5.625 | 0.316, 0.316 | 3.68, 1.18
- 2 | 0.74, 5.92 | 0.112, 8.566 | 0.220, 0.202 | 3.46, 0.98
- 3 | 0.69, 4.91 | 0.149, 10.118 | 0.180, 0.154 | 3.28, 0.83

### RMSProp with Nesterov momentum
- Gradient at the current point | Gradient at the looked ahead point
- Subtract the scaled step directly | Add it into a velocity
- No memory of direction | Velocity carries the update
- Two hyperparameters | Three: rate, rho and momentum

### The effective rate over time
- Effective rate: rate over root of r
- AdaGrad w1: 1.25, then 0.76
- RMSProp w2 climbs back from 0.03

### Adam: four ingredients
- First moment: Moving average of the gradient, like momentum
- Second moment: Moving average of the squared gradient, like RMSProp
- Bias correction: Fixes both averages starting at zero
- Step: Corrected first moment over root of second

### The Adam algorithm
- Gradient: Compute g and count the step t
- First moment: m = beta1 m + (1 minus beta1) g
- Second moment: v = beta2 v + (1 minus beta2) g times g
- Correct: m hat = m over (1 minus beta1 to the t), same for v
- Update: Subtract rate times m hat over root of v hat

### Adam worked by hand
- Gradient g | 0.80, 7.50 | 0.74, 6.00
- First moment m | 0.080, 0.750 | 0.146, 1.275
- Second moment v | 0.00064, 0.05625 | 0.00119, 0.09219
- Corrected m hat | 0.800, 7.500 | 0.768, 6.711
- Corrected v hat | 0.640, 56.25 | 0.594, 46.12
- Step size | 0.300, 0.300 | 0.299, 0.296
- New (w1, w2) | 3.70, 1.20 | 3.40, 0.90

### Why the correction is needed
- Raw averages start near zero
- Corrected averages are right from step one
- The effect fades as t grows

### The race on one loss surface
- Five optimisers, same start (4, 1.5)
- Contours of the stretched bowl
- Legend shows the loss at each step

### Steps to reach a loss below 0.01
- 14: AdaGrad reaches a loss below 0.01 in 14 steps
- 42: SGD, RMSProp and Adam all first cross at step 42
- 51: Momentum needs 51 steps, since it overshoots

### See it run: a small neural network
- Eight tanh units fit a noisy sine
- SGD in red, Adam in blue
- Loss printed at every frame

### Five optimisers, one network
- Same weights, same data, 400 steps
- Adam ends lowest: 0.0154
- SGD ends highest: 0.0618

### Choosing an algorithm
- SGD with momentum | Well tuned, large vision models, best final accuracy | Rate, momentum 0.9, decay schedule
- AdaGrad | Convex or sparse problems, rare features | Rate only
- RMSProp | Recurrent nets, noisy and changing problems | Rate, rho 0.9
- Adam | A strong default when you have little time to tune | Rate 0.001, beta1 0.9, beta2 0.999

### Unit II at a glance
- 1 | Parameter norm penalties | L2 shrinks weights, L1 makes them sparse
- 2 | Augmentation, noise, early stopping | More data variety, stop before overfitting
- 3 | Sharing, sparsity, bagging, dropout | Dropout is cheap bagging of sub networks
- 4 | Adversarial training, tangent methods | Teach invariance to small changes
- 5 | Optimisation challenges | Ill conditioning, local minima, plateaus, cliffs
- 6 | SGD, momentum, initialisation | Velocity and symmetry breaking
- 7 | AdaGrad, RMSProp, Adam | A rate for each parameter

### Exam tips for Unit II
- Write the updates: SGD, momentum, AdaGrad, RMSProp, Adam in one line each
- Compare: AdaGrad sum against RMSProp average
- Explain Adam: Two moments and bias correction
- Regularisers: L1, L2, dropout, early stopping, augmentation
- Draw: A zigzag valley, a loss curve, a dropout net

### Summary and up next
- One rate cannot suit steep and shallow directions
- AdaGrad sum, RMSProp average, Adam moments
- Next: Unit III, convolutional networks

### References
- I. Goodfellow, Y. Bengio, A. Courville, Deep Learning, MIT Press, 2016 (ch. 8)
- Explanations and examples in this video are original summaries
