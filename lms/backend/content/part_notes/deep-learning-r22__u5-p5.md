### Where we left off
- Faster hardware: Graphics processors and fast CPUs speed up training
- Many machines: Distributed training shares the work
- Model compression: Make a trained network smaller and cheaper to run
- Vision preprocessing: Contrast normalisation and data augmentation

### Today in four steps
- Speech: From sound waves to text
- Language models: Counting words, then learning them
- Big outputs: A softmax over many words is costly
- Translation: Encoder, decoder and attention

### From sound to text
- Waveform: Air pressure measured thousands of times a second
- Frames: Short, overlapping slices of the signal
- Acoustic model: Scores which sound is in each frame
- Decoder: Joins sounds and a language model into words

### Cutting a signal into frames
- Sample rate | 8000 samples per second
- Frame length | 25 ms = 200 samples
- Hop between frames | 10 ms = 80 samples
- Frames in one second | 98
- Frequency bins per frame | 129, each 31.25 Hz wide

### A window slides over the signal
- Blue window: one frame of 25 ms
- Orange curve: the spectrum of that frame
- At half a second the peak jumps to 1000 Hz

### The spectrogram
- Each column is one frame, ninety eight in all
- Each row is one frequency bin
- Two bright bars: the two tones

### From mixtures to deep networks
- A Gaussian mixture scores each frame | A deep network scores each frame
- A hidden Markov model links frames in time | The same hidden Markov model first, then recurrent nets
- Hand designed features | Richer inputs, learned features
- Years of small gains | A sharp drop in the error rate

### Three kinds of acoustic model
- Convolutional: Filters slide over the spectrogram in time and frequency
- Recurrent: A state remembers earlier frames, often both directions
- End to end: Audio straight to letters or words, no separate sound model

### Counting words: a bigram model
- Four sentences, nine words and an end symbol
- P(next | previous) = pair count / count of previous
- After the: cat 3/7, dog 2/7, log 1/7, mat 1/7

### Scoring a sentence
- 1 | start, the | 0.750
- 2 | the, dog | 0.286
- 3 | dog, saw | 0.333
- 4 | saw, the | 1.000
- 5 | the, cat | 0.429
- 6 | cat, end | 0.333

### Reading a sentence, step by step
- Green boxes: words already read
- Orange numbers: the bigram probabilities
- Perplexity ends at 2.15

### Why counting fails for long contexts
- 100 million: Possible bigrams for ten thousand words
- 1 trillion: Possible trigrams for the same vocabulary
- 10 quadrillion: Possible four word sequences
- 0.1 percent: At most seen in a billion word text, for trigrams

### A neural language model
- Word ids: Each previous word is an integer id
- Embedding lookup: A table row gives a learned vector for each word
- Hidden layers: Combine the vectors of the previous words
- Output layer: One probability for every word of the vocabulary

### Similar words, similar vectors
- Hand made vectors: animal, thing, action
- cat and dog: 0.99; mat and rug: 1.00
- cat and mat: 0.17

### The cost of a huge output layer
- 100 million: Multiply-adds per word: 1000 hidden units, 100 thousand words
- 400 MB: Output weights, four bytes each
- 17: Binary choices to reach one word in a tree

### How much each trick saves
- Full softmax: 100,000,000 operations per word
- Short list of 10,000 words: 10 times cheaper
- Binary tree: 17,000 operations, 5,882 times cheaper

### Short lists
- Short list: The neural net handles only the commonest words
- The rest: Rare words go to an n-gram model
- The price: Rare words share less with their neighbours

### Hierarchical softmax
- Words are the leaves of a binary tree
- Each node makes one left or right choice
- P(mat) = 0.8 x 0.7 x 0.7 = 0.392

### Sampling instead of summing
- True word: Take the real next word as the positive
- Noise words: Draw a few random words from a simple model
- Score: Score only these few words, not the whole list
- Update: Raise the true word, push the noise words down

### Neural models plus n-grams
- Counts of word sequences | Embeddings and hidden layers
- Very fast lookup | Heavy matrix products
- Huge tables, grows with data | Parameters grow slowly
- Fails on unseen sequences | Generalises through similar words

### Neural machine translation
- Encoder: Reads the source sentence into vectors
- Decoder: Writes the translation one word at a time
- The bottleneck: One fixed vector forgets long sentences
- Attention: Look back at every source word at each step

### Attention by hand
- Score: query dot each source vector
- Weights: softmax of the scores
- Context: weighted sum of the sources

### The attention matrix
- Rows: output words; columns: source words
- Each row is a softmax and sums to one
- dort looks at sleeps: 0.69

### A short history
- Before 2010 | Mixtures with hidden Markov models | N-gram counts
- Around 2012 | Deep acoustic models | Neural models with embeddings
- Since 2014 | Recurrent and end to end | Attention and translation

### What to remember
- Speech: Frames, spectrogram, then a deep acoustic model
- Language model: Counts fail; embeddings share strength
- Big outputs: Short list, tree, or sampling
- Attention: A softmax over source words

### References
- I. Goodfellow, Y. Bengio, A. Courville, Deep Learning, MIT Press, 2016 (ch. 12)
- Explanations and examples in this video are original summaries
