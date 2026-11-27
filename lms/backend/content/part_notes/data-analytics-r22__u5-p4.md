### Recap: icon-based techniques
- Icon idea: One small picture per record
- Chernoff faces: Face features carry the attributes
- Stick figures: Limbs plus position on the page
- Limits: Crowding, assignment, no exact values

### Today in four steps
- Hierarchy: Nested data drawn as a tree
- Tree maps: Nested rectangles sized by value
- Dendrograms: A tree built by merging clusters
- Worlds and cones: Plots inside plots, and 3D trees

### The retailer's hierarchy
- 3: Levels: all sales, category, subcategory
- 6: Categories, from Fashion to Books
- 21: Subcategories, for example Beverages
- 154.3: Lakh rupees of paid sales in the day

### The plain tree drawing
- Root, 6 categories, 21 subcategories
- Shows who belongs to whom, very clearly
- Does not show size: all nodes look alike

### The tree map idea
- One rectangle: The whole business fills the screen
- Split by category: Area proportional to revenue
- Split again: Each box divided into subcategories
- Add color: A second measure, such as average order

### Two ways to divide the screen
- Slice and dice: thin strips, worst shape ratio 19.1
- Squarified: mean ratio 1.6, worst 3.0
- Largest box: Beverages, 16.5 lakh

### Drilling down a tree map
- Start with all sales, then split by category
- Open one category after another
- Color: average order value, 1,262 to 1,540 rupees

### Tree map against node-link tree
- Uses the whole screen | Wastes space between nodes
- Shows size through area | Size is hard to show
- Nesting is less obvious | Nesting is very clear
- Handles thousands of leaves | Crowded beyond a few hundred

### A dendrogram: growing a tree by merging
- Start alone: Every record is its own cluster
- Find closest: The two nearest clusters
- Merge them: Draw a joint at that distance
- Update: Recompute distances to the new cluster

### Building the dendrogram step by step
- 12 customers, three from each segment
- The first 8 merges happen below distance 0.52
- Then merges at 1.44, 1.70 and 1.76

### Cutting the dendrogram
- A horizontal cut gives the clusters
- Cut at 0.98: four groups, exactly the segments
- Cut lower for more groups, higher for fewer

### Worlds within worlds
- The outer world: A plot of the first few attributes
- Pick a point: Its position fixes those attributes
- The inner world: A second plot of the other attributes
- Move the point: The inner plot updates at once

### Three inner worlds
- Outer: basket and discount; inner: orders and sessions
- Bargain point: 46 customers, Big spenders: 28
- Loyal point: 132 customers, two groups inside

### Moving the outer point
- The circle walks from bargain hunters to big spenders
- Customers inside: 46, 28, 21, 72, 132, 6, 0, 13, 28
- An empty circle means an empty inner world

### Cone trees
- A 3D tree: Children sit on a cone below the parent
- Spin the tree: Bring a branch forward
- Focus and context: Front is clear; the rest stays in view

### Our sales as a cone tree
- Layout: all sales on top, then 6 categories
- Dot size shows revenue
- Rotation brings one category to the front

### Rotating the cone tree
- The tree turns around its vertical axis
- The category at the front is labelled
- Revenue and subcategory names appear for it only

### When does a hierarchy help?
- Tree map | Sizes in a big hierarchy | Depth is hard to see
- Dendrogram | Cluster structure, cuts | Slow for huge data
- Worlds within worlds | Many attributes, nested | Needs interaction
- Cone tree | Large trees in focus | Branches can hide others

### Exam tips and important questions
- Hierarchical visualization | Nested data; four techniques with one example each
- Tree map | Nested rectangles, area = value, color = second measure
- Dendrogram | Merge nearest clusters; cut at a gap to get clusters
- Worlds within worlds, cone trees | Plot inside a plot; rotating 3D tree

### Summary
- Hierarchy: Nested data: levels and parts
- Rectangles: Nested boxes; area is the value
- Dendrogram: Merge nearest clusters; cut at a gap
- Worlds and cones: Inner plots; rotating 3D trees

### References
- J. Han, M. Kamber, J. Pei, Data Mining: Concepts and Techniques, 3rd ed., Morgan Kaufmann
- Student's Handbook for Associate Analytics, named in the syllabus
- Reference books: Tan, Steinbach and Kumar; Zaki and Meira; Leskovec, Rajaraman and Ullman
- Explanations, examples and numbers in this video are original
