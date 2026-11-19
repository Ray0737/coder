---
title: Data: cleaning and the train/test split
summary: A model is only as good as the data it never cheats off of.
---

> [!aha] Never grade a student on the exact questions they studied from. Never test a model on the exact examples it trained on either. That one habit is the difference between a model that works and one that only looks like it works.

## Cleaning: garbage in, garbage out

Real data is messy before it is useful: missing values, duplicate rows, typos, wildly different scales (age in years next to income in the thousands). **Cleaning** means fixing or removing these before training even starts.

| Problem | Typical fix |
|---|---|
| Missing values | Fill with the average/most common value, or drop the row |
| Duplicate rows | Remove them, or they get counted twice |
| Wrong scale (e.g. age 0–100, income 0–200,000) | Scale every feature to a similar range, so one does not dominate by size alone |
| Typos / inconsistent labels ("NY", "N.Y.", "New York") | Standardise to one spelling |

## The train / validation / test split

Once the data is clean, it gets split into **three** pieces, **before** any training happens:

- **Training set**: what the model actually learns its weights from.
- **Validation set**: not trained on. Used *while* building the model, to tune settings and catch overfitting early (this is the "validation error" from the next chapter).
- **Test set**: touched exactly once, at the very end, to report how well the finished model generalises to data it has never influenced in any way.

```widget
traintestsplit
```

> [!warn] If the model ever sees the test set during training, even by accident, or you keep re-checking the test score and tweaking settings based on it, the test score stops meaning anything. That is what the validation set exists to prevent: it soaks up all the "try this, check the score, adjust" loop, so the test set stays untouched until the very last step.

## Try it

1. Why is scaling age (0–100) and income (0–200,000) together a problem for some models, even though both are just numbers?
2. What would go wrong if you cleaned and split the data in the wrong order: split first, then fill in missing values using the *whole* dataset's average?
3. Push validation down to 5% and train up to 80%. What does the model lose by having a tiny validation set, even though it now trains on more data?
4. Why does tuning settings against the *test* set, instead of the validation set, quietly ruin the one number you have left to trust?

## Quick recap

| Tool | Real-life picture | What it does |
|---|---|---|
| Cleaning | Proofreading before you submit | Fixes missing, duplicate or inconsistent data before training |
| Scaling | Converting units to one system | Puts every feature on a similar range |
| Train set | The practice questions | What the model actually learns from |
| Validation set | A practice exam while studying | Tunes settings and catches overfitting, without touching the real exam |
| Test set | The real exam, taken once | Held back completely, the one honest number at the end |
