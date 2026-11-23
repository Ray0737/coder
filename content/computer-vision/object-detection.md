---
title: Object detection
summary: Finding what is in a picture and where: boxes, the loop every detector runs, and the three ways this course finds things.
---

> [!aha] Detection is more than "what is this?". A classifier looks at a whole picture and gives one answer. A **detector** finds every object in it and draws a box round each one, so you get *what* and *where* together.

## Classification versus detection

A classifier answers one question about a whole picture, while a detector answers it for every object in the picture, and recognition goes one step further and names who or what a detected object is.

| Task | Question | What you get back |
|---|---|---|
| Classification | What is in this picture? | One label for the whole image: "cat" |
| Detection | What is in it, and where? | A box and a label for each object: "cat at (40, 60, 120, 90)", "dog at (200, 50, 140, 110)" |
| Recognition | Whose is it? | A name for a detected object, such as a specific person's face |

> [!compare] Think of it like a lifeguard's report. A classifier says "there are swimmers on the beach". A detector says "swimmer, left, by the red flag; swimmer, centre; dog, right". The second one is the report you can act on.

## The bounding box

A **bounding box** is the rectangle round an object. It is written either as `(x, y, w, h)`, which is the top-left corner plus width and height (Haar cascades), or as two corners `(x1, y1, x2, y2)` (YOLO), and you can always convert one into the other.

```python
x, y, w, h = 40, 60, 100, 80                 # corner plus size (Haar cascade style)
x1, y1, x2, y2 = x, y, x + w, y + h          # the same box as two corners (YOLO style)
```

## Three ways to find an object

Your course finds objects in three different ways, from simplest to most flexible. The colour route needs no training at all, a Haar cascade is a small trained model for faces, and YOLO is a neural network that handles many kinds of object.

| Way | How it finds things | Good for | Weak at |
|---|---|---|---|
| Colour | Mask the colour, then outline the white blob | A brightly coloured ball or card on a plain background | Anything where the colour changes with the light, or two objects share a colour |
| Haar cascade | Slides a window and runs quick yes/no tests | Front-facing faces, fast and light | Tilted or side-on views |
| YOLO | A neural network looks at the whole frame once | Many kinds of object at once | Needs training pictures and more computing power |

## Finding an object by its colour

The colour route is already in your toolbox. Mask the colour with `inRange` (Color spaces chapter), then use `findContours` (Contours chapter) to turn the white blob into a box. The area check matters: noise leaves a few stray white dots, and without it every dot gets its own box. This is the same "mask, then locate" idea as the `hsv_multi_color_mask_webcam.py` lesson, with a box added at the end.

```python
import cv2 as cv
import numpy as np

hsv  = cv.cvtColor(frame, cv.COLOR_BGR2HSV)
mask = cv.inRange(hsv, np.array([35, 50, 50]), np.array([85, 255, 255]))   # green

contours, _ = cv.findContours(mask, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
for c in contours:
    if cv.contourArea(c) > 500:                     # ignore tiny specks
        x, y, w, h = cv.boundingRect(c)             # box round the blob
        cv.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
```

## From pixels to a trained model

When a classic (non-deep) model learns from pictures, the work happens in four stages. This is called the **preprocessing, feature extraction and training pipeline**, and the stages run in the order of the table.

| Stage | What happens |
|---|---|
| 1. Preprocess | Clean the picture so every example looks alike. Convert it to grayscale with `cvtColor`, blur it with `GaussianBlur` to remove noise, and resize it to one standard size |
| 2. Extract features | Turn the cleaned picture into numbers that describe it. That might be edges from `Canny`, outlines from `findContours`, a colour mask, or a histogram of local patterns like LBPH uses |
| 3. Train | Give those feature numbers and their labels to a model, such as an SVM or k-nearest-neighbours, and let it learn which features go with which label |
| 4. Predict | Run new pictures through the *same* preprocessing and feature steps, then ask the trained model for an answer |

> [!more] TLDR: same cleaning twice, and where deep learning fits
> The same cleaning has to happen at training time and at prediction time, or the model sees numbers it was never taught. A deep-learning model such as YOLO skips stage 2, because the network learns its own features from the raw picture.
>
> Learned vision is the same idea as the neural networks in the AI Development course. In fact, the CNN chapter there is the model family behind most modern image recognition.

## Every detector runs the same loop

Whichever way you choose, the loop around it is the same: grab a frame, prepare it, detect, filter out the weak boxes, act on the rest, and repeat. Everything below happens once per frame.

| Step | What happens | Example |
|---|---|---|
| 1. Frame in | Grab the next picture from the webcam or the video file | `ret, frame = cap.read()` |
| 2. Prepare | Make the picture easy to read: grayscale for a Haar cascade, colour for YOLO, and shrink it to go faster | `gray = cv.cvtColor(frame, cv.COLOR_BGR2GRAY)` |
| 3. Detect | The detector scans the frame and returns a list of boxes. A cascade gives `(x, y, w, h)`, and YOLO gives corners plus a class and a confidence | `faces = cascade.detectMultiScale(gray, 1.3, 5)` |
| 4. Filter | Drop the weak ones: raise `minNeighbors` for a cascade, or `conf` for YOLO, until the false boxes go away | `results = model(frame, conf=0.5)` |
| 5. Draw or act | Draw the boxes, count them, print the names, or trigger something such as a servo or an LCD message | `cv.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)` |
| 6. Show, repeat | Display the frame and check for the quit key, then go back to step 1 | `cv.imshow("Detection", frame)` |

## How good is a box? Intersection over union

How do you score a detector? You compare its box with the correct one by the **overlap** between them, divided by the area they cover together, called **IoU** (intersection over union). It runs from 0 (no overlap) to 1 (a perfect match). Slide the predicted box over the real one and watch the number. A detection counts as correct when its IoU with the real box is high enough, commonly 0.5 or more, which is why a box that is the right size but a little off to one side still scores badly: overlap, not size, is what counts.

```widget
iouviz
```

## Try it

1. A photo has three cats and a dog. What does a classifier return, and what does a detector return?
2. A box is `(x, y, w, h) = (40, 60, 100, 80)`. What are its two corners?
3. In the colour code, why is there a `contourArea(c) > 500` check?
4. A predicted box is exactly the right size but sits halfway off the real one. Will its IoU be close to 1 or closer to 0.3? Try it in the widget.
5. Why must new pictures go through the same preprocessing as the training pictures before the model sees them?

## Quick recap

| Tool | Real-life picture | What it does |
|---|---|---|
| Classification | "There are swimmers on the beach" | One label for the whole picture |
| Detection | "Swimmer left, swimmer centre, dog right" | A box and a label for every object |
| Bounding box | A rectangle drawn round the object | Where the object is: `(x, y, w, h)` or two corners |
| Colour detection | Spotting the one red umbrella | Mask a colour, outline the blob |
| IoU | How much two stickers overlap | Overlap divided by combined area, 0 to 1 |
