---
title: Thresholding and edges
summary: Turn a grey picture into pure black and white, and find where one region ends and the next begins.
---

> [!aha] Both tricks ask the same question of every pixel: "is this one bright, or does it change sharply from its neighbour?" A threshold answers the first, edge detection answers the second.

## Grayscale first

Most of these steps want a **single-channel** grey image, so the first move is `cv.cvtColor(img, cv.COLOR_BGR2GRAY)`. A grey picture holds one brightness number per pixel instead of three colour numbers, which is all that thresholds and edges need.

```python
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
```

## Then blur away the noise

A picture has tiny random speckles (**noise**), and every speckle looks like a little edge, so the second move is a blur that smooths them away. The blur size is a window, `(5, 5)`, and both numbers must be **odd and positive**, where bigger means blurrier.

```python
blur = cv.GaussianBlur(gray, (5, 5), cv.BORDER_DEFAULT)
```

## What "Gaussian" blur actually does

A blur replaces every pixel with an **average of the pixels around it**. A plain average treats every neighbour the same, but a **Gaussian** blur gives the pixels in the middle of the window more say than the ones at the edge, following a bell-shaped curve. That is why it looks natural and keeps shapes recognisable. The grid of weights is called the **kernel**, and its size is the number you pass in. Slide the size and watch both the picture and the kernel change.

```widget
gaussblur
```

> [!compare] Think of it like asking your neighbours for the time. You listen hardest to the person right next to you, a bit less to the next house along, and hardly at all to the far end of the street. The answer you settle on is a smooth blend, not a jump.

> [!more] TLDR: how big a kernel, and why odd
> A bigger kernel smooths more noise, but it also blurs real edges, so go only as big as you need. Odd sizes matter because the kernel needs a single centre pixel to sit on.

## Thresholding: every pixel against one number

`cv.threshold(gray, thresh, maxval, type)` checks each pixel against `thresh` and writes a new value. With `THRESH_BINARY` every pixel becomes either 0 (black) or `maxval`, usually 255 (white), and nothing is left in between, which is why it is called binary. Pick a rule and slide the cut-off.

```widget
threshold
```

> [!compare] Think of it like marking an exam with a pass mark. Everyone at or below it gets "fail" and everyone above gets "pass". The pass mark is the one number you pick, and where you put it decides who passes.

## The call

The function returns two things: `ret`, the threshold that was used, and `dst`, the new image. Here every pixel brighter than 150 becomes white and every other pixel becomes black.

```python
ret, thresh = cv.threshold(gray, 150, 255, cv.THRESH_BINARY)
```

## Five rules, one cut-off

The last argument chooses what happens to the pixels on each side of the cut-off. The first rule makes pure black and white, and the other four keep some of the original brightness.

| Type | Rule for each pixel |
|---|---|
| `THRESH_BINARY` | Above `thresh`: 255, otherwise 0 |
| `THRESH_BINARY_INV` | The opposite: above is 0, otherwise 255 |
| `THRESH_TRUNC` | Above `thresh`: capped at `thresh`, otherwise unchanged |
| `THRESH_TOZERO` | Above: keep the value, otherwise 0 |
| `THRESH_TOZERO_INV` | Above: 0, otherwise keep the value |

## When one cut-off is not enough

One global `thresh` fails when the light is uneven, like a shadow across half a page. There are two fixes. **Otsu** picks the cut-off for you when you add `cv.THRESH_OTSU` and pass `0` as `thresh`. **Adaptive** thresholding works out a separate cut-off for each small neighbourhood, so shadows stop mattering.

```python
_, otsu = cv.threshold(gray, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU)

adaptive = cv.adaptiveThreshold(gray, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C,
                                cv.THRESH_BINARY, 11, 2)       # neighbourhood 11, subtract 2
```

## Edges: where brightness jumps

An **edge** is a place where brightness changes sharply, such as the border of a shape. `cv.Canny(blur, 125, 175)` finds them and returns a black-and-white picture where white means "edge". The two numbers are the low and high strength limits: a pixel above the high one is surely an edge, one below the low one is surely not, and anything in between is kept only if it touches a strong edge. Lower the numbers to catch fainter edges, raise them to keep only strong ones.

```python
canny = cv.Canny(blur, 125, 175)
```

## Find the edges with and without blur

The picture below has a little noise on purpose, so find the edges with the blur off, then on.

```widget
edgeviz
```

> [!aha] The blur is not optional decoration. Without it, noise creates hundreds of fake edges. Blur first, then detect.

> [!more] TLDR: how the diagram differs from real Canny
> The diagram uses a simple gradient cut-off. Real Canny does two more things: it thins every edge to one pixel, and it uses the low and high limits together.

## Thicken and thin

`cv.dilate(img, kernel, iterations=1)` grows the white regions, which thickens broken edges, and `cv.erode(...)` does the opposite and shrinks them. Dilating then eroding with the same kernel closes small gaps without leaving fat lines.

```python
import cv2 as cv
import numpy as np

kernel = np.ones((5, 5), np.uint8)
thick  = cv.dilate(canny, kernel, iterations=1)      # thicken broken edges
closed = cv.erode(thick, kernel, iterations=1)       # then shrink back: gaps stay closed
```

## Sobel and Laplacian

These two classic detectors measure the **gradient**, which is how fast brightness changes. `cv.Sobel` finds vertical edges (change along x) with `dx=1, dy=0` and horizontal ones with `dx=0, dy=1`, and `cv.Laplacian` responds to every direction at once. Dark-to-light is a positive gradient and light-to-dark is negative, so compute in `cv.CV_64F` (signed numbers) and finish with `cv.convertScaleAbs(...)`, which takes the absolute value. Otherwise half your edges are clipped to 0.

```python
sobel_x   = cv.convertScaleAbs(cv.Sobel(gray, cv.CV_64F, 1, 0, ksize=3))   # vertical edges
sobel_y   = cv.convertScaleAbs(cv.Sobel(gray, cv.CV_64F, 0, 1, ksize=3))   # horizontal edges
laplacian = cv.convertScaleAbs(cv.Laplacian(gray, cv.CV_64F))              # every direction
```

## The whole thing on a live camera

Everything from this chapter, run on every frame of the webcam: grayscale, blur, then Canny edges and a threshold side by side.

```python
import cv2 as cv

cap = cv.VideoCapture(0)
while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        break
    gray  = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
    blur  = cv.GaussianBlur(gray, (5, 5), cv.BORDER_DEFAULT)
    canny = cv.Canny(blur, 125, 175)
    _, thresh = cv.threshold(blur, 150, 255, cv.THRESH_BINARY)

    cv.imshow('Canny', canny)
    cv.imshow('Threshold', thresh)
    if cv.waitKey(1) & 0xFF == ord('q'):
        break
cap.release()
cv.destroyAllWindows()
```

## Try it

1. Which `THRESH` type turns a dark object on a bright page into white-on-black?
2. A page has a dark shadow across one corner and a global threshold ruins it. Name two fixes.
3. In the edge widget, why does turning the blur on remove most of the tiny fake edges?
4. Why must a Gaussian blur size be odd, such as `(5, 5)` and not `(4, 4)`?
5. In the blur widget, which kernel size looks the smoothest, and what do you lose by going that large?

## Quick recap

| Tool | Real-life picture | What it does |
|---|---|---|
| Blur | Squinting to ignore the speckles | Smooths noise so it does not make fake edges |
| `threshold` | A pass mark on an exam | Turns each pixel into one of two values by one cut-off |
| Otsu / adaptive | A marker who adjusts for a hard paper | Picks the cut-off for you, or per neighbourhood |
| `Canny` | Tracing the borders with a pen | Marks where brightness jumps sharply |
| `dilate` / `erode` | Thickening or thinning a pen line | Grows or shrinks the white regions |
| Sobel / Laplacian | Measuring the steepness of a slope | Gradient-based edge finders |
