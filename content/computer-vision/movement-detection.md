---
title: Movement detection
summary: Spot movement by comparing each frame with the one before it: whatever changed is whatever moved.
---

> [!aha] A camera never "sees" movement. It only ever sees one still frame after another. Movement is the *difference* between two of them. Subtract the last frame from this one, and the only pixels left are the ones that changed.

## The idea: subtract the last frame

If nothing moves, two frames in a row are almost identical, so their difference is almost zero everywhere. If a ball rolls across the picture, the pixels where it **was** and where it **is now** change a lot, and everything else stays still. That leftover is a map of the movement. The steps below use tools you already know, and in the diagram you can move the ball between frames: the right-hand picture is the difference, and lowering the threshold makes camera noise start to look like movement.

> [!compare] Think of it like the "spot the difference" puzzle where you hold two photos on top of each other. Anything that is the same disappears, and only what moved sticks out.

| Step | Function | Why |
|---|---|---|
| 1 | `cvtColor` to grey, then `GaussianBlur` | One channel, and the blur stops camera noise looking like movement |
| 2 | `cv.absdiff(prev, gray)` | How much each pixel changed, as a positive number |
| 3 | `cv.threshold(diff, 25, 255, THRESH_BINARY)` | Pixels that changed a lot become white, the rest black |
| 4 | `cv.dilate(thresh, None, iterations=2)` | Fill small gaps so one moving thing is one blob |
| 5 | `findContours`, then a size check | One contour per moving object, ignoring specks |
| 6 | `boundingRect` and `rectangle` | Draw a box round each one |

```widget
motiondiff
```

## The code

> [!more] Code: the full movement loop
> Two details are easy to miss. On the first frame there is no "previous" yet, so the loop stores it and moves on. And the last line, `prev = gray`, makes sure each frame is compared with the one just before it.
>
> ```python
> cap = cv.VideoCapture(0)
> prev = None
>
> while True:
>     ret, frame = cap.read()
>     if not ret:
>         break
>
>     gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)
>     gray = cv.GaussianBlur(gray, (21, 21), 0)          # smooth away noise
>
>     if prev is None:                                   # first frame: nothing to compare yet
>         prev = gray
>         continue
>
>     diff   = cv.absdiff(prev, gray)                    # |this frame - last frame|
>     thresh = cv.threshold(diff, 25, 255, cv.THRESH_BINARY)[1]
>     thresh = cv.dilate(thresh, None, iterations=2)
>
>     contours, _ = cv.findContours(thresh, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
>     moving = False
>     for c in contours:
>         if cv.contourArea(c) < 500:                    # too small: noise
>             continue
>         x, y, w, h = cv.boundingRect(c)
>         cv.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
>         moving = True
>
>     cv.putText(frame, 'MOVING' if moving else 'still', (10, 30),
>                cv.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
>     cv.imshow('Movement', frame)
>     prev = gray                                        # this frame is next time's "last frame"
>     if cv.waitKey(30) & 0xFF == ord('q'):
>         break
>
> cap.release()
> cv.destroyAllWindows()
> ```

> [!warn] A light switching on, a camera adjusting its exposure or a curtain waving all change a lot of pixels without anything "moving". Frame differencing only knows that something changed, not what. For a sunlit room, a background model works better (below).

## Two ways to compare

| Method | Compares with | Good at | Weak at |
|---|---|---|---|
| Frame differencing (above) | The frame just before | Fast, simple, ignores slow lighting drift | An object that stops moving vanishes; a slow mover leaves a thin outline |
| Background subtraction | A learned model of the empty scene | Finds things that arrive and then stay still | Needs a moment to learn, and is thrown by big lighting changes |

OpenCV has a ready-made background model: `cv.createBackgroundSubtractorMOG2()`. Call `.apply(frame)` on each frame and it returns the foreground mask directly, replacing steps 2 and 3.

```python
subtractor = cv.createBackgroundSubtractorMOG2()
mask = subtractor.apply(frame)          # white = foreground (not part of the learned background)
```

## Try it

1. Why does the program skip the very first frame?
2. In the widget, drag "Last frame was" to 0. Why does the difference go black?
3. Why does turning the room lights on make a bad movement detector?
4. Why is `prev = gray` the last line in the loop and not the first?

## Quick recap

| Tool | Real-life picture | What it does |
|---|---|---|
| `absdiff` | Laying two photos on top of each other | How much each pixel changed between frames |
| Threshold | A pass mark on how much change counts | Keeps only big changes as white |
| `dilate` | Joining nearby dots | Merges small gaps into one blob |
| Area check | Ignoring dust specks | Skips contours smaller than a set size |
| `prev = gray` | Remembering last frame for next time | Each frame is compared with the one before |
| Background subtraction | Learning what the empty room looks like | Flags anything that is not part of it |
