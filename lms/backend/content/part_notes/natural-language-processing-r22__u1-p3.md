### Recap of Part Two
- Irregularity: 6 of 12 verbs broke the regular rule
- Ambiguity: One form, many readings
- Tokenization: Counts from 8 to 23 for one sentence
- Rich morphology: More endings, more rare types

### Today in five steps
- Dictionary lookup: List the forms
- Finite-state machines: Stems, then endings
- Two-level rules: Lexical form to spelling
- Features, functions: Unify features, or compute forms
- Stemmers, edit distance: Chop endings, compare words

### Dictionary lookup
- 24 entries for just 6 verbs | 6 stems and 4 endings: 10 entries
- One lookup answers the question | A few steps for each word
- Every form must be typed in | A new form of a known stem works
- Impossible for rich morphology | Stays small even for rich morphology

### A finite-state machine for verbs
- First a stem from the lexicon
- Then one ending from a small network
- Each path writes an analysis

### Reading walked, letter by letter
- Read letters; fewer stems stay possible
- The stem walk is complete: go to the endings
- The ending e d gives: walk +V +PAST

### What the machine says
- walked | walk +V +PAST
- played | play +V +PAST
- wants | want +V +3SG
- jumping | jump +V +PROG
- work | work +V +BASE
- happier | no analysis: stem not in the lexicon

### Two levels of a word
- Lexical level: the ideal form, fox+s
- Surface level: the real spelling, foxes
- Rules say how the two levels match

### Four spelling rules, computed
- e inserted before s | fox+s | foxes
- y becomes i | carry+ed | carried
- Final e dropped | make+ing | making
- Consonant doubled | stop+ed | stopped
- No change needed | play+ed | played

### Unification of feature structures
- Each piece carries a bundle of features
- Unification merges two bundles
- A clash means the pieces cannot join

### Unification: six checks
- walk (verb) | e d, past | verb, past
- dog (noun) | e d, past | fails
- dog (noun) | s, plural noun | noun, plural
- dog (noun) | s, verb form | fails
- walk (verb) | s, verb form | verb, present, singular, third
- walk (verb) | s, plural noun | fails

### Functional view: forms from a function
- singular | direct | ladka | beta
- singular | oblique | ladke | bete
- plural | direct | ladke | bete
- plural | oblique | ladkon | beton

### Stemmers: the Porter idea
- Plurals: sses to ss, ies to i, drop s
- ed and ing: Removed only if the stem has a vowel
- y to i: happy to happi
- Long suffixes: ational to ate, ness and ful go
- Tidy up: Final e and double l

### A Porter-style stemmer at work
- Each row is a rule that fired
- caresses to caress, ponies to poni, hopping to hop
- relational needs two rules to reach relat

### Stems need not be words
- caresses | caress | correct
- hopping | hop | double letter fixed
- relational | relat | not a word, but shared
- university | univers | joined with universe
- universe | univers | over-stemming
- playing | plai | not a word

### Edit distance: how far apart are two words?
- Insert, delete or replace a letter: cost one
- Each cell holds the cheapest cost so far
- unhappy to happier costs 5

### Edit distance as a lookup tool
- playd | play, played, plays | 1
- palying | playing | 2
- pustakaalo | pustakaalu | 1

### The models side by side
- Dictionary lookup | List every form | Huge, never complete
- Finite-state | Stems, then an ending network | Spelling changes
- Two-level rules | Lexical to surface rules | Rules need testing
- Unification | Features must agree | Features written by hand
- Stemmer | Chop endings by rules | Stems are not words

### Exam tips and important questions
- Morphological models | Dictionary, finite-state, two-level, unification, functional
- Finite-state morphology | Stem lexicon plus ending network; draw the machine
- Porter stemmer | Rule steps with conditions; over and under stemming
- Edit distance | Insert, delete, replace; show a table

### Summary
- Lookup and machines: Stems plus endings: 10 entries for 24 forms
- Rules and features: Two-level rules, and unification of features
- Functions, stemmers: A form is a function; stems are chopped
- Edit distance: unhappy to happier: 5 edits

### References
- D. Bikel and I. Zitouni (eds.), Multilingual Natural Language Processing Applications, Pearson
- Reference book: D. Jurafsky and J. Martin, Speech and Language Processing
- Reference book: T. Siddiqui and U. Tiwary, Natural Language Processing and Information Retrieval
- Explanations, examples and numbers in this video are original
