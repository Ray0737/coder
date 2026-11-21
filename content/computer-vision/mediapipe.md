---
title: MediaPipe
summary: Ready-made models for hands, faces and bodies. No training needed, and they return landmark points instead of boxes.
---

> [!aha] YOLO finds *what* is in the picture and puts a box round it. MediaPipe goes the other way: it knows a few things very well (hands, faces, bodies) and tells you exactly where their *parts* are, as numbered points called **landmarks**.

## What MediaPipe is

**MediaPipe** is a library from Google of ready-made, already trained vision models. You do not collect pictures or train anything. You load the model, hand it a frame, and read back points. It is fast enough to run live on an ordinary CPU, a phone and a Raspberry Pi.

| Task | What you get back | Points |
|---|---|---|
| Hand landmarks | The position of every joint of each hand | 21 per hand |
| Pose | The position of the main body joints | 33 per person |
| Face | A face outline, eyes, lips and more, as a mesh | Hundreds of points |
| Gesture recognition | A named gesture, such as an open palm or a thumbs up | A label per hand |

> [!compare] Think of it like a puppet strings diagram. YOLO draws a rectangle round the whole puppet. MediaPipe tells you where each string is tied: the wrist, the elbow, each knuckle, each fingertip. With those points you can measure angles, spot a pointing finger or move a servo.

## One hand, 21 numbered points

For a hand, point 0 is the wrist, and the other 20 run along each finger from the base joint out to the tip: thumb 1 to 4, index 5 to 8, middle 9 to 12, ring 13 to 16 and little finger 17 to 20. **Fingertips are 4, 8, 12, 16 and 20.** Hover over the points to see their names.

```widget
landmarkmap
```

Under the hood, MediaPipe works in two steps. First a model finds where the palm is, and then a second model looks at that crop to place the 21 points. That is why it is quick: the heavy second model only studies a small patch.

## Using it

```python
import cv2 as cv
import mediapipe as mp

BaseOptions = mp.tasks.BaseOptions
HandLandmarker = mp.tasks.vision.HandLandmarker
HandLandmarkerOptions = mp.tasks.vision.HandLandmarkerOptions
VisionRunningMode = mp.tasks.vision.RunningMode

options = HandLandmarkerOptions(
    base_options=BaseOptions(model_asset_path="hand_landmarker.task"),
    running_mode=VisionRunningMode.VIDEO,
    num_hands=1,
)

with HandLandmarker.create_from_options(options) as landmarker:
    rgb = cv.cvtColor(frame, cv.COLOR_BGR2RGB)                  # MediaPipe wants RGB
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
    result = landmarker.detect_for_video(mp_image, timestamp_ms)

    if result.hand_landmarks:
        for i, lm in enumerate(result.hand_landmarks[0]):
            x, y = int(lm.x * frame_w), int(lm.y * frame_h)     # 0 to 1 -> pixels
            cv.circle(frame, (x, y), 4, (0, 255, 0), -1)
```

`result.hand_landmarks[0]` is a list of 21 points for the first hand. Each has `x` and `y` as fractions from 0 to 1 of the frame size, so multiply by the width and height to get pixels. The model file `hand_landmarker.task` has to sit next to your script. The Raspberry Pi chapter shows the full version that also drives a servo.

> [!warn] Like every OpenCV-to-other-library handover, the colour order matters. OpenCV gives BGR and MediaPipe expects RGB, so convert with `cv.COLOR_BGR2RGB` before you pass the frame in.

### Is a finger up?

Landmarks are just numbers, so a gesture is arithmetic on them. In image coordinates **y grows downward**, so a raised fingertip has a *smaller* y than the joint below it:

```python
tip, pip = result.hand_landmarks[0][8], result.hand_landmarks[0][6]
index_up = tip.y < pip.y          # fingertip above its middle joint
```

Do the same for 12, 16 and 20 (against 10, 14 and 18) and you can count raised fingers. The thumb sticks out sideways, so compare x for it instead of y.

## What MediaPipe is good at, and what YOLO is good at

They solve different problems, and a real project often uses both.

| | MediaPipe | YOLO |
|---|---|---|
| Answers | "Where are the parts of this hand, face or body?" | "What objects are here, and where?" |
| Output | Numbered landmark points | Boxes, classes and confidences |
| Training | None. Use it as it comes | You train it on your own labelled pictures for custom objects |
| Knows | Only what it was built for: hands, faces, bodies, a few gestures | Any set of objects you teach it, plus everyday ones from the pretrained models |
| Strong at | Fine detail: finger joints, body angles, face expressions | Many objects at once, and your own custom objects |
| Weak at | Anything outside its built-in tasks, such as your own product | Fine detail inside an object, and needing data to train |
| Typical use | Pointing, gestures, posture, face effects | Counting, finding items, vehicles, inventory |

Pick the tool by the question. Pick the job below and see which one fits.

```widget
toolpicker
```

> [!aha] The question decides the tool. "Is there a bottle, and where?" is YOLO. "Which finger is pointing?" is MediaPipe. Neither is better overall. They answer different questions.

## Try it

1. Which MediaPipe landmark is the index fingertip, and which is the joint just below it?
2. Why does a raised finger have a *smaller* y than its joint?
3. Which tool would you use to count boxes on a shelf, and which to follow a pointing finger? Explain why.
4. Why must you convert the frame from BGR to RGB before giving it to MediaPipe?
5. Landmark values are between 0 and 1. How do you turn them into pixel positions?

## Quick recap

| Tool | Real-life picture | What it does |
|---|---|---|
| MediaPipe | A ready-made puppet-strings diagram | Pretrained models that return landmark points |
| Landmark | A numbered pin on a joint | One tracked point, with x and y from 0 to 1 |
| 21 / 33 points | Pins on a hand / pins on a body | Hand and pose landmark counts |
| Two-step hand model | Spot the palm, then study the palm | A fast palm finder, then a detailed landmark model |
| YOLO vs MediaPipe | A box round the puppet vs the strings | What and where, against where the parts are |
