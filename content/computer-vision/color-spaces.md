---
title: Color spaces
summary: BGR, grey and HSV: the same picture written three ways, and why HSV is the one for finding a colour.
---

> [!aha] A colour space is just a different way of writing down the same colours. BGR says "how much blue, green and red". HSV says "which colour, how rich, how bright". The second is far easier when the job is "find everything that is green".

## The common colour spaces

`cv.cvtColor(img, code)` converts a picture from one space to another. The code names the direction, such as `COLOR_BGR2GRAY`, and every conversion has a way back (`COLOR_HSV2BGR`).

| Code | Result | Use it for |
|---|---|---|
| `cv.COLOR_BGR2GRAY` | One channel of brightness | Edges, contours, thresholds |
| `cv.COLOR_BGR2HSV` | Hue, saturation, value | Finding a particular colour |
| `cv.COLOR_BGR2LAB` | Lightness plus two colour axes | Comparing how different two colours look |
| `cv.COLOR_BGR2RGB` | Red and blue swapped to the usual order | Showing the image with matplotlib |

```python
gray = cv.cvtColor(img, cv.COLOR_BGR2GRAY)   # grayscale
hsv  = cv.cvtColor(img, cv.COLOR_BGR2HSV)    # for colour tracking
bgr  = cv.cvtColor(hsv, cv.COLOR_HSV2BGR)    # and back again
```

Matplotlib expects RGB, so passing it a raw OpenCV image swaps red and blue (skin turns blue, the sky turns orange). Convert with `COLOR_BGR2RGB` first.

## Why HSV is the one for finding a colour

In BGR, "green" is a recipe of three numbers that all move when the light changes. A green leaf in the shade and in the sun have very different B, G and R values. HSV splits the problem into three clean questions:

| Channel | Meaning | OpenCV range |
|---|---|---|
| H (hue) | Which colour: red, yellow, green, blue... around a wheel | 0 to 179 |
| S (saturation) | How rich the colour is, from washed out to vivid | 0 to 255 |
| V (value) | How bright it is, from black to full | 0 to 255 |

> [!warn] OpenCV packs HSV into one byte per channel, so hue only goes up to **179**, not 360. If a colour picker gives you a hue in degrees, divide it by 2 before using it.

> [!compare] Think of it like describing a paint tin. "Green, but pale and dark" is three separate ideas: the colour (hue), how much pigment (saturation) and how much light (value). Shade only changes the last one, so the hue still says "green".

## Keep only the colours you want

`cv.inRange(hsv, lower, upper)` returns a **mask**: a black-and-white picture where white means "this pixel is inside my range". Drag the sliders below to keep green, then try yellow or blue.

```widget
hsvmask
```

```python
hsv  = cv.cvtColor(img, cv.COLOR_BGR2HSV)
mask = cv.inRange(hsv, np.array([35, 50, 50]), np.array([85, 255, 255]))   # green
```

The mask on its own only says where the colour is. The next chapters use it with bitwise operations to cut the colour out of the original picture, and to combine several colours at once (for example white, yellow and green for lane lines).

### Several colours at once, live

This is `hsv_multi_color_mask_webcam.py`: three masks (white, yellow and green) joined with `bitwise_or` and applied to every webcam frame.

```python
capture = cv.VideoCapture(0)
while capture.isOpened():
    ret, frame = capture.read()
    if not ret:
        break
    hsv = cv.cvtColor(frame, cv.COLOR_BGR2HSV)

    white_mask  = cv.inRange(hsv, np.array([0, 0, 200]),   np.array([180, 40, 255]))
    mask_yellow = cv.inRange(hsv, np.array([20, 100, 100]), np.array([32, 255, 255]))
    green_mask  = cv.inRange(hsv, np.array([35, 50, 50]),   np.array([85, 255, 255]))

    pre    = cv.bitwise_or(mask_yellow, green_mask)
    pre2   = cv.bitwise_or(pre, white_mask)             # yellow OR green OR white
    result = cv.bitwise_and(frame, frame, mask=pre2)

    cv.imshow('Frame', result)
    if cv.waitKey(33) & 0xFF == ord('d'):
        break
capture.release()
cv.destroyAllWindows()
```

White has a very low saturation (almost no colour) and a high value, so its range is `[0, 0, 200]` to `[180, 40, 255]`: any hue, but only the pale, bright pixels.

## Colour channels: take a picture apart

A colour image is three stacked greyscale layers. `cv.split(img)` pulls them apart into `b, g, r`, each a black-and-white map of how much of that colour there is (bright means a lot). `cv.merge([b, g, r])` puts them back, and the order must stay blue, green, red.

```python
b, g, r = cv.split(img)
blank = np.zeros(img.shape[:2], dtype='uint8')
blue_only = cv.merge([b, blank, blank])   # see blue in its own colour
```

## Try it

1. A colour picker says a leaf is at hue 120° out of 360. What hue should go into OpenCV?
2. Why does the same green object give very different BGR values in sun and shade, but a similar hue?
3. In the widget, set S min to 255. What happens to the mask and why?
4. You show an OpenCV photo with matplotlib and the sky looks orange. What one line fixes it?

## Quick recap

| Tool | Real-life picture | What it does |
|---|---|---|
| `cvtColor` | Translating a sentence into another language | Writes the same picture in another colour space |
| HSV | "Green, pale, dark" as three separate ideas | Splits colour into hue, saturation and value |
| Hue 0 to 179 | A colour wheel squeezed into one byte | OpenCV's half-size hue scale |
| `inRange` | A sieve that only lets one colour through | Builds a black-and-white mask of the pixels in range |
| `split` / `merge` | Separating and restacking transparencies | Pulls a picture into B, G, R layers and back |
