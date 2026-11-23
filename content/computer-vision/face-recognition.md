---
title: Face recognition
summary: Detecting a face says "someone is there". Recognising it says "that is you". LBPH is the lightweight way to teach OpenCV the difference.
---

> [!aha] Detection and recognition are two different questions. A Haar cascade asks "is there a face here?". A recogniser asks "whose face is it?". The recogniser needs to be trained on the people you want it to know.

## Detection or recognition?

**LBPH** (Local Binary Patterns Histograms) is a classic recogniser built into OpenCV. It needs no deep learning and no GPU, and it answers a different question from the Haar cascade that finds the face first.

| | Detection (Haar) | Recognition (LBPH) |
|---|---|---|
| Question | Is there a face here? | Whose face is it? |
| Needs training on your people | No, the `.xml` ships ready-made | Yes, it learns the faces you give it |
| Returns | A box `(x, y, w, h)` | An `id` and a `confidence` |

## Three steps: capture, train, recognise

The pipeline in your folder is three scripts you run in order. Pick a step to follow a face through it, and at the door choose Ray or a friend to see who gets named.

```widget
lbphpipe
```

> [!compare] Think of it like teaching a new classmate to know your friends. First you point at each friend while they stand in front of the camera and say their name (capture). Then the classmate studies those photos (train). Later, at the door, they glance at each arrival and say a name, or say "I don't know them" (recognise).

## The three scripts

Each step is its own script, and each one hands its result to the next through files on disk.

| Step | Script | What it does |
|---|---|---|
| 1. Capture | `step1_capture_training_faces.py` | Finds a face with the Haar cascade, crops just the face, saves about 100 grayscale samples per person as `user.<id>.<n>.jpg` |
| 2. Train | `step2_train_recognizer.py` | Loads every sample, collects (face, id) pairs, trains the recognizer and saves `classifier.xml` |
| 3. Recognise | `step3_recognize_live.py` | Loads `classifier.xml`, finds faces in the live webcam with the same Haar cascade, then names each one |

## The code

`cv.face` only exists in the contrib build, so install `opencv-contrib-python`, not plain `opencv-python`. `train` takes a list of grayscale face crops (they can be different sizes) and a matching list of integer ids, one per face, and `predict` returns the best-matching `id` and a `confidence`.

```python
import cv2 as cv
import numpy as np

clf = cv.face.LBPHFaceRecognizer_create()
clf.train(faces, np.array(ids))          # step 2: list of face crops + a number per face
clf.write('classifier.xml')

clf = cv.face.LBPHFaceRecognizer_create()
clf.read('classifier.xml')               # step 3
id, confidence = clf.predict(face_crop)
name = NAMES.get(id, 'unknown') if confidence <= 70 else 'unknown'
```

## The trap: low confidence is good

For LBPH, `confidence` is a **distance**: how far this face is from the closest face it learned. **Lower means a better match**, and 0 would be perfect. That is the opposite of most "confidence" scores in machine learning, where higher is better, so do not reuse that instinct here. A common rule is "70 or less means known, otherwise unknown", but the right line depends on your data. Slide the threshold and watch who gets named.

```widget
lbphthresh
```

> [!warn] Set the threshold too loose and strangers get named as people you know. Set it too tight and you stop being recognised in a dim room. Test it on your own faces, in your own lighting.

## Privacy

The saved face crops and the names behind the ids are **biometric data**: pictures of people's faces. Keep the `data/` folder out of version control and out of public repositories, and only record people who agreed to it. The trained `classifier.xml` is large and also built from those faces.

## Try it

1. Which question does a Haar cascade answer, and which does LBPH answer?
2. `predict` returns a confidence of 35 for one face and 95 for another. Which is the closer match?
3. Why does the recogniser still use the Haar cascade in step 3?
4. Why might you be recognised in daylight but not in a dim room, and what would you do about it?

## Quick recap

| Tool | Real-life picture | What it does |
|---|---|---|
| Detection (Haar) | Noticing that someone walked in | Finds where a face is |
| Recognition (LBPH) | Knowing who walked in | Matches a face to a person it learned |
| Capture, train, recognise | Introduce, study, greet | The three scripts, run in order |
| `confidence` | How different this face looks from the closest one learned | A distance: lower is a better match |
| Threshold (about 70) | The line between "I know them" and "stranger" | Chosen by testing on your own data |
