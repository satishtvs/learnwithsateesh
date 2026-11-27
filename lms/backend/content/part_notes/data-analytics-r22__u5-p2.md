### Recap: pixel-oriented techniques
- Encoding: Position and length beat area and color
- Pixel display: One pixel per value, one window per attribute
- Arrangement: A Hilbert curve keeps neighbours together
- Two layouts: Recursive pattern and circle segments

### Today in four steps
- Scatter plots: Two or three attributes as axes
- Scatter matrix: Every pair of attributes at once
- Parallel coordinates: Each record becomes a line
- Projection: Squeeze many attributes into two

### The idea of geometric projection
- Attributes: Each one is a direction in space
- Points: Each record is a point at its values
- Flat screen: The screen can only show two directions
- Lines: Straight lines, clusters and outliers
- The risk: Projection may hide structure

### A scatter plot of 600 customers
- Basket against discount share, one dot per customer
- Correlation is minus 0.63
- Four groups are visible by color

### Adding a third attribute: a rotating view
- Basket, discount share and tenure
- Rotation shows the groups from every side
- Still only a shadow on a flat screen

### More attributes without more axes
- Third number | Third axis or point size | Tenure as dot size
- Category | Color hue | Segment as color
- Second category | Marker shape | Region as shape
- Time | Animation or a trail | Month by month

### The scatter-plot matrix
- Six attributes: 36 panels, 15 different pairs
- Strongest: orders and sessions, r 0.85
- Strongest opposite: basket and discount, r minus 0.63

### Brushing: select in one panel, see it in all
- One segment is highlighted, the rest are grey
- The same customers light up in every panel
- Bargain hunters: discount high, basket low

### What to look for in a matrix
- Linear trend: Dots near a line: the attributes are related
- Clusters: Separate clouds: groups of similar records
- Outliers: Lone dots far from the rest: check them

### Parallel coordinates: how it is built
- Draw the axes: One vertical axis per attribute
- Scale them: Smallest value at the bottom, largest on top
- Plot a record: A line joining its value on every axis
- Read the lines: Bundles are groups; crossings are opposites

### 600 customers as 600 lines
- Thin lines: customers; thick lines: segment averages
- Big spenders: basket 0.73, discount 0.04
- Bargain hunters: discount 0.67, returns 0.63

### Crossing lines and parallel lines
- Orders and sessions, r 0.85: lines run parallel
- Basket and discount, r minus 0.63: lines cross
- Only neighbouring axes can be compared

### Scatter matrix against parallel coordinates
- Every pair of attributes visible | Only neighbouring pairs easy to read
- Panels grow as the square of attributes | One picture, grows slowly with attributes
- Shows clusters and outliers well | Shows whole profiles of records
- Dots overlap when data is large | Lines clutter when data is large

### The trouble with many dimensions
- 600 random points and one random query point
- Farthest minus nearest, relative to nearest
- Near and far look alike in 200 dimensions

### Projecting six attributes onto two
- Each new axis is a mix of the attributes
- First two directions keep 79.4 percent of variance
- Four groups separate clearly

### Sweeping the projection direction
- Project basket and discount onto a turning line
- Variance is 1.00 on either axis alone
- Best direction 135 degrees: variance 1.63

### Other ways to project
- Pick two attributes | Plain scatter plot | Questions about one pair
- Principal components | Directions of largest variance | Overall spread
- Projection pursuit | Search for interesting views | Hidden clusters
- t-SNE | Keep close points close | Local groups

### Exam tips and important questions
- Geometric projection techniques | Idea, scatter plot, matrix, parallel coordinates
- Scatter-plot matrix | Pairs of attributes, brushing, trend, clusters, outliers
- Parallel coordinates | Axes, line per record, crossing means opposite
- Why project high-dimensional data? | Screen has two dimensions; keep the most variance

### Summary
- Scatter plot: Two or three axes; color for a category
- Scatter matrix: Every pair at once; brushing links panels
- Parallel coordinates: A line per record; neighbours compare
- Projection: A few directions that keep the most variance

### References
- J. Han, M. Kamber, J. Pei, Data Mining: Concepts and Techniques, 3rd ed., Morgan Kaufmann
- Student's Handbook for Associate Analytics, named in the syllabus
- Reference books: Tan, Steinbach and Kumar; Zaki and Meira; Leskovec, Rajaraman and Ullman
- Explanations, examples and numbers in this video are original
