### Recap: what you need from Parts One to Three
- Parse trees: Show how words group into phrases
- Probabilistic parsing: P C F G and reranking pick the best tree
- Multilingual parsing: Word order and morphology differ
- Dependency arcs: Link each word to its head

### Today in five steps
- Meaning forms: Logical forms, queries, frames
- Compositionality: Meaning from parts
- Lambda terms: Meanings as functions
- Syntax and meaning: One rule for each rule
- Interpretation: Truth, scope, other languages

### From a question to an answer
- Input: a question in English
- Output: a logical form a machine can run
- The database gives the answer

### Kinds of semantic representation
- Logical form | likes(ram, sita) | Checking facts, reasoning
- Database query | students whose city is Hyderabad | Question answering
- Frame or graph | who did what to whom | Role labeling, Unit IV

### The principle of compositionality
- Meanings of words: Stored in a lexicon
- Combine along the tree: Each grammar rule says how
- Meaning of the sentence: A formula at the root

### Lambda terms are functions
- A lambda term is a function waiting for input
- Apply: replace the variable by the input
- Functions can take functions as input

### Ram likes Sita: two beta steps
- Step 1: give likes its object, sita
- Step 2: give the result its subject, ram
- Result: likes(ram, sita)

### Meanings built up the tree
- Leaves: meanings from the lexicon
- VP: apply the verb to the object
- S: apply the VP to the subject

### Syntax rule, meaning rule
- S → NP VP: the sentence rule | apply the VP meaning to the NP meaning
- VP → V NP | apply the V meaning to the NP meaning
- NP → Name | the meaning of the name, a constant
- NP → Det N: determiner and noun | apply the Det meaning to the N meaning

### Every student sleeps
- every: a function taking two functions
- NP: apply every to student
- S: apply the NP to sleeps

### Checking sentences in a small world
- A model lists the facts of a tiny world
- For all: every student must pass
- There is: one example is enough

### Six sentences, six truth values
- Ram sleeps | sleeps(ram) | true
- Sita sleeps | sleeps(sita) | false
- Ram likes Sita | likes(ram, sita) | true
- Sita likes Ram | likes(sita, ram) | false
- Every student sleeps | all x: student(x) implies sleeps(x) | false
- Some student sleeps | some x: student(x) and sleeps(x) | true

### Two readings, two answers
- A world: ram admires rao, sita admires devi
- Reading 1: each student has some teacher
- Reading 2: one teacher for every student

### Every, then a, or a, then every
- For each student, pick a teacher | Pick one teacher, then test every student
- all x first, then some y | some y first, then all x
- Different teachers are allowed | The same teacher for everybody
- Evaluated by code: true | Evaluated by code: false

### One meaning, three languages
- English, Hindi and Telugu sentences
- One shared logical form
- Tense is left out in this tiny example

### Where compositionality bends
- Idioms: Kick the bucket is not about buckets
- Context: Who is she? Which day is tomorrow?
- Scope: One sentence, several logical forms

### Layers of meaning
- Word meaning: Each word has an entry in the lexicon
- Sentence meaning: Words combined along the parse tree
- Meaning in context: Who, when, where, and what is true

### Exam tips and important questions
- Semantic representation | Logical form, query, frame; one example each
- Compositionality | Meaning from parts and rules; limit: idioms
- Lambda calculus | Function, application, beta reduction; likes example
- Syntax-semantics interface | One meaning rule per grammar rule; scope

### Summary
- Representations: Logical form, query or frame
- Compositionality: Meaning built from parts
- Lambda terms: Functions and beta reduction
- Interface and scope: One meaning rule per rule

### References
- D. Bikel and I. Zitouni (eds.), Multilingual Natural Language Processing Applications, Pearson
- Reference book: D. Jurafsky and J. Martin, Speech and Language Processing
- Reference book: T. Siddiqui and U. Tiwary, Natural Language Processing and Information Retrieval
- Explanations, examples and numbers in this video are original
