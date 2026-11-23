---
title: Evaluation
summary: Fitting, metrics and cross validation: checking whether a model actually learned, or just memorised.
---

> [!aha] A model that is too simple can't learn the pattern. A model that is too complex learns the pattern *and* every random wobble in the training data, then fails on anything new. Evaluation is how you tell which one happened, with real numbers instead of a guess.

## The three fits, side by side

Here are the same 12 points fitted three ways. Press the buttons, or drag the degree slider (how bendy the curve is), and compare the train error with the test error on 40 points the curve never saw.

```widget
fitcompare
```

## Watching it happen: train vs. validation error

```widget
overfitcurve
```

The train line (solid) always keeps falling as the model gets more complex: more complexity always lets it fit the training data better. The validation line (dashed) is U-shaped: it falls while the model is learning real structure, then rises once the model starts fitting noise instead. This is exactly what the validation set from the last chapter is for.

## Fighting overfitting: regularization

Overfitting is a numbers game: the more free parameters a model has, the easier it is to fit *any* dataset, real pattern or not, and a small MNIST network already has nearly 24,000 of them. There are three ways to fight it: **get more training data**, **shrink the network**, or keep both and add **regularization** (L1 and L2 change the loss, dropout changes the network). Exactly why it works is still debated, but the result is solid: it shrinks the gap between training and validation error. Pick a method below and watch what it does to one wiggly curve and the 10 weights behind it.

```widget
regviz
```

> [!compare] Think of L2 as a tax on loud weights. A weight is only allowed to grow large if the drop in loss it buys is worth the tax. The tax rate is a dial called **λ** (lambda): turn it down and the network just minimises the original loss, turn it up and it prefers small weights above all.

Want to see an L1 tax at work? Open the [Playground](playground.html), switch Regularization to L1, raise the regularization rate and press play: lines whose weights are pushed to zero fade out for good.

## Turning "wrong" into four numbers

Error curves say *that* something is wrong. For a yes/no prediction, a confusion matrix says exactly *how*. Say a model predicts whether an email is spam:

| | Predicted spam | Predicted not spam |
|---|---|---|
| **Actually spam** | True Positive (TP): caught it | False Negative (FN): missed it |
| **Actually not spam** | False Positive (FP): false alarm | True Negative (TN): correctly ignored |

```widget
confusionmatrix
```

## Accuracy, precision, recall and F1

Four numbers built from the same four counts, each answering a different question. Using spam detection as the example:

| Metric | Formula | The question it answers | The catch |
|---|---|---|---|
| **Accuracy** | `(TP + TN) / total` | What fraction did the model get right? | Misleading when one class is rare: if 99% of emails are not spam, a model that *never* predicts spam is 99% accurate and completely useless |
| **Precision** | `TP / (TP + FP)` | Of everything flagged as spam, how much really was spam? | High precision means few false alarms, but it can hide missed spam |
| **Recall** | `TP / (TP + FN)` | Of everything that really was spam, how much did it catch? | High recall means few misses, but it can hide false alarms |
| **F1** | `2·pr·rc / (pr + rc)` | Is it good at both at once? | The balance point of `pr` (precision) and `rc` (recall). It drops sharply if either is weak, so one great score can't hide a terrible one |

> [!compare] Think of a smoke detector. High recall means it catches every real fire. High precision means it rarely goes off for burnt toast. A detector can be great at one and bad at the other.

## One test set can get lucky: cross validation

A single train/test split tells you how the model did on one particular slice of held-out data, which might happen to be an easy slice or a hard one. **K-fold cross validation** tests on every slice in turn. Split the data into **K** equal folds. For each fold in turn, hold it out as the test set and train on the rest. That gives K scores, which get averaged into one more trustworthy number. Every example is in the test set exactly once, so the final score reflects the whole dataset, not one lucky or unlucky slice. The cost is that the model is trained K times, once per fold, which is why cross validation is mostly used to **compare** models or settings fairly, not as the final production training run.

```widget
crossvalfolds
```

> [!compare] Think of a teacher grading a student with five different pop quizzes instead of one big exam, then averaging the five scores. One unlucky quiz no longer decides the whole grade.

## Try it

1. Drag complexity all the way to 1. Is this underfitting or overfitting? How do you know from the two numbers shown?
2. Drag complexity to 10. Which error number keeps dropping, and which one gets worse? What does that gap between them tell you?
3. In the confusion matrix widget, set FN to 0 and FP to 50. What happens to recall? What happens to precision? Which one is more honest about this model?
4. A cancer-screening model should almost never miss a real case. Should it be tuned for higher precision or higher recall? Why?
5. A classmate says "just train for more epochs, the error will always get better." What's wrong with that, using what you just saw on the validation curve?
6. With K=5, what fraction of the data trains the model on any one fold? Why does K=10 cost twice as much training as K=5?
7. A model scores 92%, 61%, 90%, 88% and 89% across five folds. What does the one low fold suggest, compared to a model that scores about 90% on every fold?
8. A network overfits badly. You raise λ from 0.1 to 100. What happens to the weights, and what new problem might appear?
9. Which two regularization techniques change the loss function, and which one changes the network itself?

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
| Fold | One of five pop quizzes | One equal slice of the data |
| K-fold cross validation | Averaging five quiz scores instead of trusting one | Tests on every fold in turn, then averages the scores |
| Its cost | Grading five quizzes instead of one | Trains the model K times instead of once |
