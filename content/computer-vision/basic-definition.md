---
title: Basic definition
summary: What computer vision is, why a picture is just a grid of numbers, and the four steps almost every vision program follows.
---

> [!aha] A computer does not see a picture. It sees a grid of numbers. Computer vision is the craft of turning that grid into an answer: "there is a face here", "that ball is red", "the lane curves left".

## What is computer vision?

**Computer vision** is getting a computer to pull meaning out of images and video: finding things, measuring them, tracking them, or deciding what to do next. Your eyes and brain do this so easily that it is hard to see how much work it is. A camera only hands over brightness values, and everything else has to be built on top.

| A person looking at a photo | A computer looking at the same photo |
|---|---|
| Sees a friend straight away | Sees thousands of numbers and has to work out which ones belong to a face |
| Copes with shadows, angles and a new haircut | Can be fooled by a small change in light or angle unless it was built to cope |
| Understands what the scene *means* | Only finds what it was told or taught to look for |

## A picture is a grid of numbers

A digital image is a grid of tiny squares called **pixels**. In a greyscale image each pixel is one number from 0 (black) to 255 (white). Change a number and that square changes shade. Click the pixels below and watch.

```widget
pixelgrid
```

> [!compare] Think of it like a mosaic made of coloured tiles. From across the room you see a picture. Up close, each tile is just one colour, and the picture only exists in how the tiles sit together.

> [!more] TLDR: colour images and video
> A colour image keeps **three** numbers per pixel, one each for blue, green and red, called **channels**. So a 480 × 640 colour photo is a block of numbers with shape `(480, 640, 3)`: 480 rows, 640 columns, 3 channels. A video is the same thing repeated: a stream of images called **frames**, often 30 every second.

## The four steps almost every vision program follows

Whatever the project, most vision programs run the same loop, and the rest of this course walks along it with **OpenCV**, a free library for Python, starting with how to read a picture and ending with detectors that find faces and objects in a live camera. The Raspberry Pi course then puts the same ideas on a small board that drives real hardware.

| Step | What happens | Example |
|---|---|---|
| 1. Capture | Get an image or a video frame | Read a file, or grab a frame from the webcam |
| 2. Prepare | Make it easier to work with | Shrink it, crop it, change colour space, blur away noise |
| 3. Find | Pick out what you care about | Edges, a colour, a face, an object |
| 4. Act | Use the result | Draw a box, count things, move a servo |

## Is computer vision machine learning?

**Not always.** Computer vision is the *goal*: getting meaning out of pictures. Machine learning is one *method* for reaching it. Some vision tools are hand-built rules, and some are learned from examples, so the two overlap but are not the same thing.

| Tool | Learned? | How it works |
|---|---|---|
| Colour masks, thresholds, edges | No | A fixed rule written by a person, such as "keep pixels in this colour range" |
| Haar cascades (face detection) | Yes | A classical model trained on many face and non-face pictures, then shipped as an `.xml` file |
| LBPH face recognition | Yes | You train it on your own captured faces, and it saves `classifier.xml` |
| YOLO (object detection) | Yes, deep learning | A neural network trained on thousands of labelled pictures |

> [!aha] Hand-built rules are fast and easy to explain, but they break when the light or angle changes. Learned models cope with the mess of the real world, but they need data to train on. Most real projects use both: rules to prepare the picture, a trained model to find things in it.

## Try it

1. A greyscale photo is 100 pixels wide and 80 tall. How many numbers is that? How many if it is in colour?
2. In the grid above, how would you make the smiley's eyes disappear? What number are you changing?
3. A webcam sends 30 frames per second at 640 × 480, in colour. Roughly how many numbers is that every second?
4. Name one thing a person does easily with a photo that is hard for a computer, and say why.
5. Is "keep only the green pixels" machine learning? Is a face detector? Explain the difference.

## Quick recap

| Tool | Real-life picture | What it does |
|---|---|---|
| Pixel | One tile of a mosaic | One brightness value (greyscale) or three colour values |
| Channel | One coloured transparency stacked with others | One layer of numbers: blue, green or red |
| Frame | One page of a flip-book | One image out of a video |
| `img.shape` | The size of the mosaic | (rows, columns, channels) |
| Capture, prepare, find, act | Look, tidy, spot, respond | The four steps most vision programs follow |
