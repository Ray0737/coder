---
title: Contours
summary: Join edge pixels into whole outlines, count the shapes in a picture and draw them.
---

> [!aha] Edges are loose white pixels. A **contour** is those pixels joined into an outline you can count, measure and draw. Edges tell you where something changes. Contours tell you what shapes are there.

## From edges to shapes

A contour is the outline of a shape: a list of (x, y) points tracing where one region meets another. Where Canny gives you a picture of edge pixels, `cv.findContours` links the dots into organised shapes. It follows straight on from the last chapter:

```python
contours, hierarchy = cv.findContours(canny, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
print(len(contours), 'shapes found')
```

The first input must be a single-channel black-and-white image, so it works with `canny` or with `thresh`. It returns `contours`, a tuple of arrays, one array of points for each shape, and `hierarchy`, which describes which shapes sit inside others.

> [!compare] Think of it like tracing round cookie cutters on paper. Each cutter leaves one closed outline. A ring-shaped cutter leaves two: one round the outside and one round the hole.

## Which contours do you get?

The `mode` argument decides what comes back. Switch between two of them on a picture with a ring in it:

```widget
contourviz
```

| Mode | What it returns |
|---|---|
| `RETR_EXTERNAL` | Only the outermost outline of each shape |
| `RETR_LIST` | Every contour, with no parent/child information |
| `RETR_TREE` | Every contour, plus the full nesting (a hole inside a shape inside another) |
| `RETR_CCOMP` | Every contour, in a two-level hierarchy |

The third argument, `method`, decides how much detail each contour keeps:

| Method | What it stores |
|---|---|
| `CHAIN_APPROX_NONE` | Every single point along the boundary: most accurate, most memory |
| `CHAIN_APPROX_SIMPLE` | Straight stretches squashed to their two end points: usually good enough |

## Draw them

```python
blank = np.zeros(img.shape, dtype='uint8')               # 3-channel black canvas
cv.drawContours(blank, contours, -1, (0, 0, 255), 2)     # -1 = all, red, 2 px
```

`contourIdx` picks one contour by number, or `-1` for all of them. The colour is `(B, G, R)`, so `(0, 0, 255)` is red. A thickness of `cv.FILLED` fills the shape in. The canvas needs three channels to hold a colour, so use `img.shape`, not `img.shape[:2]`, which only makes a one-channel canvas.

> [!warn] Write the arguments with commas: `(-1, (0, 0, 255), 2)`. A missing comma, as in `-1(0, 0, 255)`, makes Python try to "call" the number -1 and gives a syntax error.

## The whole pipeline

You have now met every step of the classic vision pipeline:

| Step | Function | Why |
|---|---|---|
| 1 | `cvtColor` to grey, then `GaussianBlur` | Clean, single-channel input with less noise |
| 2 | `threshold` or `Canny` | Black and white, or edges only |
| 3 | `dilate` / `erode` | Thicken or thin the result |
| 4 | `findContours` | Join the pixels into shapes |
| 5 | `drawContours` | Show what was found |

## Try it

1. A white ring on a black background: how many contours does `RETR_EXTERNAL` find, and how many does `RETR_LIST` find?
2. Why must `findContours` be given a black-and-white image and not a colour one?
3. What does the `-1` in `cv.drawContours(blank, contours, -1, ...)` do?
4. Why would you choose `CHAIN_APPROX_SIMPLE` for a picture of rectangles?

## Quick recap

| Tool | Real-life picture | What it does |
|---|---|---|
| Contour | The outline traced around a cookie cutter | A list of (x, y) points around one shape |
| `findContours` | Joining the dots | Turns edge pixels into a list of shapes |
| `RETR_EXTERNAL` / `RETR_LIST` | Outside edge only, or every edge | Chooses which contours are returned |
| `CHAIN_APPROX_SIMPLE` | Keeping only the corners of a drawing | Stores just the end points of straight stretches |
| `drawContours` | Going over the outline with a coloured pen | Draws one or all contours onto a canvas |
