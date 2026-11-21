---
title: Thresholding and edges
summary: Turn a grey picture into pure black and white, and find where one region ends and the next begins.
---

> [!aha] Both tricks ask the same question of every pixel: "is this one bright, or does it change sharply from its neighbour?" A threshold answers the first, edge detection answers the second.

## The usual start: grayscale, then blur

Most of these steps want a **single-channel** grey image, so the first move is `cv.cvtColor(img, cv.COLOR_BGR2GRAY)`. The second is a blur. A picture has tiny random speckles (**noise**), and every speckle looks like a little edge. Blurring smooths them away.

```python
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)
blur = cv.GaussianBlur(gray, (5, 5), cv.BORDER_DEFAULT)
```

The blur size is a window, `(5, 5)`. Both numbers must be **odd and positive**, and bigger means blurrier.

### What "Gaussian" blur actually does

A blur replaces every pixel with an **average of the pixels around it**. A plain average treats every neighbour the same. A **Gaussian** blur gives the pixels in the middle of the window more say than the ones at the edge, following a bell-shaped curve. That is why it looks natural and keeps shapes recognisable. The grid of weights is called the **kernel**, and its size is the number you pass in. Slide the size and watch both the picture and the kernel change.

```widget
gaussblur
```

> [!compare] Think of it like asking your neighbours for the time. You listen hardest to the person right next to you, a bit less to the next house along, and hardly at all to the far end of the street. The answer you settle on is a smooth blend, not a jump.

A bigger kernel smooths more noise, but it also blurs real edges, so go only as big as you need. Odd sizes matter because the kernel needs a single centre pixel to sit on.

## Thresholding: every pixel against one number

`cv.threshold(gray, thresh, maxval, type)` checks each pixel against `thresh` and writes a new value. With `THRESH_BINARY` every pixel becomes either 0 (black) or `maxval`, usually 255 (white). Nothing is left in between, which is why it is called binary. Pick a rule and slide the cut-off.

```widget
threshold
```

```python
ret, thresh = cv.threshold(gray, 150, 255, cv.THRESH_BINARY)
```

| Type | Rule for each pixel |
|---|---|
| `THRESH_BINARY` | Above `thresh`: 255, otherwise 0 |
| `THRESH_BINARY_INV` | The opposite: above is 0, otherwise 255 |
| `THRESH_TRUNC` | Above `thresh`: capped at `thresh`, otherwise unchanged |
| `THRESH_TOZERO` | Above: keep the value, otherwise 0 |
| `THRESH_TOZERO_INV` | Above: 0, otherwise keep the value |

It returns two things: `ret`, the threshold that was used, and `dst`, the new image.

> [!compare] Think of it like marking an exam with a pass mark. Everyone at or below it gets "fail" and everyone above gets "pass". The pass mark is the one number you pick, and where you put it decides who passes.

### When one cut-off is not enough

One global `thresh` fails when the light is uneven, like a shadow across half a page. Two fixes:

- **Otsu**: add `cv.THRESH_OTSU` and the cut-off is chosen for you. Pass `0` as `thresh`: `cv.threshold(gray, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU)`.
- **Adaptive**: `cv.adaptiveThreshold(...)` works out a separate cut-off for each small neighbourhood, so shadows stop mattering.

## Edges: where brightness jumps

An **edge** is a place where brightness changes sharply, such as the border of a shape. `cv.Canny(blur, 125, 175)` finds them and returns a black-and-white picture where white means "edge". The two numbers are the low and high strength limits: a pixel above the high one is surely an edge, one below the low one is surely not, and anything in between is kept only if it touches a strong edge. Lower the numbers to catch fainter edges, raise them to keep only strong ones.

The picture below has a little noise on purpose. Find the edges with the blur off, then on.

```widget
edgeviz
```

> [!aha] The blur is not optional decoration. Without it, noise creates hundreds of fake edges. Blur first, then detect.

The widget uses a simple gradient cut-off. Real Canny does two more things: it thins every edge to one pixel, and it uses the low and high limits together.

### Thicken and thin

`cv.dilate(img, kernel, iterations=1)` grows the white regions, which thickens broken edges. `cv.erode(...)` does the opposite and shrinks them. Dilating then eroding with the same kernel closes small gaps without leaving fat lines.

### Sobel and Laplacian

These two classic detectors measure the **gradient**, which is how fast brightness changes. `cv.Sobel(gray, cv.CV_64F, 1, 0, ksize=3)` finds vertical edges (change along x), and `dx=0, dy=1` finds horizontal ones. `cv.Laplacian` responds to every direction at once. Dark-to-light is a positive gradient and light-to-dark is negative, so compute in `cv.CV_64F` (signed numbers) and finish with `cv.convertScaleAbs(...)`, which takes the absolute value. Otherwise half your edges are clipped to 0.

## The whole thing on a live camera

Everything from this chapter, run on every frame of the webcam:

```python
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
