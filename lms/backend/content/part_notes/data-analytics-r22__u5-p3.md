### Recap: geometric projection
- Scatter plot: Attributes as axes, records as points
- Scatter matrix: Every pair of attributes, with brushing
- Parallel coordinates: One line per record
- Projection: Few directions that keep the most variance

### Today in four steps
- The icon idea: A record becomes a small picture
- Chernoff faces: Features of a face carry the attributes
- Stick figures: Limbs carry attributes, position carries two
- Strengths and limits: What works, and what breaks

### The icon idea
- One icon per record: Each record is drawn as its own small picture
- Parts are attributes: Every part of the icon shows one attribute
- Whole shape: We judge the overall look at a glance
- Compare icons: Similar records make similar icons
- Spot groups: Groups and outliers stand out

### Chernoff faces: how to build them
- Pick features: Face width, smile, eyes, brows, nose, mouth
- Assign attributes: Each feature shows one attribute
- Scale to 0 to 1: Smallest value 0, largest value 1
- Draw one face: One face for each record

### Six attributes, six features
- Width orders, smile tenure, eyes discount
- Brows returns, nose basket, mouth sessions
- A high value: wide, big, long, smiling or frowning brows

### Twelve customers as faces
- Three customers from each segment
- Loyal regulars: wide faces, gentle smiles
- Bargain hunters: big eyes, frowning, narrow

### One attribute at a time: the smile
- Tenure runs from 5 to 76 months
- Every other attribute stays at its average
- Frown at the start, broad smile at the end

### Stick figures: how they are built
- A fixed body: Head and trunk are the same for everyone
- Four limbs: Each limb angle shows one attribute
- Position on the page: Two more attributes give the x and y
- Texture: Groups form patterns of similar figures

### 48 customers as stick figures
- Position: tenure across, sessions up
- Arms: orders and basket; legs: discount and returns
- Each segment has its own posture and place

### A customer changes segment
- A bargain hunter becomes a loyal regular
- Orders from about 14 to 30, tenure 20 to 47
- Discount share falls from 69 to 25 percent

### 120 faces: can we see the groups?
- 30 customers from each segment
- Groups look alike inside, different between
- The picture is crowded and cannot be read exactly

### Faces against stick figures
- Faces are instantly familiar | Needs a little learning to read
- Many features: six or more | Four limbs plus two for position
- Placed in a grid or any order | Position itself carries data
- Feature choice changes the look | Limb angles are easy to compare

### Same data, different assignment
- Four segment averages, six features
- Top row and bottom row use different assignments
- Same numbers, a different first impression

### Cycling through six assignments
- Each step shifts every attribute by one feature
- Four segment averages, six assignments
- A face carries no fixed meaning

### Where icons fail
- Many records | Icons crowd the page | Sample or show averages
- Feature choice | Looks depend on assignment | Fix it, and test two
- Exact values | Shapes are judged roughly | Add a table
- Many attributes | Few features are available | Select the key ones

### When do icons help?
- A modest sample: Tens or hundreds of records, not millions
- Comparing groups: Do these groups look alike or different?
- Finding odd ones: One face that breaks the pattern

### Exam tips and important questions
- Icon-based techniques | Record as small picture; parts show attributes
- Chernoff faces | Features, assignment, scale 0 to 1, one face per record
- Stick figures | Fixed body, four limbs, two attributes for position
- Limitations of icons | Crowding, feature choice, exact values, few features

### Summary
- Icon idea: One small picture per record; compare by eye
- Chernoff faces: Face features carry the attributes
- Stick figures: Limb angles plus position on the page
- Limits: Crowding, assignment, no exact values

### References
- J. Han, M. Kamber, J. Pei, Data Mining: Concepts and Techniques, 3rd ed., Morgan Kaufmann
- Student's Handbook for Associate Analytics, named in the syllabus
- Reference books: Tan, Steinbach and Kumar; Zaki and Meira; Leskovec, Rajaraman and Ullman
- Explanations, examples and numbers in this video are original
