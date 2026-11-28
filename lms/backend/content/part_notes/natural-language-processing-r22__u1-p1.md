### Recap: what you need from earlier courses
- Strings: Text is a sequence of characters
- Sets and counters: A set keeps one copy; a counter counts
- Dictionaries: Map a word to a number or to another word
- Unicode: Every script is a list of code points

### Today in five steps
- Tokens and types: Counting running words and different words
- Lemmas and stems: Grouping the forms of a word
- Morphemes: The smallest meaningful pieces
- Two kinds of change: Inflection and derivation
- Other languages: English, Hindi and Telugu

### A small corpus
- Four short English sentences
- A token is one running word
- We split at spaces and drop full stops

### Tokens and types
- 22: Tokens: every running word
- 15: Types: the different words
- 0.68: Type-token ratio: 15 divided by 22
- 3: Most frequent: the, played, football

### Counting while reading
- A new word adds a token and a type
- A repeat adds only a token
- At the end: 22 tokens, 15 types

### Forms, lemmas and stems
- children | child | children
- played | play | play
- plays | play | play
- playing | play | play
- makes | make | make
- happier | happy | happi

### A toy stemmer at work
- Rules: ier, ing, ed, s, longest first
- A stem keeps at least three letters
- 15 types in, 13 stems out

### Four ways to count
- 22 tokens, 15 types
- 12 lemmas, 13 stems
- Stems are fast, lemmas are exact

### What is inside a word
- A morpheme is the smallest meaningful piece
- unhappiness: un, happy, ness
- Morphology studies how words are built

### Roots and affixes
- Root: Carries the core meaning: play, book, happy
- Prefix: Attached before the root: un, re
- Suffix: Attached after the root: ness, ful, ed, s
- Infix, circumfix: Inside or around the root, in some languages

### Cutting words into morphemes
- unhappiness | un + happi + ness | 3
- players | play + er + s | 3
- replayed | re + play + ed | 3
- playfulness | play + ful + ness | 3
- children | child + ren | 2
- football | foot + ball | 2
- books | book + s | 2

### Inflection versus derivation
- Keeps the word class: play, plays | Often changes it: play, player
- Adds grammar: tense, number, person | Builds a new word with its own entry
- Works for almost every word of a class | Works for some words only
- The lemma stays the same | The lemma changes

### The family of play
- 3 inflected forms: plays, played, playing
- 4 derived words, with a new class or meaning
- Derivation can be chained

### Three languages, one small meaning
- English | in the books | 3 | 4
- Hindi | kitaabon mein | 2 | 3
- Telugu | pustakaalalo | 1 | 3

### How the scripts look
- English: separate words, spaces tell us
- Hindi: endings plus a small word
- Telugu: one word, many morphemes

### Agglutination: gluing endings on
- Step 1: pustakam, a book
- Step 2: pustakaalu, books
- Step 3: pustakaalalo, in the books

### Why this matters for NLP
- Vocabulary size: More endings give more types
- Sparse data: Each long form is seen rarely
- Stemming: Joins forms, but rules are language specific
- Tokenization: Spaces are not enough everywhere

### Exam tips and important questions
- Token versus type | Occurrence versus different word; give counts
- Stem versus lemma | Chopped letters versus dictionary form; example
- Define morpheme, affix | Smallest meaningful piece; prefix, suffix, infix
- Inflection versus derivation | Word class, new word, lemma; play, player

### Summary
- Tokens and types: 22 running words, 15 different words
- Lemma and stem: Dictionary form, or the chopped form
- Morphemes: Root plus affixes: un, happy, ness
- Inflection, derivation: Same word, or a new word; languages differ

### References
- D. Bikel and I. Zitouni (eds.), Multilingual Natural Language Processing Applications, Pearson
- Reference book: D. Jurafsky and J. Martin, Speech and Language Processing
- Reference book: T. Siddiqui and U. Tiwary, Natural Language Processing and Information Retrieval
- Explanations, examples and numbers in this video are original
