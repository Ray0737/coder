---
title: Haar cascades
summary: A fast, classic face finder: slide a window over the picture and keep only the spots that many tests agree on.
---

> [!aha] A Haar cascade does not "understand" faces. It slides a small window over the picture and runs a chain of quick yes/no tests ("is the eye region darker than the cheeks?"). A window that passes every test is called a face.

## What a cascade is

A **Haar cascade** is a classic, pre-trained face detector. Someone trained it on thousands of face and not-face pictures, and saved the result as an `.xml` file. You load the file, and OpenCV does the scanning. Your folder has `haarcascade_frontalface_default.xml` for faces and an eyes one for eyes.

> [!compare] Think of it like a security guard checking tickets through a series of gates. The first gate rejects most people instantly with a quick look, and only those who pass reach the next, stricter gate. A window that gets through every gate is let in as a face. Most of the picture is thrown out at gate one, which is why it is so fast.

```cta
github-logo | Get the cascade files | The ready-made .xml files (faces, eyes, smiles and more) that ship with OpenCV.
Haar cascades on GitHub | https://github.com/opencv/opencv/tree/4.x/data/haarcascades | The official folder of pre-trained cascades
```

```python
face_cascade = cv.CascadeClassifier('haarcascade_frontalface_default.xml')
gray  = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)          # cascades want grayscale
faces = face_cascade.detectMultiScale(gray, 1.3, 5)    # scaleFactor, minNeighbors

for (x, y, w, h) in faces:                             # one box per face
    cv.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
```

It returns a list of `(x, y, w, h)` boxes, one per detected face: the top-left corner, then width and height.

## What one of its tests looks like

Each yes/no test in the cascade is a **Haar feature**: a few rectangles on the window, some light and some dark. The test adds up the pixel brightness under the light rectangles, subtracts the brightness under the dark ones, and checks whether the **difference** is big enough. A face has predictable light and dark regions: the eyes sit in a darker band than the forehead and cheeks, and the bridge of the nose is lighter than the eyes either side. So an "edge" feature laid across the eyes gives a big difference on a face and a small one on, say, a wall. Slide the feature over the pixel face below and watch the number.

```widget
haarfeature
```

One feature on its own is a weak clue. The idea behind OpenCV's cascades, from Viola and Jones in 2001, is to **chain** thousands of these tests and let training choose which ones matter. Early gates use a few cheap features to throw most windows away. Only windows that pass them reach the later, stricter ones, which is the "cascade" in the name.

> [!aha] A Haar feature is just "sum of the light part minus sum of the dark part". No curves, no shapes, only arithmetic on pixel brightness, repeated very fast over every window.

## The two settings that matter

| Setting | What it controls | Too low | Too high |
|---|---|---|---|
| `scaleFactor` (e.g. 1.3) | How much the picture shrinks between scans, so faces of different sizes fit the window | Slow, many tiny steps | Fast, but can skip a face size |
| `minNeighbors` (e.g. 5) | How many overlapping hits must agree before a spot counts | Stray spots become false faces | Real faces get thrown away |

A real face triggers many overlapping hits at slightly different positions and sizes. A stray patch that merely looks a bit face-like triggers only one or two. So `minNeighbors` is a **vote threshold**: the bar chart counts the hits at each spot, and any bar below the dashed line is thrown away. Raise it and the strays go first, then the real face. The `scaleFactor` slider changes how many window sizes are tried, which changes how many votes every spot collects.

```widget
haardiagram
```

## Beyond a rectangle: masks

A box is only the start. Draw a filled ellipse onto a black mask at each face, then use the bitwise operations from the last chapter:

```python
mask = np.zeros(frame.shape[:2], dtype=np.uint8)
for x, y, w, h in faces:
    cv.ellipse(mask, (x + w // 2, y + h // 2), (w // 2, h // 2), 0, 0, 360, 255, -1)

show_only_face = cv.bitwise_and(frame, frame, mask=mask)
hide_face      = cv.bitwise_and(frame, frame, mask=cv.bitwise_not(mask))
```

Your folder has both: `face_mask_show_only_webcam.py` shows only the face, and `face_hide_webcam.py` blanks the face and shows everything else. Eyes work the same way with the eye cascade, usually searched only inside each face box.

### Eyes inside the face

Searching for eyes in the whole frame finds false ones. Cut out each face first, then search only inside it:

```python
eye_cascade = cv.CascadeClassifier('haarcascade_eye_tree_eyeglasses.xml')
for (x, y, w, h) in faces:
    roi_gray  = gray[y:y + h, x:x + w]                 # the face, as a crop
    roi_color = frame[y:y + h, x:x + w]
    for (ex, ey, ew, eh) in eye_cascade.detectMultiScale(roi_gray):
        cv.rectangle(roi_color, (ex, ey), (ex + ew, ey + eh), (255, 0, 0), 2)
```

The eye positions come back **relative to the crop**, so drawing on `roi_color` puts the boxes in the right place on the full frame.

## Strengths and limits

Haar cascades are quick and need no GPU, so they run on a Raspberry Pi. They work best on **front-facing** faces in decent light, and they struggle with tilted heads, side views and strong shadows. That is the main reason people moved to learned detectors like YOLO.

## Try it

1. Why must the image be converted to grayscale before `detectMultiScale`?
2. In the widget, which `minNeighbors` value first removes the stray boxes? Which removes the real face? What does a smaller `scaleFactor` do to the bars?
3. In the pixel face, place the Edge feature across the eyes, then across the forehead. Which gives the bigger difference, and why?
4. What are the four numbers in each `(x, y, w, h)` box?
5. Which line shows only the face and blanks the rest? Which hides the face?

## Quick recap

| Tool | Real-life picture | What it does |
|---|---|---|
| Haar cascade | A guard with a series of ticket gates | A chain of quick tests that a window must all pass |
| Haar feature | Weighing the light part of a card against the dark part | Sum of light pixels minus sum of dark pixels |
| `detectMultiScale` | The guard walking the whole crowd | Scans the picture and returns face boxes |
| `scaleFactor` | Looking at the crowd from near and far | How much the picture shrinks between scans |
| `minNeighbors` | Several guards must all point at the same person | How many overlapping hits are needed to keep a face |
| Face mask | A stencil cut to the face's shape | Lets you show or hide just the face |
