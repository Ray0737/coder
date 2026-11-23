---
title: Crop, flip and resize
summary: The simple one-shot changes to a picture: cut out a piece, mirror it, and make it bigger or smaller.
---

> [!aha] Because an image is an array, cropping is just slicing. There is no special "crop" function: you keep the rows and columns you want, and throw the rest away.

## Crop: slice the array

The first range is the **rows** (the vertical, y, range) and the second is the **columns** (the horizontal, x, range). The point (0, 0) is the **top-left** corner, and y grows downward. This slice keeps rows 50 to 200 and columns 200 to 400, a piece 150 tall and 200 wide.

```python
cropped = img[50:200, 200:400]   # [y1:y2, x1:x2]
```

> [!compare] Think of it like cutting a window out of a sheet of card. The first pair of numbers says where the window starts and ends going down, the second pair says the same going across.

## Flip: three codes

`cv.flip(img, code)` mirrors the picture. The code picks the direction:

| Code | Result |
|---|---|
| `0` | Upside down (flip vertically) |
| `1` | Mirror left-right (flip horizontally) |
| `-1` | Both at once, which is a half turn |

## Resize: make it bigger or smaller

Resizing means inventing or dropping pixels, and **interpolation** is how it decides, so pick the one that matches the job. Try each operation on the picture below, and the line of code under it updates to match.

```python
small = cv.resize(img, (500, 500), interpolation=cv.INTER_AREA)   # exact size
half  = cv.resize(img, None, fx=0.5, fy=0.5)                      # by a factor
```

```widget
cropflip
```

> [!warn] `img.shape` is `(height, width)` but `cv.resize` wants `(width, height)`. They are in opposite order, and mixing them up squashes the picture the wrong way round.

| Goal | Flag | Why |
|---|---|---|
| Shrinking | `cv.INTER_AREA` | Avoids jagged edges |
| Enlarging, best quality | `cv.INTER_CUBIC` | Sharp and smooth, but slower |
| Enlarging, fast | `cv.INTER_LINEAR` | The default, a good balance |
| Pixel art or masks | `cv.INTER_NEAREST` | No blur, crisp blocks |

## Shift and rotate

Shifting and turning use a small 2 × 3 matrix passed to `cv.warpAffine`. To shift right by `x` and down by `y`, the matrix is `[[1, 0, x], [0, 1, y]]`. To rotate, `cv.getRotationMatrix2D(center, angle, scale)` builds the matrix for you, and a positive angle turns **counter-clockwise** around the centre point you give it. For quick quarter turns, `cv.rotate(img, cv.ROTATE_90_CLOCKWISE)` does it in one call.

> [!more] Code: the three helpers, ready to copy
> `rescaleFrame` works on a whole video too, because every frame is just an array, and shrinking frames to half size is the quickest way to make a vision program faster.
>
> ```python
> def rescaleFrame(frame, scale):
>     width  = int(frame.shape[1] * scale)               # shape[1] is the width
>     height = int(frame.shape[0] * scale)               # shape[0] is the height
>     return cv.resize(frame, (width, height), interpolation=cv.INTER_AREA)
>
> def translate(img, x, y):
>     transMat = np.float32([[1, 0, x], [0, 1, y]])      # warpAffine needs float32
>     return cv.warpAffine(img, transMat, (img.shape[1], img.shape[0]))
>
> def rotate(img, angle, rotPoint=None):
>     (height, width) = img.shape[:2]
>     if rotPoint is None:
>         rotPoint = (width // 2, height // 2)           # default: spin round the centre
>     rotMat = cv.getRotationMatrix2D(rotPoint, angle, 1.0)
>     return cv.warpAffine(img, rotMat, (width, height))
>
> half       = rescaleFrame(img, 0.5)
> moved      = translate(img, 100, 100)                  # right 100, down 100
> turned     = rotate(img, 45)                           # 45 degrees counter-clockwise
> ```

## Try it

1. Write the slice that keeps only the top-left quarter of a 400 × 600 image (400 tall, 600 wide).
2. A photo is 480 tall and 640 wide. Which `dsize` makes it half as big in `cv.resize`: `(240, 320)` or `(320, 240)`?
3. Which flip code mirrors a selfie left to right?
4. You enlarge a small icon and it looks blurry. Which interpolation would keep it crisp and blocky, and why?

## Quick recap

| Tool | Real-life picture | What it does |
|---|---|---|
| `img[y1:y2, x1:x2]` | Cutting a window in a sheet of card | Keeps only that range of rows and columns |
| `cv.flip` | Holding the photo up to a mirror | 0 vertical, 1 horizontal, -1 both |
| `cv.resize` | Zooming a photocopier | Makes the picture a new (width, height) |
| Interpolation | How a photocopier fills in the gaps | The method for inventing or dropping pixels |
| `warpAffine` | Sliding or spinning the photo on a table | Moves every pixel by a 2 × 3 matrix |
