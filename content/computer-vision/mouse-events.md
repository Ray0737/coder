---
title: Mouse events
summary: Make an OpenCV window react to clicks and movement with a callback function.
---

> [!aha] You never ask OpenCV "has the mouse moved?". You hand it a function once, and OpenCV calls that function for you every time something happens over the window. That "call me when it happens" idea is called a **callback**.

## The callback

`cv.setMouseCallback(window_name, callback)` attaches your function to a window. OpenCV then calls it with exactly five arguments, in this order, every time the mouse does anything over that window. `flags` and `param` are often unused, but they must stay in the function's signature or OpenCV cannot call it.

| Argument | What it holds |
|---|---|
| `event` | Which action happened, as a `cv.EVENT_*` constant |
| `x, y` | Where the mouse is, in pixels, as (x, y) |
| `flags` | Which buttons or modifier keys (Ctrl, Shift) are held |
| `param` | Anything extra you passed to `setMouseCallback` |

> [!compare] Think of it like leaving your phone number with a shop. You do not stand at the counter asking "is my order ready?" every minute. The shop rings you the moment something happens, and tells you what it was.

The events you will use most are below. Try it on the picture further down: move the mouse, then left and right click, and watch what the callback would receive.

| Constant | When it fires |
|---|---|
| `cv.EVENT_MOUSEMOVE` | The mouse moved |
| `cv.EVENT_LBUTTONDOWN` / `LBUTTONUP` | Left button pressed / released |
| `cv.EVENT_RBUTTONDOWN` | Right button pressed |
| `cv.EVENT_MBUTTONDOWN` | Middle button pressed |
| `cv.EVENT_LBUTTONDBLCLK` | Left double-click |

```widget
mouseclick
```

## A click-to-draw program

Three things have to happen in this order: show the window (it must exist), attach the callback, then call `waitKey`. Without `waitKey` the program ends instantly and no event ever arrives.

```python
canvas = cv.imread('assets/img.jpg', 1)
WINDOW = 'Click to draw'

def on_mouse(event, x, y, flags, param):
    if event == cv.EVENT_LBUTTONDOWN:                  # left click
        cv.circle(canvas, (x, y), 6, (0, 255, 0), thickness=-1)   # green dot
        cv.imshow(WINDOW, canvas)                      # redraw so it shows
        print(f'click at ({x}, {y})')

cv.imshow(WINDOW, canvas)                # the window must exist first
cv.setMouseCallback(WINDOW, on_mouse)    # then attach the callback
cv.waitKey(0)                            # keeps the window alive for events
cv.destroyAllWindows()
```

> [!more] TLDR: where else this pattern is used
> The same idea builds the shape-drawing exercises in your folder: a rectangle starts on `LBUTTONDOWN`, grows on `MOUSEMOVE` and finishes on `LBUTTONUP`. A pixel colour picker reads `img[y, x]` inside the callback.

> [!warn] The `x, y` the callback receives are in (x, y) order, but indexing the image takes (row, column). To read the colour under the mouse, write `img[y, x]`, not `img[x, y]`.

## Try it

1. Which two arguments in the callback signature do you often not use, and why must they still be there?
2. What happens if you attach the callback before calling `cv.imshow`?
3. Sketch the events you would listen for to draw a rectangle by dragging the mouse.
4. The mouse is at x = 200, y = 50. Write the code that reads the colour of the pixel under it.

## Quick recap

| Tool | Real-life picture | What it does |
|---|---|---|
| Callback | Leaving your number with the shop | A function OpenCV calls when something happens |
| `setMouseCallback` | Handing over the number | Attaches your function to a window |
| `event` | "Your order is ready" versus "your order is delayed" | Says which action happened |
| `x, y` | A map reference | Where the mouse is, in pixels |
| `waitKey` | Staying by the phone | Keeps the window alive so events can arrive |
