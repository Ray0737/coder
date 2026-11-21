---
title: Object detection
summary: Finding what is in a picture and where: boxes, the loop every detector runs, and the three ways this course finds things.
---

> [!aha] Detection is more than "what is this?". A classifier looks at a whole picture and gives one answer. A **detector** finds every object in it and draws a box round each one, so you get *what* and *where* together.

## Classification versus detection

| Task | Question | What you get back |
|---|---|---|
| Classification | What is in this picture? | One label for the whole image: "cat" |
| Detection | What is in it, and where? | A box and a label for each object: "cat at (40, 60, 120, 90)", "dog at (200, 50, 140, 110)" |
| Recognition | Whose is it? | A name for a detected object, such as a specific person's face |

A **bounding box** is the rectangle round an object. It is written either as `(x, y, w, h)`, which is the top-left corner plus width and height (Haar cascades), or as two corners `(x1, y1, x2, y2)` (YOLO).

> [!compare] Think of it like a lifeguard's report. A classifier says "there are swimmers on the beach". A detector says "swimmer, left, by the red flag; swimmer, centre; dog, right". The second one is the report you can act on.

## Three ways to find an object

Your course finds objects in three different ways, from simplest to most flexible:

| Way | How it finds things | Good for | Weak at |
|---|---|---|---|
| Colour | Mask the colour, then outline the white blob | A brightly coloured ball or card on a plain background | Anything where the colour changes with the light, or two objects share a colour |
| Haar cascade | Slides a window and runs quick yes/no tests | Front-facing faces, fast and light | Tilted or side-on views |
| YOLO | A neural network looks at the whole frame once | Many kinds of object at once | Needs training pictures and more computing power |

### Finding an object by its colour

The colour route is already in your toolbox. Mask the colour with `inRange` (Color spaces chapter), then use `findContours` (Contours chapter) to turn the white blob into a box.

```python
hsv  = cv.cvtColor(frame, cv.COLOR_BGR2HSV)
mask = cv.inRange(hsv, np.array([35, 50, 50]), np.array([85, 255, 255]))   # green

contours, _ = cv.findContours(mask, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
for c in contours:
    if cv.contourArea(c) > 500:                     # ignore tiny specks
        x, y, w, h = cv.boundingRect(c)             # box round the blob
        cv.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
```

The area check matters. Noise leaves a few stray white dots, and without it every dot gets its own box. This is the same "mask, then locate" idea as the `hsv_multi_color_mask_webcam.py` lesson, with a box added at the end.

## Every detector runs the same loop

Whichever way you choose, the loop around it is the same:

1. **Frame in:** grab the next picture from the webcam or the video file. Everything after this happens once per frame. `ret, frame = cap.read()`
2. **Prepare:** make the picture easy to read. Use grayscale for a Haar cascade, or leave it in colour for YOLO. Shrinking the frame here makes everything faster. `gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)`
3. **Detect:** the detector scans the frame and returns a list of boxes. A cascade gives `(x, y, w, h)`, and YOLO gives corners plus a class and a confidence. `faces = cascade.detectMultiScale(gray, 1.3, 5)`
4. **Filter:** drop the weak ones. Raise `minNeighbors` for a cascade, or raise `conf` for YOLO, until the false boxes go away. `results = model(frame, conf=0.5)`
5. **Draw or act:** put the result to use. Draw the boxes, count them, print the names, or trigger something such as a servo or an LCD message. `cv.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)`
6. **Show, then repeat:** display the frame and check for the quit key, then go back to step 1 for the next frame. `cv.imshow("Detection", frame)`

## How good is a box? Intersection over union

How do you score a detector? You compare its box with the correct one by the **overlap** between them, divided by the area they cover together, called **IoU** (intersection over union). It runs from 0 (no overlap) to 1 (a perfect match). Slide the predicted box over the real one and watch the number.

```widget
iouviz
```

A detection counts as correct when its IoU with the real box is high enough, commonly 0.5 or more. It is also the reason a box that is the right size but a little off to one side still scores badly: overlap, not size, is what counts.

## Try it

1. A photo has three cats and a dog. What does a classifier return, and what does a detector return?
2. A box is `(x, y, w, h) = (40, 60, 100, 80)`. What are its two corners?
3. In the colour code, why is there a `contourArea(c) > 500` check?
4. A predicted box is exactly the right size but sits halfway off the real one. Will its IoU be close to 1 or closer to 0.3? Try it in the widget.

## Quick recap

| Tool | Real-life picture | What it does |
|---|---|---|
| Classification | "There are swimmers on the beach" | One label for the whole picture |
| Detection | "Swimmer left, swimmer centre, dog right" | A box and a label for every object |
| Bounding box | A rectangle drawn round the object | Where the object is: `(x, y, w, h)` or two corners |
| Colour detection | Spotting the one red umbrella | Mask a colour, outline the blob |
| IoU | How much two stickers overlap | Overlap divided by combined area, 0 to 1 |
