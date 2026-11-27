### Recap: where we are in the course
- Unit I: Data management: architecture, sources, quality
- Unit II: Data analytics: lifecycle, tools, modeling
- Unit III: Regression and logistic regression
- Unit IV: Segmentation, trees and time series

### Today in four steps
- Why visualize: A picture shows what numbers hide
- Visual encoding: Position, length, area and color
- Pixel displays: One pixel for every value
- Two layouts: Recursive pattern and circle segments

### The data we will draw
- 11,913: Orders in one simulated day, from Unit I
- 600: Customers in a simulated customer table
- 6: Attributes each: orders, basket, tenure, discount, returns, sessions
- 4: Customer segments, as in Unit IV

### Why a picture beats a table
- Four data sets, identical summary numbers
- Mean of y 7.50, correlation 0.82, same line
- Only the pictures show how different they are

### How well do we judge each encoding?
- Position: Points on a common scale: the most accurate
- Length: Bars from a common baseline: very accurate
- Slope or angle: Lines and pie slices: fair
- Area: Circles and blocks: people underestimate it
- Color shade: Dark to light: good for patterns, not exact values

### The same six numbers, three ways
- Revenue of six categories, in lakh rupees
- Bars: Electronics 28.1 and Home 27.4 are close
- Circles and shades hide that small gap

### Three kinds of color scheme
- Sequential: Light to dark for values that run low to high
- Diverging: Two colors meeting at a middle value
- Categorical: Different hues for groups with no order

### The same day in three color schemes
- Orders per hour: 182 up to 942
- The hourly mean is 496: blue below, red above
- Four segments: four unrelated hues

### Pixel-oriented visualization
- One pixel: Each value becomes one coloured dot
- Color is value: Light to dark shows low to high
- One window: A separate window for each attribute
- Same place: A record sits at the same position everywhere
- Millions fit: A screen holds millions of pixels

### Three windows for 3,600 orders
- The first 3,600 orders, sixty by sixty pixels
- Windows: order value, clicks, failed payment
- 150 failed payments: 4.2 percent

### Watching the display fill
- Orders arrive in time order, left to right
- The clock shows how far the day has gone
- Mean order value so far settles near 1,399

### Where does each pixel go?
- Simple: left to right, then the next row | Follows a curve that visits every cell once
- Long thin strips of neighbours in time | Neighbours in time stay in a compact patch
- Jumps from the end of a row to the start | Never jumps: the next cell touches the last

### Three layouts compared
- Row by row, snake and Hilbert on an 8 by 8 grid
- 64 consecutive records: box 66.0 against 19.7
- The Hilbert curve keeps neighbours compact

### Tracing a Hilbert curve
- Eight by eight grid, 64 orders
- Each cell takes the color of its order value
- Each step moves to a touching cell

### The recursive pattern technique
- Level one: hours: A row of 24 pixels is one day
- Level two: days: Seven rows stacked make a week
- Level three: weeks: Week blocks are laid out side by side
- Result: 91 days, 2,184 pixels, one picture

### A quarter of orders in one picture
- 91 days of orders, 1,356,041 in total
- The evening glow repeats in every week
- Weekend days average 18,210 orders, weekdays 13,578

### Circle segments in action
- One wedge per attribute, six wedges
- Customers sorted by basket, centre outward
- Basket and discount are opposed: minus 0.63

### Strengths and limits
- Shows millions of values at once | Exact values cannot be read
- Every record has its own pixel | Needs a good order and arrangement
- Patterns across attributes line up | Color scale choice can mislead
- Missing data and gaps show up | Needs a large, high quality screen

### Exam tips and important questions
- Why visualize data? | Pattern, outliers, communication, Anscombe example
- Visual encoding and color | Position, length, angle, area, shade; three schemes
- Pixel-oriented technique | One pixel per value, one window per attribute
- Recursive pattern, circle segments | Levels of blocks; wedge per attribute, centre outward

### Summary
- Why a picture: Same numbers, different data: draw first
- Encoding: Position and length first; color for patterns
- Pixel display: One pixel per value, one window per attribute
- Two layouts: Recursive pattern and circle segments

### References
- J. Han, M. Kamber, J. Pei, Data Mining: Concepts and Techniques, 3rd ed., Morgan Kaufmann
- Student's Handbook for Associate Analytics, named in the syllabus
- Reference books: Tan, Steinbach and Kumar; Zaki and Meira; Leskovec, Rajaraman and Ullman
- Explanations, examples and numbers in this video are original
