---
title: Bitwise ops and masking
summary: Combine pictures pixel by pixel, and use a black-and-white mask to keep only the part you want.
---

> [!aha] A mask is a stencil. White lets the picture through and black blocks it. Bitwise operations are how you press the stencil onto the picture, and how you combine two stencils into one.

## Four operations, one rule

Bitwise operations compare two images **pixel by pixel**. They are most useful on black-and-white masks, where black is 0 and white is 255, and both inputs must be the **same size**. Try each one below on a rectangle and a circle, then try the last tab, which uses the circle as a mask on a picture.

| Function | White where... | Also called |
|---|---|---|
| `cv.bitwise_and(a, b)` | Both are white | Intersection |
| `cv.bitwise_or(a, b)` | Either is white | Union |
| `cv.bitwise_xor(a, b)` | They differ | One but not both |
| `cv.bitwise_not(a)` | The input was black | Inversion |

```widget
bitwiseviz
```

> [!compare] Think of it like two overlapping sheets of stained glass. AND is the patch of light that comes through both at once. OR is everything either sheet lets through. XOR is the light that gets through exactly one. NOT swaps glass and wall.

> [!more] Code: make the two shapes
> The two shapes in the diagram are made with a few lines of OpenCV: a black canvas, then a filled white shape on it (`thickness=-1` means fill).
>
> ```python
> rectangle = np.zeros((400, 400), dtype='uint8')
> cv.rectangle(rectangle, (30, 30), (370, 370), 255, thickness=-1)   # filled square
>
> circle = np.zeros((400, 400), dtype='uint8')
> cv.circle(circle, (200, 200), 200, 255, thickness=-1)              # filled circle
>
> cv.imshow('AND (intersection)', cv.bitwise_and(rectangle, circle))
> cv.imshow('OR (union)',         cv.bitwise_or(rectangle, circle))
> cv.imshow('XOR (non-overlap)',  cv.bitwise_xor(rectangle, circle))
> cv.imshow('NOT (inverted)',     cv.bitwise_not(rectangle))
> ```

## Masking: keep only a region

The optional `mask` argument applies the operation only where the mask is white. The trick for cutting a region out of a picture is to AND the picture with itself through a mask: anding a picture with itself changes nothing, so the only effect is the mask, where pixels under white survive and pixels under black become black. Using `bitwise_not` on the mask flips which part survives.

```python
masked = cv.bitwise_and(img, img, mask=circle_mask)       # keep the circle
hidden = cv.bitwise_and(img, img, mask=cv.bitwise_not(circle_mask))   # remove it
```

## Making a mask from a colour

A mask from `cv.inRange` plugs straight into this. Keep every green pixel of the picture:

```python
mask   = cv.inRange(hsv, lower_green, upper_green)
result = cv.bitwise_and(img, img, mask=mask)
```

> [!more] TLDR: several colours at once, and the face lessons
> To keep **several colours at once**, build one mask per colour and join them with `bitwise_or`. This is how the lesson on white, yellow and green lane lines works:
>
> ```python
> pre    = cv.bitwise_or(mask_yellow, mask_green)
> pre2   = cv.bitwise_or(pre, white_mask)                  # yellow OR green OR white
> result = cv.bitwise_and(test, test, mask=pre2)
> ```
>
> The face lessons use the same pattern in two directions. Draw a filled ellipse onto a black mask at the face, then `bitwise_and` with the mask to **show only the face**, or with `bitwise_not(mask)` to **hide the face** and keep everything else.

## Try it

1. A rectangle and a circle overlap in the middle. Which operation leaves only that overlap?
2. How do you flip a mask so that it keeps the background instead of the object?
3. You have separate masks for yellow and white lane lines. Which function joins them into one?
4. Why does `cv.bitwise_and(img, img, mask=m)` use the same picture twice?

## Quick recap

| Tool | Real-life picture | What it does |
|---|---|---|
| Mask | A stencil | Black blocks, white lets the picture through |
| `bitwise_and` | Light through two sheets of glass at once | White only where both are white |
| `bitwise_or` | Light through either sheet | White where either is white |
| `bitwise_xor` | Light through exactly one sheet | White where they differ |
| `bitwise_not` | Swapping glass and wall | Flips black and white |
| `mask=` argument | Pressing the stencil on | Applies the operation only where the mask is white |
