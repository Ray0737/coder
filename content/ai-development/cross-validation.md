---
title: Cross validation
summary: One test set could get lucky. Average over several, and luck cancels out.
---

> [!aha] A single train/test split tells you how the model did on one particular slice of held-out data, which might happen to be an easy slice, or a hard one. Cross validation tests on every slice in turn, so the score you get is an average, not a fluke.

## K-fold cross validation

Split the data into **K** equal folds. For each fold in turn, hold it out as the test set and train on the rest. That gives K separate scores, one per fold, which get averaged into a single, more trustworthy number.

```widget
crossvalfolds
```

> [!compare] Think of it like a teacher grading a student with five different pop quizzes instead of one big exam, then averaging the five scores. One unlucky quiz no longer decides the whole grade.

## Why this beats a single split

With one split, the model's reported score depends partly on which examples happened to land in the test set. A model could look great on an easy test fold and terrible on a hard one, and a single split only shows you one of those. Averaging over K folds, every example gets to be in the test set exactly once, so the final score reflects the whole dataset, not one lucky or unlucky slice.

## The cost: K times the training

Cross validation is not free: a model gets trained K separate times, once per fold. For a model that is slow to train, or a very large K, that adds up, which is the main reason it is used mostly to **compare** models or settings fairly, not as the final production training run.

## Try it

1. With K=5, what fraction of the data is used for training on any one fold?
2. If a model scores 92%, 61%, 90%, 88% and 89% across five folds, what does that one low fold suggest, compared to a model that scores close to 90% on every fold?
3. Why is K=5 or K=10 training a model 5 or 10 times more expensive than a single train/test split?

## Quick recap

| Tool | Real-life picture | What it does |
|---|---|---|
| Fold | One of five pop quizzes | One equal slice of the data |
| K-fold cross validation | Averaging five quiz scores instead of trusting one | Tests on every fold in turn, then averages the scores |
| The cost | Grading five quizzes instead of one | Trains the model K times instead of once |
