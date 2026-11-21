---
title: Matplotlib: plots
summary: Turn lists and arrays into line, bar, scatter and histogram charts, label them, and save them as pictures.
---

> [!aha] Numbers in a list are hard to judge. The same numbers as a picture show the pattern in a second: is it rising, are there outliers, where is the bunch? **Matplotlib** draws that picture from a few lines of code.

## Install and import

```bash
pip install matplotlib
```

```python
import matplotlib.pyplot as plt
```

`plt` is the short name everybody uses.

## Your first plot

Give it a list of x values and a list of y values. `plt.show()` opens the window.

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

Always add a **title** and **axis labels**. A chart with no labels is a puzzle, not information.

## Choose the right chart

Try each kind on the same data. Turn the labels and the grid on and off and watch the code change.

```widget
plotbuilder
```

| Chart | Call | Use it to show |
|---|---|---|
| line | `plt.plot(x, y)` | how something **changes** over time or steps |
| bar | `plt.bar(x, y)` | **compare** amounts between categories |
| scatter | `plt.scatter(x, y)` | whether two things are **related** |
| histogram | `plt.hist(values, bins=5)` | how values are **spread out** |

> [!compare] Think of it like choosing a container. A line is a road, bars are shelves of different heights, scatter dots are stars in the sky, and a histogram is sorting marbles into jars by size and counting each jar. The data is the same, and the container decides which question it answers.

For text categories, give `bar` the names as x:

```python
fruit = ["apple", "banana", "cherry"]
sales = [30, 55, 12]
plt.bar(fruit, sales, color="orchid")
plt.show()
```

## Several lines and a legend

Call `plot` more than once, give each a `label`, and add `plt.legend()`. A training curve is the classic example:

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

When the validation line starts rising while the training line keeps falling, the model is **overfitting**, which the AI chapters explain.

## Style and size

```python
plt.figure(figsize=(8, 4))                  # width and height in inches
plt.plot(x, y, color="green", linestyle="--", marker="o")
plt.grid(True)                              # light grid lines
plt.xlim(0, 10)                             # limit the x range
plt.tight_layout()                          # stop labels being cut off
```

## Saving a picture

`savefig` writes the chart to a file. Call it **before** `plt.show()`, because after the window closes the figure is gone and you would save a blank one.

```python
plt.savefig("scores.png", dpi=150)
plt.show()
```

## Showing a picture: imshow

An image is an array, and `imshow` draws an array. This is how you view a picture or a heat map:

```python
import numpy as np

grid = np.random.default_rng(0).random((10, 10))   # 10 x 10 random numbers
plt.imshow(grid, cmap="viridis")
plt.colorbar()
plt.show()
```

> [!warn] OpenCV pictures are **BGR** and Matplotlib expects **RGB**. To show an OpenCV picture the right colours, convert first: `plt.imshow(cv.cvtColor(img, cv.COLOR_BGR2RGB))`.

## Several charts in one window

`subplots` gives you a grid of small charts. Draw on each one with its own `ax`:

```python
fig, (left, right) = plt.subplots(1, 2, figsize=(9, 3))   # 1 row, 2 charts
left.plot(hours, score)
left.set_title("Line")
right.bar(hours, score)
right.set_title("Bar")
plt.tight_layout()
plt.show()
```

On an `ax` the calls are `set_title`, `set_xlabel` and `set_ylabel`, not `title` and `xlabel`.

## No screen? Save instead

On a Raspberry Pi over SSH, or a server with no display, `plt.show()` cannot open a window. Tell Matplotlib to draw without one and write a file:

```python
import matplotlib
matplotlib.use("Agg")                # a back end that needs no screen
import matplotlib.pyplot as plt

plt.plot([1, 2, 3], [3, 1, 2])
plt.savefig("out.png")
```

The `matplotlib.use` line must come **before** `import matplotlib.pyplot`.

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
