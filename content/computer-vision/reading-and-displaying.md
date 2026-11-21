---
title: Reading and displaying
summary: Open an image or a webcam with OpenCV, show it in a window, and avoid the two mix-ups that catch every beginner.
---

> [!aha] An image in OpenCV is just a NumPy array. Once you have loaded it, everything else in this course is arithmetic on that array. The two gotchas to remember: colours are stored as **B, G, R** (not R, G, B), and positions come as **(row, column)** when you index but **(x, y)** when you draw.

## Show a picture in a window

Four functions do the job:

| Function | What it does |
|---|---|
| `cv.imread(path, flag)` | Loads the file into an array |
| `cv.imshow(name, img)` | Opens a window titled `name` and shows the array |
| `cv.waitKey(delay)` | Waits for a key press, and keeps the window alive while it waits |
| `cv.destroyAllWindows()` | Closes every OpenCV window |

```python
import cv2 as cv

img = cv.imread('assets/img.jpg', 1)   # 1 colour | 0 grey | -1 keep transparency
cv.imshow('Original Image', img)       # pop up a window
cv.waitKey(0)                          # 0 = wait forever for a key
cv.destroyAllWindows()                 # note the (): without it nothing closes
```

The second argument of `imread` chooses how to load: `1` for colour, `0` for greyscale, `-1` to keep the transparency channel too. `waitKey(0)` waits for ever, while `waitKey(20)` waits 20 milliseconds and carries on, which is what you want for video.

> [!warn] If you see `error -215: Assertion failed ... !_src.empty()`, the path is wrong. `imread` does not complain about a missing file, it quietly gives you nothing, and the next function chokes on it.

## Video is a loop of pictures

A video or webcam is read one frame at a time. `cv.VideoCapture(source)` takes a file path, or a number for a camera (`0` is the default webcam).

```python
capture = cv.VideoCapture('assets/Sequence 01.mp4')   # or 0 for the webcam

while True:
    isTrue, frame = capture.read()      # grab the next frame
    if not isTrue:                      # no frame left: the video ended
        break
    cv.imshow('Video Playback', frame)
    if cv.waitKey(20) & 0xFF == ord('d'):   # press d to quit early
        break

capture.release()                       # free the file or camera
cv.destroyAllWindows()
```

`capture.read()` hands back two things: `isTrue`, which is `False` once there are no more frames, and `frame`, which is an ordinary image array. So everything you can do to a picture, you can do to each frame of a video. The `& 0xFF` keeps only the last 8 bits of the key code so the comparison works on every system.

> [!compare] Think of it like a flip-book. `read()` turns one page. Showing each page for 20 milliseconds makes it look like movement, and `release()` puts the book back on the shelf so the next program can use the camera.

### Drawing on a live feed

Because each frame is an ordinary array, you can draw on it before showing it. This is `webcam_live_overlay.py`: a circle, a line, a border and a live clock on top of the webcam.

```python
from datetime import datetime

capture = cv.VideoCapture(0)
while capture.isOpened():
    ret, frame = capture.read()
    if ret:
        h, w = frame.shape[0], frame.shape[1]
        time_string = datetime.now().strftime("%H:%M:%S")

        cv.circle(frame, (w // 2, h // 2), 50, (0, 255, 0), thickness=-1)   # filled green circle
        cv.line(frame, (0, 0), (w, h), (0, 0, 255), 3)                      # red diagonal
        cv.rectangle(frame, (10, 10), (w - 10, h - 10), (255, 191, 0), thickness=20)
        cv.putText(frame, f'live: {time_string}', (40, 63),
                   cv.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 0), 2, cv.LINE_AA)

        cv.imshow('Frame', frame)
        if cv.waitKey(33) & 0xFF == ord('d'):
            break
    else:
        break
capture.release()
cv.destroyAllWindows()
```

Notice the colours are `(B, G, R)`, and that a `thickness` of `-1` fills the shape in. `cv.LINE_AA` smooths the text edges.

## Gotcha 1: the colour order is B, G, R

OpenCV was built when cameras reported blue first, so it stores each pixel as **(Blue, Green, Red)**. Every colour you pass to a drawing function uses the same order. Most other tools, including matplotlib, expect RGB. Mix a colour below and compare what you mean with what you see if the order is wrong.

```widget
bgrmix
```

## Gotcha 2: (row, column) or (x, y)?

An image array is indexed **row first**: `img[y, x]`, and `img.shape` is `(height, width, channels)`. The drawing and geometry functions, plus mouse positions, use **x first**. Mixing them up is the most common OpenCV bug.

| Where | Order | Example |
|---|---|---|
| Indexing and slicing | (row, column) = (y, x) | `img[50:200, 200:400]` |
| `img.shape` | (height, width, channels) | `(480, 640, 3)` |
| Drawing, mouse, `cv.resize` size | (x, y) / (width, height) | `cv.circle(img, (320, 240), 40, ...)` |

## The coordinate system: (0, 0) is the top-left

An image has its own coordinate system, and it is **not** the graph you drew in maths class. The origin, **(0, 0)**, is the **top-left** pixel. **x** counts columns going right, and **y** counts rows going **down**. So the bottom-right pixel of a 640 × 480 picture is (639, 479), not (639, 0). Hover and click the grid below, then flip to the maths graph to see the difference.

```widget
coordsys
```

> [!compare] Think of it like reading a page of text. You start at the top-left, go along the line (x), and move down to the next line (y). A maths graph is more like a map with north at the top, where going up means a bigger number. An image counts the way you read, so down means bigger.

For a 640 pixel wide, 480 pixel tall picture (`img.shape = (480, 640, 3)`), the four corners are:

| Corner | (x, y) for drawing | NumPy index | Why |
|---|---|---|---|
| Top-left | (0, 0) | `img[0, 0]` | The origin |
| Top-right | (639, 0) | `img[0, 639]` | x runs 0 to width - 1 |
| Bottom-left | (0, 479) | `img[479, 0]` | y runs 0 to height - 1 |
| Bottom-right | (639, 479) | `img[479, 639]` | The last pixel in both directions |

The last valid number is always one less than the size, because counting starts at 0. A 640-wide picture has x values 0 to 639, and asking for x = 640 is an error.

## Try it

1. What does `cv.imread('photo.jpg', 0)` give you, compared with `cv.imread('photo.jpg', 1)`?
2. Why does `cv.waitKey(0)` suit a photo but `cv.waitKey(20)` suit a video?
3. A pixel reads `(255, 0, 0)` in OpenCV. What colour is it? What colour would matplotlib show if you forgot to convert?
4. A frame has shape `(480, 640, 3)`. Is it 480 wide or 480 tall? Which one is the x range?
5. What are the (x, y) coordinates of the bottom-right pixel of a 1280 × 720 image? Write the NumPy index for the same pixel.
6. On a maths graph, (3, 8) is high up. In an OpenCV image, is (3, 8) high up or low down? Check with the widget.

## Quick recap

| Tool | Real-life picture | What it does |
|---|---|---|
| `imread` | Taking a photo out of the album | Loads a file into an array |
| `imshow` + `waitKey` | A picture frame that needs someone to hold it open | Shows the array in a window and waits |
| `VideoCapture` + `read` | Turning the pages of a flip-book | Hands over one frame each call |
| `release` | Putting the book back | Frees the file or camera |
| BGR order | A mailing label that lists the postcode first | OpenCV stores blue, green, red |
| (row, column) vs (x, y) | Spreadsheet cell versus map coordinates | Indexing is y first, drawing is x first |
| Origin (0, 0) | The first letter on a page | The top-left pixel, with y growing downward |
