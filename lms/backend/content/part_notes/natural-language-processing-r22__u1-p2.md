### Recap of Part One
- Tokens and types: 22 running words, 15 different words
- Lemma and stem: Dictionary form, or the chopped form
- Morphemes: Root plus affixes: un, happy, ness
- Inflection, derivation: Same word, or a new word

### Today in five steps
- Irregularity: Forms that break the rule
- Ambiguity: One form, many readings
- Productivity: New words from old rules
- Tokenization: Where does a word end?
- Rich morphology: Many endings, many types

### Irregularity: when the rule fails
- A regular rule: past tense is the verb plus e d
- It is right for 6 of the 12 verbs
- The other 6 must be stored in a list

### Irregular plurals too
- child | childs | children
- foot | foots | feet
- mouse | mouses | mice
- man | mans | men

### Ambiguity: one form, many readings
- flies | plural noun, or the verb fly | 2
- saw | noun, verb, or past of see | 3
- leaves | plural of leaf, or the verb leave | 2
- painting | noun, or paint plus i n g | 2
- bark | noun, or verb | 2
- books | plural noun, or the verb book | 2

### Ambiguity inside a word
- unlockable has three pieces: un, lock, able
- The pieces can join in 2 ways
- Each way gives a different meaning

### Productivity: new words, old rules
- Speakers apply rules to words they never saw
- Some affixes work almost everywhere
- Others work for a few roots only

### Productivity in numbers
- 24: Combinations of 6 roots and 4 affixes
- 18: Real words among the 24 tries
- 12 of 12: For ness and ly: almost fully productive
- 6 of 12: For un and e n: limited

### Tokenization: where does a word end?
- Contractions: can't, isn't, Rao's: one or two?
- Hyphens: e-mail, well-known: one word?
- Numbers, dates: 1,250.50 and 10/12/2026 stay whole
- Abbreviations: Dr. and Rs. keep their dot
- Addresses: Web and e-mail addresses are one token

### One sentence, three tokenizers
- Spaces only: 9 tokens, punctuation stuck to words
- Every symbol: 23 tokens, words torn apart
- Rule based: 12 tokens, a sensible compromise

### Token counts on four sentences
- can't, Dr., e-mail | 9 | 23 | 12
- Rs., decimals | 9 | 18 | 11
- Web address, date | 8 | 21 | 9
- It's, isn't, well-known | 9 | 16 | 12

### No spaces: maximum matching
- Some scripts have no spaces between words
- Maximum matching: longest listed word from the left
- It cuts string 1 well and string 2 wrongly

### Rich morphology: why it is hard
- A root has few forms: play, plays, played, playing | For illustration: 120 forms for one root
- Spaces mark most words | One long word can hold a whole phrase
- Few changes where pieces meet | Sounds and spellings change at each join
- Types repeat often | Most types are rare

### Counting types as endings grow
- 4 forms per root: 958 types after 6000 tokens
- 120 forms per root: 3787 types
- Many of those types are seen only once

### Challenges and what helps
- Irregularity | Exceptions to rules | A list of exceptions
- Ambiguity | One form, many readings | Context and probabilities
- Productivity | New words from rules | Rules, not only lists
- Tokenization | Symbols, no spaces | Rules plus a word list
- Rich morphology | Many forms per root | A model of morphology

### Exam tips and important questions
- Issues in finding word structure | Irregularity, ambiguity, productivity; one example each
- Ambiguity in morphology | flies, saw; unlockable has two structures
- Tokenization problems | Contractions, hyphens, numbers, abbreviations, no spaces
- Why is Telugu harder than English | Many endings per root, more types, sparse data

### Summary
- Irregularity: 6 of 12 verbs break the rule; keep a list
- Ambiguity: One form, many readings; context decides
- Tokenization: Counts range from 8 to 23 for one sentence
- Rich morphology: More endings, more rare types

### References
- D. Bikel and I. Zitouni (eds.), Multilingual Natural Language Processing Applications, Pearson
- Reference book: D. Jurafsky and J. Martin, Speech and Language Processing
- Reference book: T. Siddiqui and U. Tiwary, Natural Language Processing and Information Retrieval
- Explanations, examples and numbers in this video are original
