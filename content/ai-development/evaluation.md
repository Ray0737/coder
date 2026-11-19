---
title: Evaluation: overfitting, underfitting and the numbers that catch them
summary: Checking whether a model actually learned, or just memorised.
---

> [!aha] A model that is too simple can't learn the pattern. A model that is too complex learns the pattern *and* every random wobble in the training data, then fails on anything new. Evaluation is how you tell which one happened, with real numbers instead of a guess.

## Underfitting: too simple

**Underfitting** is a model that performs badly even on the data it trained on. It has not found the pattern at all; it is too simple, or was not trained for long enough.

> [!compare] Think of it like trying to draw a wiggly coastline with one straight line. It misses almost everything.

## Overfitting: too complex

**Overfitting** is a model that does *great* on the training data and badly on new data. It has not learned the general pattern, it has memorised the training examples, noise and all.

> [!compare] Think of it like memorising the answers to last year's exam instead of learning the subject. Score 100% on that exact paper, and fail the real one.

## Watching it happen: train vs. validation error

```widget
overfitcurve
```

The train line (solid) always keeps falling as the model gets more complex: more complexity always lets it fit the training data better. The validation line (dashed) is U-shaped: it falls while the model is learning real structure, then rises once the model starts fitting noise instead. This is exactly what the validation set from the last chapter is for.

## Turning "wrong" into four numbers

Error curves say *that* something is wrong. For a yes/no prediction, a confusion matrix says exactly *how*. Say a model predicts whether an email is spam:

| | Predicted spam | Predicted not spam |
|---|---|---|
| **Actually spam** | True Positive (TP): caught it | False Negative (FN): missed it |
| **Actually not spam** | False Positive (FP): false alarm | True Negative (TN): correctly ignored |

```widget
confusionmatrix
```

## Accuracy: the obvious number, with a trap

**Accuracy** is simply `(TP + TN) / total`: the fraction the model got right. The trap: if 99% of emails are not spam, a model that *never* predicts spam is 99% accurate, and completely useless.

## Precision and recall: two different kinds of "good"

- **Precision** = `TP / (TP + FP)`: of everything flagged as spam, how much really was spam? High precision means few false alarms.
- **Recall** = `TP / (TP + FN)`: of everything that really was spam, how much did it catch? High recall means few misses.

> [!compare] Think of a smoke detector. High recall means it catches every real fire. High precision means it rarely goes off for burnt toast. A detector can be great at one and bad at the other.

## F1: one number that needs both

**F1** is the balance point between precision and recall: `2 · precision · recall / (precision + recall)`. It drops sharply if either one is weak, so a model can't hide a terrible recall behind a great precision.

## Try it

1. Drag complexity all the way to 1. Is this underfitting or overfitting? How do you know from the two numbers shown?
2. Drag complexity to 10. Which error number keeps dropping, and which one gets worse? What does that gap between them tell you?
3. In the confusion matrix widget, set FN to 0 and FP to 50. What happens to recall? What happens to precision? Which one is more honest about this model?
4. A cancer-screening model should almost never miss a real case. Should it be tuned for higher precision or higher recall? Why?
5. A classmate says "just train for more epochs, the error will always get better." What's wrong with that, using what you just saw on the validation curve?

## Quick recap

| Tool | Real-life picture | What it does |
|---|---|---|
| Underfitting | One straight line through a wiggly coastline | Too simple to capture the real pattern |
| Overfitting | Memorising last year's exam answers | Too complex, fits the training noise instead of the pattern |
| Validation error | A practice exam with new questions | Reveals overfitting that the training score alone hides |
| TP / FP / FN / TN | The four outcomes of a yes/no guess | The raw counts every other metric is built from |
| Accuracy | Percent correct overall | Can be misleading when one class is rare |
| Precision | How often "spam!" was right | TP / (TP + FP) |
| Recall | How much real spam got caught | TP / (TP + FN) |
| F1 | The balance point | Punishes a model that is great at one and bad at the other |
