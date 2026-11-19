---
title: Logistic regression
summary: Linear regression's cousin, for yes/no answers instead of numbers.
---

> [!aha] Logistic regression does not predict pass or fail directly. It predicts a probability between 0 and 1, then a threshold turns that probability into a yes/no answer.

## From a straight line to a probability

A straight line can output any number, from −∞ to +∞, which makes no sense as a probability. Logistic regression first computes a plain weighted score, just like linear regression, then squashes it through the **sigmoid** function so it always lands between 0 and 1.

```
score = w·x + b          (any number at all)
probability = sigmoid(score)   (always between 0 and 1)
```

## The threshold decides the answer

A probability of 0.71 is not an answer by itself. A **threshold** (often 0.5) turns it into one: probability at or above the threshold means "yes", below means "no".

```widget
logregboundary
```

> [!compare] Think of it like a pass mark on a test. 71/100 is not "pass" or "fail" until a line is drawn somewhere, say at 50.

## Moving the threshold changes the trade-off

Raise the threshold and the model says "yes" less often: fewer false alarms, but more real cases missed. Lower it and the reverse happens. This is the exact precision/recall trade-off from the model evaluation chapter, now controlled by one slider.

## Try it

1. Drag the threshold to 0.9. Which example scores get reclassified from "pass" to "fail"?
2. Why is a probability of exactly 0.5 the most uncertain, "coin flip" point on the whole curve?
3. For a fraud detector where missing real fraud is costly but false alarms are just annoying, would you raise or lower the threshold from 0.5?

## Quick recap

| Tool | Real-life picture | What it does |
|---|---|---|
| Sigmoid | A dimmer switch, not an on/off switch | Squashes any score into a probability between 0 and 1 |
| Threshold | The pass mark | Turns a probability into a yes/no answer |
| Raising/lowering it | Trading false alarms for misses | Controls the precision/recall balance |
