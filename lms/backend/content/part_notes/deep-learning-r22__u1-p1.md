### The course in five units
- Unit I: basics: Machine learning basics and feedforward networks
- Unit II: regularisation: Regularisation and optimisation of deep models
- Unit III: convolution: Convolutional networks for images
- Unit IV: recurrence: Recurrent and recursive nets for sequences
- Unit V: practice: Practical methodology and applications

### Writing rules or learning from data
- A person writes every rule by hand | The program finds the rules from examples
- Breaks when the world changes | Retrained when new data arrives
- Hard for pictures, speech, language | Works where rules are too many to write
- Behaviour is fixed at write time | Performance improves with experience

### Learning: task, performance, experience
- Task T | The job the program must do | Predict marks from hours studied
- Performance P | A number that says how well it does the job | Error on examples not used for learning
- Experience E | The data the program learns from | Six students: hours and marks

### Common kinds of tasks
- Classification: Choose one of k categories, such as spam or not spam
- Regression: Predict a number, such as a price or a mark
- Transcription: Turn unstructured data, such as speech, into text
- Machine translation: Convert a sequence of symbols into another language
- Anomaly detection: Flag the unusual, such as a fraud transaction
- Denoising: Recover a clean example from a corrupted one

### Classification and regression
- Classification: the model draws a boundary
- Regression: the model draws a curve or line
- The difference is the type of answer

### Supervised and unsupervised experience
- Supervised: every example comes with a label
- Unsupervised: only the points, no labels
- Supervised learns the answer, unsupervised finds structure

### The design matrix
- m examples are the rows of X
- n features are the columns of X
- y holds one target per example

### Linear regression and its cost
- Model: y hat = w x + b
- Matrix form: y hat = X w
- Cost: mean of squared errors

### Two ways to find the best line
- One formula gives the answer | Many small steps reach the answer
- w = (X^T X)^-1 X^T y | w = w - learning rate x gradient
- Slow when there are very many features | Works for any differentiable model
- Exists only for linear regression | The method used for deep networks

### Gradient descent, step by step
- Update: w = w - 0.02 x gradient
- Start w = 0, b = 0: cost 22.96
- Step 1: w = 0.742, b = 0.18, cost 3.13

### The learning rate matters
- 0.002: safe but slow
- 0.02: falls fast, then settles
- 0.12: cost explodes

### Why the last steps are slow
- Each ring is one cost value
- Big jump first, then a slow crawl
- Gradient descent and the formula agree

### The recipe for any learning algorithm
- Dataset: The experience: examples X and targets y
- Model: A formula with parameters, such as w x + b
- Cost function: A number that measures how wrong the model is
- Optimisation: A procedure that lowers the cost

### Exam tips and important questions
- Definition: State the T, P, E definition of learning with an example
- Supervised or not: Compare supervised and unsupervised learning
- Derivation: Derive the normal equation for linear regression
- Gradient descent: Write the update rule; effect of the learning rate
- Recipe: List the four parts of an algorithm

### Summary and up next
- Learning improves performance P on task T with experience E
- Linear regression: cost is the mean squared error
- Best line: y = 0.96 x + 1.14, by either method
- Next: capacity, overfitting and underfitting

### References
- I. Goodfellow, Y. Bengio, A. Courville, Deep Learning, MIT Press, 2016 (ch. 5)
- Explanations and examples in this video are original summaries
