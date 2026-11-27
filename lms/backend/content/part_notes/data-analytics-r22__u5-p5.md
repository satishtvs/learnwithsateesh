### Recap: hierarchical techniques
- Tree map: Nested rectangles, area is the value
- Dendrogram: Merge the nearest; cut at a gap
- Worlds within worlds: A plot inside a plot
- Cone tree: A 3D tree you can rotate

### Today in four steps
- Networks: Nodes and links, drawn two ways
- Text: Word counts and the tag cloud
- Dashboards: Several linked views on one screen
- The course: Course map, exam questions, study plan

### Products bought together
- 6,000: Simulated baskets of items
- 21: Nodes: the product subcategories
- 40: Edges: the most frequent pairs
- 8: Links of the biggest hub: Snacks

### A co-purchase network
- Strongest pair: Men and Footwear, 367 baskets
- 27 of 40 links stay inside a category
- Orange links cross categories: Kitchen to Beverages 194

### How a layout algorithm finds the picture
- Links pull nodes together, nodes push each other apart
- Crossings fall from 119 to 40 to 8
- The groups emerge without being told

### The same graph as a matrix
- Row and column per node; colored cell = a link
- Random order: no pattern visible
- Sorted by category: blocks on the diagonal

### Node-link against matrix
- Paths and neighbours easy to follow | Paths are hard to follow
- Small, sparse graphs read well | Dense graphs stay readable
- Crossing lines clutter big graphs | No crossing lines at all
- The layout can mislead | Depends on the row order

### Visualizing text: from words to counts
- Collect: Reviews, posts, feedback forms
- Clean: Lower case; drop filler words
- Count: How often each word appears
- Draw: Bars or a tag cloud

### Counting words in 1,500 reviews
- 28,500 words, 9,000 left after cleaning
- Delivery appears in 1,095 of 1,500 reviews
- Complaints are 32.0 percent of the opinion words

### The tag cloud
- Word size shows how often it appears
- Blue topics, green praise, red complaints
- 28 words that appear at least 25 times

### A tag cloud as the reviews arrive
- After 20 reviews: a few small words
- After 150: delivery 104, packaging 79
- After 1,500: delivery 1,095, a stable cloud

### Tag cloud against bar chart
- Quick feel for the main topics | Exact counts easy to read
- Long words look bigger than short ones | Same count, same length
- Close counts hard to compare | Close counts easy to compare
- Good for slides and posters | Best when the numbers matter

### The layers of a dashboard
- Key numbers: Tiles with the headline figures
- Trend view: How things change over time
- Breakdown view: Which parts make up the total
- Detail view: The individual records behind it

### The retailer's dashboard
- The day: 11,913 orders, 154.3 lakh rupees
- Orders peak in the evening hours
- Fashion leads in revenue: 40.9 lakh

### Brushing across the views
- Select six hours at a time, from midnight to 11 pm
- Orders: 1,155, 2,145, 3,660 and 4,953
- Revenue: 15.7, 27.2, 47.5 and 64.0 lakh

### Rules for a good dashboard
- One question: Built to answer one question
- Few views: Four to six, not twenty
- Linked views: A selection updates the others
- Same colors: One color, one meaning
- Honest scales: Bars start at zero

### The course map: five units
- I: Data management: Architecture, sources, quality, pipelines
- II: Analytics: Lifecycle, tools, modeling, imputation
- III: Regression: Least squares, logistic regression
- IV and V: Segments, trees, time series, visualization

### Frequently asked questions: a guide, not a forecast
- I | Draw a data architecture; handle missing values; warehouse versus lake
- II | Analytics lifecycle; types of analytics; data modeling techniques
- III | Least squares; Gauss-Markov assumptions; VIF; logistic regression
- IV | Decision tree by information gain; pruning; ARIMA; forecast accuracy
- V | Pixel displays, parallel coordinates, Chernoff faces, tree map

### Exam strategy
- Read the verb: Define, explain, compare, draw or derive
- Always sketch: A neat diagram earns marks in every unit
- Use an example: One running example makes answers concrete
- Show your steps: Formula, numbers, units, then a conclusion

### A four-week study plan
- Week 1: Units I and II: notes, then the quizzes
- Week 2: Unit III: redo the worked examples by hand
- Week 3: Unit IV: trees, k-means and ARIMA practice
- Week 4: Unit V and revision: sketch every technique

### Exam tips and important questions
- Network visualization | Nodes and links; node-link and matrix; layout
- Text and tag clouds | Clean, count, draw; size shows frequency
- Multi-view dashboards | Linked views, brushing, few views, one question
- Compare visualization techniques | Pixel, projection, icon, hierarchy, graph

### Summary of the unit and the course
- Networks: Nodes and links; layout or matrix
- Text: Clean, count, draw: bars or tag cloud
- Dashboards: Linked views for one question
- The course: Manage, analyze, model, segment, show

### References
- J. Han, M. Kamber, J. Pei, Data Mining: Concepts and Techniques, 3rd ed., Morgan Kaufmann
- Student's Handbook for Associate Analytics, named in the syllabus
- Reference books: Tan, Steinbach and Kumar; Zaki and Meira; Leskovec, Rajaraman and Ullman
- Explanations, examples and numbers in this video are original
