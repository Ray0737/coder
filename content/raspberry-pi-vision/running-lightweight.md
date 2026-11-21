---
title: Running lightweight
summary: A Pi is a small computer. Shrink the input, export the model to a format built for ARM, and the same detector runs far more smoothly.
---

> [!aha] You rarely need a smarter model on the Pi. You need a lighter workload. Smaller pictures, a smaller model format and fewer frames processed add up to a big difference without changing what the detector can find.

## Where the time goes

Every frame has to be captured, resized, pushed through the network and drawn on. On a laptop that is easy, but a Pi 4 has a modest CPU and no graphics card to help. So you trim the work at each step.

```widget
litflow
```

## 1. A smaller picture

Both settings from `w7b.py` do the same job: fewer pixels to process.

```python
IMG_SIZE = 320          # the size YOLO works at
FRAME_WIDTH = 320
FRAME_HEIGHT = 240

cap.set(cv.CAP_PROP_FRAME_WIDTH, FRAME_WIDTH)
cap.set(cv.CAP_PROP_FRAME_HEIGHT, FRAME_HEIGHT)
results = model(frame, conf=0.5, imgsz=IMG_SIZE, verbose=False)
```

`imgsz` is the resolution the model works at. **Smaller is faster and less accurate**, and 320 is a common choice for real-time use on a CPU. The `cap.set` lines ask the camera itself to send smaller frames, which saves work before the model ever sees them.

> [!compare] Think of it like reading a map. A small map on your phone is quicker to scan than a poster on the wall. You can still find the town, but a tiny village might be too small to make out.

## 2. A lighter model format (`optimize_model.py`)

A trained `best.pt` is a PyTorch file. PyTorch is heavy on a Pi. The exporter converts it to a format built to run quickly on a CPU:

```python
from ultralytics import YOLO

model = YOLO("best.pt")
for fmt in ["ncnn", "onnx"]:
    try:
        path = model.export(format=fmt, imgsz=320, half=False, simplify=True)
        print(f"Saved: {path}")
    except Exception as e:
        print(f"Export to {fmt} failed: {e}")
```

| Format | What it is | Role here |
|---|---|---|
| **NCNN** | Tencent's inference framework | Usually the fastest on ARM boards like the Pi, so it is the main target |
| **ONNX** | A portable, shared model format | The fallback if NCNN is not available |

The `try`/`except` is deliberate: if one export fails, the script reports it and carries on with the next. Install the extras once with `pip install ncnn onnx onnxsim`. The output lands next to `best.pt`, as `best_ncnn_model/` and `best.onnx`.

Then load the exported model in place of the old file:

```python
model = YOLO("best_ncnn_model")      # or "best.onnx"
```

> [!warn] Check the detections after you switch. Confirm the lighter model still finds the same objects before you trust it. A faster model that misses things is not an improvement.

## 3. Fewer frames

You do not have to process every frame. The hand-tracking chapter showed the trick: run the model on every third frame and reuse the last result in between. A detector that runs 10 times a second still looks smooth if the drawing happens every frame.

## 4. A cheap guard against wasted work

Hardware work, such as writing to the LCD, is slow too. Only do it when something changed:

```python
if detected != last_detected:      # skip the slow LCD write when nothing is new
    lcd.text(...)
    last_detected = detected
```

## Try it

1. Which two settings in `w7b.py` reduce how many pixels are processed?
2. What is the cost of lowering `imgsz` from 640 to 320?
3. Why does `optimize_model.py` export to more than one format and wrap each in `try`/`except`?
4. After exporting, what should you check before relying on the new model?

## Quick recap

| Tool | Real-life picture | What it does |
|---|---|---|
| `imgsz=320` | Reading a small map | Works at a smaller resolution: faster, less accurate |
| `cap.set(...)` | Asking for a smaller photo at the source | Camera sends smaller frames |
| NCNN | A lightweight engine built for the Pi | Fastest CPU backend on ARM boards |
| ONNX | A shared file format | Portable fallback when NCNN is not available |
| Frame skipping | Glancing every third second | Processes fewer frames, reuses the last result |
| Change check | Only speak when something changes | Avoids slow, pointless screen updates |
