---
title: Matplotlib: plots
summary: Turn lists and arrays into line, bar, scatter and histogram charts, label them, and save them as pictures.
---

> [!aha] Numbers in a list are hard to judge. The same numbers as a picture show the pattern in a second: is it rising, are there outliers, where is the bunch? **Matplotlib** draws that picture from a few lines of code.

## Install and import

Install it once with `pip install matplotlib`, then import it. `plt` is the short name everybody uses.

```bash
pip install matplotlib
```

```python
import matplotlib.pyplot as plt
```

> [!more] TLDR: install
> `pip install matplotlib`, then `import matplotlib.pyplot as plt`.

## Your first plot

Give it a list of x values and a list of y values, and `plt.show()` opens the window. Always add a **title** and **axis labels**, because a chart with no labels is a puzzle, not information. `plt.plot(hours, score)` draws a line through each (hours, score) pair. The next three lines add the title and the two axis labels, and `plt.show()` comes last, because it opens the window and waits.

```python
import matplotlib.pyplot as plt

hours = [1, 2, 3, 4, 5, 6]
score = [52, 58, 65, 70, 78, 85]

plt.plot(hours, score)
plt.title("Score vs study hours")
plt.xlabel("Hours studied")
plt.ylabel("Score")
plt.show()
```

> [!more] TLDR: your first plot
> `plt.plot(x, y)` draws a line and `plt.show()` opens the window. Always add a title and axis labels.

## Choose the right chart

Try each kind on the same data. Turn the labels and the grid on and off and watch the code change.

```widget
plotbuilder
```

> [!compare] Think of it like choosing a container. A line is a road, bars are shelves of different heights, scatter dots are stars in the sky, and a histogram is sorting marbles into jars by size and counting each jar. The data is the same, and the container decides which question it answers.

> [!more] TLDR: choosing a chart
> The question picks the chart: how things change, compare, relate or spread.

## The four charts

Each chart answers a different question, so pick it from the question you are asking.

| Chart | Call | Use it to show |
|---|---|---|
| line | `plt.plot(x, y)` | how something **changes** over time or steps |
| bar | `plt.bar(x, y)` | **compare** amounts between categories |
| scatter | `plt.scatter(x, y)` | whether two things are **related** |
| histogram | `plt.hist(values, bins=5)` | how values are **spread out** |

> [!more] TLDR: the four charts
> A line shows change, a bar compares, a scatter shows a relation and a histogram shows how values spread.

## Bars with text names

For text categories, give `bar` the names as x. Here `fruit` holds the category names and `sales` the bar heights, and `color` sets the colour of the bars.

```python
fruit = ["apple", "banana", "cherry"]
sales = [30, 55, 12]
plt.bar(fruit, sales, color="orchid")
plt.show()
```

> [!more] TLDR: bars with names
> `plt.bar(names, heights)` takes text as x, and `color` sets the colour.

## Several lines and a legend

Call `plot` more than once, give each a `label`, and add `plt.legend()`. A training curve is the classic example, and when the validation line starts rising while the training line keeps falling, the model is **overfitting**, which the AI chapters explain. Each `plot` call draws one line, the `label` names it for the legend, and `plt.legend()` draws the key. In these numbers the training loss keeps falling to 0.25 while the validation loss turns upwards after epoch 4.

```python
epochs = [1, 2, 3, 4, 5]
train_loss = [0.9, 0.6, 0.4, 0.3, 0.25]
val_loss = [1.0, 0.7, 0.55, 0.5, 0.52]

plt.plot(epochs, train_loss, label="training")
plt.plot(epochs, val_loss, label="validation")
plt.xlabel("Epoch")
plt.ylabel("Loss")
plt.legend()
plt.show()
```

> [!more] TLDR: legends
> Call `plot` more than once, give each line a `label` and add `plt.legend()`.

## Style and size

A few calls set the size, the line style, the grid and the range of the axes. `figsize` sets the width and height in inches, and `color`, `linestyle` and `marker` style the line. `plt.grid(True)` adds light guide lines, `plt.xlim` fixes the x range, and `tight_layout()` stops the labels being cut off at the edges.

```python
plt.figure(figsize=(8, 4))                  # width and height in inches
plt.plot(x, y, color="green", linestyle="--", marker="o")
plt.grid(True)                              # light grid lines
plt.xlim(0, 10)                             # limit the x range
plt.tight_layout()                          # stop labels being cut off
```

> [!more] TLDR: style and size
> `figsize`, `color`, `linestyle`, `marker`, `plt.grid` and `plt.xlim` control how a chart looks.

## Saving a picture

`savefig` writes the chart to a file. Call it **before** `plt.show()`, because after the window closes the figure is gone and you would save a blank one.

```python
plt.savefig("scores.png", dpi=150)
plt.show()
```

> [!more] TLDR: saving
> `plt.savefig("name.png")` goes before `plt.show()`, or you save a blank picture.

## Showing a picture: imshow

An image is an array, and `imshow` draws an array. This is how you view a picture or a heat map: `np.random.default_rng(0).random((10, 10))` makes a 10 by 10 grid of random numbers, and the 0 is a seed so it is the same every run. `imshow` colours each cell by its number using the `viridis` scale, and `colorbar()` adds the key that shows which colour means which number.

```python
import numpy as np

grid = np.random.default_rng(0).random((10, 10))   # 10 x 10 random numbers
plt.imshow(grid, cmap="viridis")
plt.colorbar()
plt.show()
```

> [!warn] OpenCV pictures are **BGR** and Matplotlib expects **RGB**. To show an OpenCV picture the right colours, convert first: `plt.imshow(cv.cvtColor(img, cv.COLOR_BGR2RGB))`.

> [!more] TLDR: imshow
> `plt.imshow(array)` draws any array as a picture or a heat map.

## Several charts in one window

`subplots` gives you a grid of small charts. Draw on each one with its own `ax`, whose calls are `set_title`, `set_xlabel` and `set_ylabel`, not `title` and `xlabel`. `plt.subplots(1, 2)` returns the figure and two axes, which the code names `left` and `right`. Each one is drawn on separately, a line on the left and bars on the right, and `tight_layout()` keeps them from overlapping.

```python
fig, (left, right) = plt.subplots(1, 2, figsize=(9, 3))   # 1 row, 2 charts
left.plot(hours, score)
left.set_title("Line")
right.bar(hours, score)
right.set_title("Bar")
plt.tight_layout()
plt.show()
```

> [!more] TLDR: subplots
> `fig, axes = plt.subplots(1, 2)` gives a grid of charts. Draw on each axis with `set_title` and `set_xlabel`.

## No screen? Save instead

On a Raspberry Pi over SSH, or a server with no display, `plt.show()` cannot open a window. Tell Matplotlib to draw without one and write a file, and put the `matplotlib.use` line **before** `import matplotlib.pyplot`. `Agg` is a back end that draws into memory with no window, and `savefig` writes the result to `out.png`, which you can then open or copy to your computer.

```python
import matplotlib
matplotlib.use("Agg")                # a back end that needs no screen
import matplotlib.pyplot as plt

plt.plot([1, 2, 3], [3, 1, 2])
plt.savefig("out.png")
```

> [!more] TLDR: no screen
> Put `matplotlib.use("Agg")` before importing pyplot and save with `savefig`. It works on a Pi over SSH.

## Try it

1. Plot the squares of 1 to 10 as a line, with a title and both axis labels.
2. Make a bar chart of three fruits and how many of each were sold.
3. Draw a histogram of 20 numbers you make up. Try `bins=3` and `bins=10`. What changes?
4. Plot two lines on one chart and add a legend.
5. Why must `plt.savefig` come before `plt.show()`?

## Quick recap

| Tool | Real-life picture | What it does |
|---|---|---|
| `plt.plot` | a road drawn through points | a line chart of change |
| `plt.bar` | shelves of different heights | compares amounts |
| `plt.scatter` | stars in the sky | shows if two things relate |
| `plt.hist` | sorting marbles into jars | shows how values spread |
| `title`, `xlabel`, `ylabel`, `legend` | labels on a map | make the chart readable |
| `plt.savefig` | taking a photo | saves the chart as an image file |
| `plt.imshow` | hanging a picture | draws an array as an image |
