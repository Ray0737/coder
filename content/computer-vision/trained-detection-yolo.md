---
title: Trained detection (YOLO)
summary: One look at the picture, every object found: a neural network that draws boxes and names what is inside them.
---

> [!aha] **YOLO** stands for "You Only Look Once". Instead of sliding a window over the picture again and again, the network looks at the whole frame in a single pass and hands back every object's box, class and confidence together.

## What YOLO adds

A Haar cascade finds one kind of thing (a face), using a fixed chain of tests. YOLO is a **deep-learning** object detector: a neural network trained on thousands of labelled pictures, so it can find many kinds of object at once, such as cars, people or bikes. It is the same idea as the neural networks in the AI Development course, trained to answer "what is in this picture, and where?".

| | Haar cascade | YOLO |
|---|---|---|
| What it finds | One shape it was built for | Many classes of object |
| How it looks | Slides a window over the picture many times | One pass over the whole frame |
| Needs | An `.xml` file | A trained `.pt` weights file |
| Weak at | Tilted or side-on views | Needing training data and more computing power |

> [!compare] Think of it like a lifeguard scanning the whole beach at once and shouting "swimmer, left, there... dog, right... child, centre". They do not walk over the sand one square metre at a time. One sweep covers every object.

## Which YOLO? The model sizes

YOLO comes as a **family of sizes**, all with the same code and the same calls. The letter in the file name is the size: **n** (nano), **s** (small), **m** (medium), **l** (large) and **x** (extra large). Bigger models are more accurate, but they are slower and need more memory. Switch sizes below.

```widget
yolosizes
```

> [!compare] Think of it like cars. A nano model is a scooter: light, quick to start and happy on a small road, but it carries little. An extra-large model is a lorry: it carries a lot, but it needs a big road and a lot of fuel. Pick the smallest one that does the job.

## Reading a model file name

Your Pi scripts use `yolo11n.pt`, the nano model, because a Raspberry Pi has no GPU. Every part of the name tells you something, and the pretrained files were trained on **COCO**, a dataset of 80 everyday object classes (person, car, bottle and so on). That is why a pretrained YOLO can find a person or a car straight away, but has never heard of your own water bottle brand until you train it.

| Part | Meaning |
|---|---|
| `yolo11` | The version. `yolov8n.pt` is the older generation, `yolo11n.pt` the newer one |
| `n` | The size: nano, small, medium, large or extra large |
| `-pose`, `-seg`, `-cls` | A different task under the same naming: pose (body points), segmentation (an outline instead of a box) or classification. A detection model has no suffix, for example `yolo11n-pose.pt` |
| `.pt` | The saved weights file |

## What YOLO is good at, and what it is not

YOLO answers "what is in the picture and where?". It does not tell you what shape that thing is in, and for "where is each joint of this hand?" a different tool is better, which is MediaPipe in the next chapter.

| YOLO is good at | YOLO is weak at |
|---|---|
| Finding **many objects at once**, with a box and a class for each | Fine detail inside an object, such as the position of each finger joint |
| Objects **you train it on**: your own products, tools, boxes | Needing **labelled pictures and training time** for anything custom |
| Speed: one pass over the frame, so it can run live | Small or far-away objects, especially on the nano model |
| Everyday classes straight out of the box (people, cars, bottles) | Running on very small hardware unless you use a small model and a small `imgsz` |

## Using a trained model

YOLO runs through the `ultralytics` package. Every detection in `results[0].boxes` carries three things: `box.cls` (the class number, turned into a name with `model.names[...]`), `box.conf` (the confidence from 0 to 1) and `box.xyxy` (the two corners of the box). `conf=0.5` throws away anything the model is less than 50% sure of, and `imgsz=320` sets the working resolution, where **smaller is faster but less accurate** and 320 is a common choice for real-time use on a CPU such as a Raspberry Pi.

```python
import cv2 as cv
from ultralytics import YOLO

model = YOLO('best.pt')                  # your own weights, or 'yolo11n.pt' (downloads itself)

cap = cv.VideoCapture(0)
while cap.isOpened():
    ret, frame = cap.read()
    results = model(frame, conf=0.5, imgsz=320, verbose=False)
    for box in results[0].boxes:
        x1, y1, x2, y2 = map(int, box.xyxy[0])        # box corners in pixels
        cv.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 1)
    cv.imshow('YOLO', frame)
    if cv.waitKey(1) & 0xFF == ord('q'):
        break
cap.release()
cv.destroyAllWindows()
```

## The confidence cut-off

Move the confidence cut-off and see which boxes survive. It is a trade, not a score to maximise.

```widget
yolobox
```

> [!aha] Confidence is a trade, not a score to maximise. Set it low and you catch more real objects but also more false boxes. Set it high and the boxes you see are trustworthy, but real objects get missed.

## Training your own detector

Fine-tuning starts from a pretrained model and teaches it your own classes. `data` points to a `data.yaml` that lists the training and validation image folders and the class names, and a Roboflow export in "YOLOv11" format works directly. `epochs` is how many full passes over the data, `imgsz` is the training resolution (bigger is more accurate but slower) and `batch` is how many images per step, limited by your memory. Training ends by writing `runs/detect/train/weights/best.pt`, the file you load for detection.

```python
from ultralytics import YOLO

model = YOLO('yolo11n.pt')
model.train(data='vehicles-openimages/data.yaml', epochs=30, imgsz=640, batch=4)
```

## The vehicle example in your folder

Your folder's `train_vehicle_detector.py` does exactly this for vehicles. The dataset is too big to ship with the code, so export it from Roboflow into a `vehicles-openimages/` folder next to the script first.

## Try it

1. What is the main difference between how a Haar cascade and YOLO scan a picture?
2. In the diagram, which confidence value keeps only the single surest detection? Which value shows a false box but still misses real objects?
3. Why is `imgsz=320` a good choice on a Raspberry Pi, and what is the cost?
   Also: which model size would you pick for the Pi, and why?
4. What file does training produce, and how do you use it afterwards?

## Quick recap

| Tool | Real-life picture | What it does |
|---|---|---|
| YOLO | A lifeguard scanning the whole beach at once | Finds every object in one pass |
| `conf` | How sure you must be before you shout | Drops detections below this confidence |
| `imgsz` | How closely you squint at the picture | Working resolution: smaller is faster, less accurate |
| `box.xyxy` | The two opposite corners of a drawn rectangle | Where the object is, in pixels |
| `model.train` | Teaching the lifeguard your own beach | Fine-tunes a model on your labelled pictures |
| `best.pt` | The lifeguard's trained eye | The saved result of training |
| n / s / m / l / x | Scooter up to lorry | Model sizes: bigger is more accurate, but slower and heavier |
