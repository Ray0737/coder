---
title: NumPy: arrays
summary: Fast grids of numbers that do maths on everything at once. The data format behind images and machine learning.
---

> [!aha] A Python list is a flexible shopping bag. A NumPy **array** is an egg carton: every slot holds the same kind of thing in a fixed grid, and that is exactly why it can do maths on the whole carton at once. Pictures, sensor readings and the inputs of a neural network are all arrays.

## Install and import

NumPy is not built into Python, so install it once with `pip install numpy`, then import it with the usual short name:

```python
import numpy as np
```

## Making arrays

Build an array from a list, from a list of lists for a grid, or with a helper that fills it for you. `np.array` turns a list into an array, and a list of lists becomes a grid. `zeros` and `ones` make arrays filled with 0 or 1, `arange` counts like `range`, `linspace` gives a set number of evenly spaced values between two ends, and `reshape` rearranges the same numbers into rows and columns.

```python
a = np.array([1, 2, 3])                 # from a list
b = np.array([[1, 2, 3], [4, 5, 6]])    # a list of lists makes a 2D grid

print(np.zeros((2, 3)))                 # 2 rows, 3 columns of 0.
print(np.ones(3))                       # [1. 1. 1.]
print(np.arange(0, 10, 3))              # [0 3 6 9]       like range
print(np.linspace(0, 1, 5))             # [0.   0.25 0.5  0.75 1.  ]  5 evenly spaced
print(np.arange(1, 7).reshape(2, 3))    # reshape a row into 2 rows of 3
```

## Shape and type

Every array knows its own shape and type.

| Attribute | Meaning | For `b` above |
|---|---|---|
| `b.shape` | rows and columns | `(2, 3)` |
| `b.ndim` | number of dimensions | `2` |
| `b.size` | total items | `6` |
| `b.dtype` | the type of every item | `int64` (it can be `int32` on some Windows installs) |

## Maths on the whole array

This is the big idea. With a list you need a loop. With an array you just write the maths. In the code, `prices * 2` doubles every item at once, `prices + 5` adds 5 to every item, and `prices ** 2` squares every item. No loop is written, because NumPy loops for you.

```python
prices = np.array([10, 20, 30])
print(prices * 2)          # [20 40 60]
print(prices + 5)          # [15 25 35]
print(prices ** 2)         # [100 400 900]
```

> [!warn] A list and an array behave differently when you multiply. Multiplying a list **repeats the list**, while multiplying an array **multiplies every number**. See the two lines of code below.

```python
print([1, 2] * 2)              # [1, 2, 1, 2]   the list is repeated
print(np.array([1, 2]) * 2)    # [2 4]          every number doubled
```

## Two arrays together

Two arrays of the same shape combine item by item. This is the speed-up too: the loop runs inside NumPy's fast code, not in slow Python.

```python
print(np.array([1, 2, 3]) + np.array([10, 20, 30]))    # [11 22 33]
```

## Try the operations

Here is a 3 by 4 array `a`. Press an operation and see what it does to it. Notice what `axis=0` and `axis=1` do.

```widget
arrayviz
```

## Picking items: indexing and slicing

Indexes start at 0, as in lists, but a grid needs two numbers: row, then column. The colon means "all of them", so `a[:, 1]` reads as "every row, column 1". In the code, `a[1, 2]` is row 1 and column 2, which is 7, `a[0]` is the whole first row, `a[:, 1]` is the second column, and `a[0:2, 1:3]` is the block of rows 0 to 1 and columns 1 to 2.

```python
a = np.arange(1, 13).reshape(3, 4)    # [[1 2 3 4] [5 6 7 8] [9 10 11 12]]

print(a[1, 2])        # 7, row 1 and column 2
print(a[0])           # [1 2 3 4], the whole first row
print(a[:, 1])        # [ 2  6 10], the whole second column
print(a[0:2, 1:3])    # rows 0-1 and columns 1-2: [[2 3] [6 7]]
```

## Masks: pick by a condition

A comparison on an array gives an array of `True` and `False`. Use it as an index to keep only the matching items. This replaces a loop with an `if`. `scores >= 60` checks every score and gives True or False for each, which is the mask. Using the mask as an index keeps only the True items, so `scores[mask]` is `[90 72 85]`, and the last line assigns, so every score under 50 is raised to 50.

```python
scores = np.array([48, 90, 72, 55, 85])
mask = scores >= 60
print(mask)               # [False  True  True False  True]
print(scores[mask])       # [90 72 85]
scores[scores < 50] = 50  # raise every low score to 50
```

## axis: which way to squash

Functions like `sum`, `mean`, `max` take an `axis`. The axis is the direction that **disappears**.

| Call on a 3 x 4 array | Result | Meaning |
|---|---|---|
| `a.sum()` | one number | add everything |
| `a.sum(axis=0)` | 4 numbers | squash the rows, one total per **column** |
| `a.sum(axis=1)` | 3 numbers | squash the columns, one total per **row** |

> [!compare] Think of it like a school timetable grid. `axis=0` adds down each column (the total for each day), and `axis=1` adds across each row (the total for each period).

## Broadcasting: different shapes, still works

NumPy stretches a smaller array to fit a bigger one, when the shapes allow it. A single number stretches to everything, and a row stretches down the rows, so each column gets its own number added. This is how you subtract the average from every column in one line.

```python
a = np.arange(1, 13).reshape(3, 4)
print(a + np.array([10, 20, 30, 40]))
# [[11 22 33 44]
#  [15 26 37 48]
#  [19 30 41 52]]
```

## Why a picture is an array

A colour picture is a 3D array: height, width and 3 colour numbers (blue, green, red in OpenCV). Each number is 0 to 255, so it is stored as `uint8`.

```python
img = np.zeros((2, 2, 3), dtype=np.uint8)   # a tiny black 2 x 2 picture
print(img.shape)                            # (2, 2, 3)
img[0, 0] = [255, 0, 0]                     # make the top-left pixel blue (BGR)
```

> [!warn] `uint8` cannot go past 255. It **wraps around**: `np.array([250], dtype=np.uint8) + 10` gives `[4]`, not 260. When you brighten a picture, convert to a bigger type first, or use `np.clip(img.astype(int) + 50, 0, 255)`.

## Cropping is slicing

This is why NumPy is the language of the Computer Vision class: cropping a picture is just slicing.

```python
crop = img[y1:y2, x1:x2]       # rows first, then columns
```

## A neuron in one line

The weighted sum of a neuron from the AI chapters is a **dot product**: multiply matching numbers and add them up. Whole layers of a network are the same thing done for many neurons at once with a matrix, written `x @ W`. In the code, `x` is the inputs, `w` the weights and `b` the bias. `np.dot(x, w)` multiplies each input by its weight and adds them up, and `+ b` adds the bias, which gives 1·0.5 + 2·(−1) + 3·2 + 0.5 = 5.0.

```python
x = np.array([1, 2, 3])          # inputs
w = np.array([0.5, -1, 2])       # weights
b = 0.5                          # bias

print(np.dot(x, w) + b)          # 5.0  =  1*0.5 + 2*-1 + 3*2 + 0.5
```

## Handy functions

| Call | Gives |
|---|---|
| `np.mean(a)` / `np.median(a)` | the average / the middle value |
| `np.std(a)` | the standard deviation, how spread out the numbers are |
| `np.min(a)` / `np.max(a)` | smallest / biggest |
| `np.argmax(a)` | the **position** of the biggest (`np.argmax([3, 9, 2])` is 1) |
| `np.sqrt(a)`, `np.abs(a)` | square root, absolute value of every item |
| `np.sort(a)` | a sorted copy |
| `np.clip(a, lo, hi)` | squeeze every item into the range |
| `np.random.default_rng(0).random(3)` | 3 random numbers, repeatable with the seed 0 |

> [!tip] When a model says "the class with the highest score", that is `np.argmax(scores)`: the **index** of the largest number, which you then look up in your list of class names.

## Try it

1. Make an array of the numbers 1 to 10 and print its squares.
2. Make `np.arange(1, 7).reshape(2, 3)`. Print its shape and the sum of each column.
3. From `[48, 90, 72, 55, 85]`, print only the scores of at least 60.
4. What is the difference between `[1, 2] * 3` and `np.array([1, 2]) * 3`?
5. A 480 by 640 colour picture has what shape? How do you cut out its top-left 100 by 100 corner?

## Quick recap

| Tool | Real-life picture | What it does |
|---|---|---|
| `np.array` | an egg carton | a fixed-type grid of numbers |
| `shape`, `dtype` | the carton's label | its size and kind of item |
| `a * 2` | one stamp on every egg | maths on every item, no loop |
| `a[1, 2]`, `a[:, 1]` | row and column numbers | picks items from a grid |
| `a[a > 6]` | a filter | keeps the items that match |
| `axis=0` / `axis=1` | adding down / across | squashes one direction away |
| `np.dot`, `@` | weights times inputs | the maths of a neuron |
