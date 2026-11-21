---
title: YOLOv8 object detection
summary: Train a YOLO detector on your own pictures, then run it on the Pi's webcam and show what it sees on an LCD.
---

> [!aha] Object detection answers two questions in one go: *what* is in the picture, and *where*. Training teaches the model your own objects. After that, running it is just a loop: grab a frame, ask the model, read back the boxes.

The notes call this chapter YOLOv8, and the scripts in your `Code - Raspi` folder load `yolo11n.pt`, the newer small YOLO11 model. Both use the same `ultralytics` package and the same calls, so everything below works for either.

## The workflow

Click through the whole trip, from taking photos to a working detector.

```widget
yoloflow
```

## Your dataset

The box dataset in `Yolo_setup/box.v5i.yolov11/` was labelled and exported from Roboflow in YOLO format. It has **12 classes**: airpods max, box, boxing glove, mouse, pillow, pinkpillow, power bank, rubik, scissors, sushi, water bottle and wd-40. Its `data.yaml` lists the image folders and those names, and it is what you give to `train`.

> [!compare] Think of it like teaching a new recruit to spot things on a shelf. You show them hundreds of photos with each item circled and named (the labelled dataset), they practise for a while (epochs), and at the end they can point at an item and say what it is.

## Train on the Pi (`train_raspi.py`)

```python
from ultralytics import YOLO

model = YOLO("yolo11n.pt")                 # small pretrained starting point
results = model.train(
    data="Yolo_setup/box.v5i.yolov11/data.yaml",
    epochs=50,
    imgsz=320,
    batch=4,
    device="cpu",
    workers=2,
    name="box_detection_raspi",
)
print(f"Results and weights saved in: {results.save_dir}")
```

The settings are turned down on purpose compared with a PC run:

| Setting | PC version | On the Pi | Why |
|---|---|---|---|
| `device` | `0` (an NVIDIA GPU) | `"cpu"` | The Pi has no GPU to train with |
| `imgsz` | 640 | 320 | Less memory and compute |
| `batch` | 16 | 4 | The Pi has limited RAM |
| `workers` | 8 | 2 | The Pi has few CPU cores |
| `epochs` | 100 | 50 | CPU training is slow |

> [!warn] Training from scratch on a Pi CPU is for small experiments, not production. It is far slower than a GPU. For a real training run, train on a PC or in the cloud, then copy the finished `best.pt` to the Pi and only run detection there.

## Detect on the webcam, and show it on an LCD (`w7b.py`)

The exercise runs the trained `best.pt` on the webcam and prints the names of the detected objects on a 16×2 I2C LCD screen.

```python
import cv2 as cv
from ultralytics import YOLO
from rpi_lcd import LCD

model = YOLO("best.pt")
lcd = LCD()
cap = cv.VideoCapture(0)
cap.set(cv.CAP_PROP_FRAME_WIDTH, 320)
cap.set(cv.CAP_PROP_FRAME_HEIGHT, 240)
last_detected = set()
```

In the loop, every box becomes a drawn rectangle and a name in a set:

```python
results = model(frame, conf=0.5, imgsz=320, verbose=False)
detected = set()
for box in results[0].boxes:
    name = model.names[int(box.cls[0])]
    conf = float(box.conf[0])
    x1, y1, x2, y2 = map(int, box.xyxy[0])
    detected.add(name)
    cv.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 1)
    cv.putText(frame, f"{name} {conf:.2f}", (x1, max(y1 - 5, 0)),
               cv.FONT_HERSHEY_SIMPLEX, 0.4, (0, 255, 0), 1)
```

The LCD is only rewritten when the **set of names changes**. That avoids flicker and saves time, because writing to the screen is slow compared with a camera frame:

```python
if detected != last_detected:
    lcd.clear()
    if detected:
        lcd.text("Detected:", 1)
        lcd.text(", ".join(sorted(detected))[:16], 2)   # 16 columns wide
    else:
        lcd.text("Scanning...", 1)
    last_detected = detected
```

The LCD talks over I2C on the Pi's fixed SDA and SCL pins (GPIO2 and GPIO3). Switch I2C on once with `sudo raspi-config` (Interface Options, I2C), reboot, and check the screen shows up with `sudo i2cdetect -y 1`. Its address is usually `0x27`, sometimes `0x3f`.

## Read the boxes

Every detection has a class number (`box.cls`, turned into a name with `model.names`), a confidence from 0 to 1 (`box.conf`) and its corners (`box.xyxy`). The same confidence cut-off idea you saw earlier applies here: `conf=0.5` throws away anything the model is less than half sure of. Too low and you get false boxes, too high and real objects are missed.

## Try it

1. Which `train` settings did you turn down for the Pi, and why for each?
2. Why does the script draw the box with `box.xyxy` and not `(x, y, w, h)`?
3. Why does the code only rewrite the LCD when `detected != last_detected`?
4. Where should you train a model for real use, and what do you copy to the Pi?

## Quick recap

| Tool | Real-life picture | What it does |
|---|---|---|
| Dataset + `data.yaml` | A binder of photos with each item circled | The labelled pictures and class names for training |
| `model.train` | Practice sessions for a new recruit | Fine-tunes YOLO on your pictures |
| `best.pt` | The recruit's trained eye | The saved result you load for detection |
| `conf` | How sure to be before pointing | Drops detections under that confidence |
| `box.xyxy` | Two opposite corners of a rectangle | Where the object is, in pixels |
| `detected != last_detected` | Only speak when something changes | Updates the LCD just when the names change |
