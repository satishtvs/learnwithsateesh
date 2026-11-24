### Where we left off
- Debugging tools: Overfit a tiny set, check gradients, view activations
- Finding the cause: Separate data, model and optimiser faults
- Multi-digit example: Metric, baseline, data and tuning for digit sequences

### Today in four steps
- Why scale: Bigger models and data need much more computation
- Fast hardware: CPU tricks, GPU computing, a measured test
- Many machines: Parallelism, compression, dynamic structure, chips
- Computer vision: Scaling pixels, contrast normalisation, augmentation

### Why scale matters
- 2.01 M: Weights in a plain network of three layers of 1000 units
- 6.03 M: Multiply-adds to train on one example, about 3 times a forward pass
- 1.7 h: One epoch of a million examples at one billion operations a second

### Fast CPU implementations
- Vector instructions: One instruction works on many numbers at once
- Cache friendly: Keep the data in cache; trips to memory are slow
- Fixed point: Integer arithmetic can beat floating point on some chips
- Many cores: Share the batch across the cores of the chip

### Matrix products run in parallel
- One worker: one dot product per tick
- Twelve lanes: twelve dot products per tick
- 36 products: 3 ticks instead of 36

### Measuring it: loops against numpy
- Three nested Python loops against one numpy call
- Size 100: about 20 ms against 21 microseconds
- Ratio grows with size: 538 to 2333 times

### CPU and GPU compared
- A few powerful cores | Thousands of simple cores
- Fast on one long task with many decisions | Fast on the same operation over much data
- Large caches hide memory delays | Very high memory bandwidth feeds the cores
- Reads ordinary memory directly | Data must be copied into its own memory

### Using a GPU well
- Copy once: Move the data to the card once, then train many steps there
- Big regular batches: Batch sizes that fill the cores, often a multiple of 32
- Avoid branches: Threads that take different branches wait for each other
- Lower precision: Half precision halves memory and speeds up arithmetic

### Data and model parallelism
- Data parallel: copies of the model, split batch
- Model parallel: split the model over devices
- Both need the devices to talk

### One step of data parallel training
- Split the batch: Each worker gets an equal share of the examples
- Local gradient: Each worker computes the gradient on its share
- Average: The gradients are averaged across all workers
- Same update: Every copy applies the same change, then repeat

### Speed-up and its price
- Computing per step falls as 100 ms divided by workers
- Communication stays near 8 to 16 ms
- 64 workers: 5.8 times faster, 91 percent waiting

### Asynchronous gradient descent
- Synchronous: everyone waits for the slowest
- Asynchronous: update without waiting
- Stale by 32 updates: loss 0.341 against 0.198

### Model compression
- Quantisation: Store each weight in fewer bits
- Pruning: Remove weights that barely matter
- Distillation: A small model learns to copy a large one
- Low-rank factors: Replace one big matrix by two thin ones

### Quantising a trained network
- Network: 1152 weights, 4 classes, 32 bits
- 8 down to 4 bits: accuracy stays near 92 percent
- 2 bits: accuracy collapses to 57.4 percent

### Bits, memory and accuracy
- 32 (full precision) | 4608 bytes | 92.5%
- 8 | 1152 bytes | 92.5%
- 4 | 576 bytes | 91.8%
- 2 | 288 bytes | 57.4%

### Dynamic structure
- Classifiers in a chain, cheap first | A small gater chooses which experts run
- Easy inputs leave at an early stage | Each expert specialises in a region of inputs
- Example: finding a rare object in an image | Gater and experts are trained together
- Saves time on average | Only a few experts run for each input

### Specialised hardware
- GPU: Thousands of simple cores, flexible, the common choice
- FPGA: A chip whose circuits are rewired, low power
- ASIC: A chip built for one job, such as matrix products
- Fewer bits: Lower precision gives more operations per second

### Preparing images
- Scale pixels: Bring values to a small range
- Fix the size: Crop or resize to one shape
- Normalise contrast: Remove lighting differences
- Augment: Create extra training images

### Scale the pixels first
- Raw pixel values run from 0 to 255
- Learning rate 0.5: raw loss 212, accuracy 57.5%
- Scaled to 0 to 1: loss 0.43, accuracy 93.2%

### Global contrast normalisation
- -0.81: Mean of the left half after global normalisation
- +0.81: Mean of the right half after global normalisation
- 1.00: Standard deviation of the whole image

### Local contrast normalisation
- Top: raw image and after global normalisation
- Bottom left: local mean, the lighting
- Bottom right: both halves now alike

### Sliding the window
- A 9 by 9 window with Gaussian weights
- Local mean and local standard deviation
- Pixel becomes (pixel minus mean) divided by std

### Dataset augmentation for images
- Shifts, small rotations, flips, brightness, noise
- Keep the label: only change what does not matter
- 15 images to 375: 37.3 to 55.5 percent

### Summary
- Scale matters: compute decides what we can try
- Matrix products parallelise: GPUs and many machines share them
- Communication limits speed-up; staleness limits asynchrony
- Fewer bits and dynamic structure make models cheap to run
- Vision: scale pixels, normalise contrast, augment

### References
- I. Goodfellow, Y. Bengio, A. Courville, Deep Learning, MIT Press, 2016 (ch. 12)
- Explanations and examples in this video are original summaries
