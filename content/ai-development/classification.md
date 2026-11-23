---
title: Classification
summary: Predicting a category: logistic regression, SVM, decision trees and KNN, then several classes at once and why cross-entropy is the loss.
---

> [!aha] Classification is supervised learning where the label is a category, so the job is to draw a boundary between groups of points. Every classifier is a different opinion about what shape that boundary should have, and none is right for every dataset.

## Classification vs regression

Supervised learning comes in two flavours, depending on the label. **Regression** predicts a number on a scale (a house price), and **classification** predicts one choice from a fixed set of **classes** (spam or not spam, which digit, which animal). The last chapter drew a line *through* the points to predict a number, and from here on the line, or curve, sits *between* groups of points and decides which side a new point falls on. That dividing line is the **decision boundary**.

| | Regression | Classification |
|---|---|---|
| Predicts | A number on a scale | One of a fixed set of classes |
| Example | "This house costs 4.2 million" | "This email is spam" |
| Drawn as | A line through the points | A boundary between groups of points |

## Logistic regression: a line, then a probability

Despite the name, this is a classifier. It first computes a plain weighted score `w·x + b`, just like linear regression, but a score can be any number from −∞ to +∞, which makes no sense as a probability. So it squashes the score through the **sigmoid** to land between 0 and 1, and a **threshold** (often 0.5) turns that probability into a yes or no. Drag the threshold below and watch which examples change their answer. Because it is a weighted sum followed by a sigmoid, logistic regression is exactly **one neuron**, and stacking many gives the MLP chapter.

```widget
logregboundary
```

> [!compare] Think of a pass mark on a test. A score of 71 out of 100 is not "pass" or "fail" until someone draws a line, say at 50.

> [!more] TLDR: choosing the threshold
> Raise the threshold and the model says "yes" less often: fewer false alarms, but more real cases missed. Lower it and the reverse happens. That is the precision and recall trade-off from the Evaluation chapter, controlled by one slider. For a fraud detector, where missing a fraud is costly, you would lower it, and for a spam filter that must never hide a real email, you would raise it.

> [!more] Math: the sigmoid and the score
> ```math
> score = w·x + b          probability = σ(score) = 1 / (1 + e^(−score))
> ```
>
> A score of 0 gives probability 0.5, a score of +4 gives 0.98 and a score of −4 gives 0.02. The score is also called the **log-odds**, because rearranging gives `p / (1 − p) = e^score`: every +1 on the score multiplies the odds of "yes" by `e ≈ 2.72`. That is why logistic regression is easy to explain: each weight says how much one feature multiplies the odds.

## SVM: not just any line, the one with the widest gap

If two groups of points do not overlap, many different lines separate them, and a **support vector machine (SVM)** picks the one with the widest **margin**: the gap between the line and the nearest point of each group. The points sitting right on the edge of that gap are the **support vectors**, and they are the only points that matter. Move any other point and nothing changes, but nudge a support vector and the whole line shifts. A wide margin leaves the most room for new, unseen points to still land on the right side.

```widget
svmmargin
```

> [!compare] Think of a tightrope stretched as far as possible from the furniture on both sides of a room. Only the pieces of furniture closest to the rope decide how it is stretched, and moving a chair against the far wall changes nothing.

> [!more] TLDR: the kernel, a way to bend the boundary
> When the groups cannot be split by a straight line (a ring inside a ring, or the spiral in the comparison below), an SVM uses a **kernel**. A kernel is a way of measuring how similar two points are, and it lets the SVM behave as if the points had been lifted into a higher space where a straight line does work, without ever building that space. The popular RBF kernel says two points are very similar when they are close and almost unrelated when far apart, which gives a smooth curved boundary. A softer version, called a *soft margin*, allows a few points to sit on the wrong side so that noisy data does not wreck the line.

> [!more] Math: the widest margin
> With the two classes labelled −1 and +1, the line is `w·x + b = 0` and the margin edges are `w·x + b = ±1`. The gap between those two edges is `2 / ‖w‖`, so the widest margin means the smallest `‖w‖`:
>
> ```math
> minimise  ½ ‖w‖²        subject to   yᵢ (w·xᵢ + b) ≥ 1   for every point i
> ```
>
> The constraint says every point is on the correct side and at least the margin away. Points where it is exactly equal to 1 are the support vectors. The RBF kernel is `k(a, b) = e^(−γ‖a − b‖²)`, where a bigger `γ` makes the boundary wigglier.

## Decision tree: a game of 20 questions

A decision tree plays 20 questions, except the model works out which questions to ask, and in what order, by seeing which ones split the data into the purest groups. Every box that is not a leaf is a yes/no question about one feature, and following the arrows from the top lands on a leaf, which is the prediction. Because every question looks at one feature, the boundary is made of horizontal and vertical steps. Change the age and income below and follow the highlighted path.

```widget
decisiontree
```

> [!compare] Think of sorting a pile of mixed coins with the fewest, most useful questions. "Silver or gold coloured?" splits the pile far better than "does it have a 7 on it?"

> [!more] TLDR: why a tree overfits so easily
> Left alone, a tree keeps asking questions until every training example sits alone in its own leaf. That gives perfect training accuracy and a jagged, overfit boundary that follows every noisy point, so it does badly on new data. The cures are to cap the depth, to prune branches that add little, or to grow many trees and average them, which is the next chapter.

> [!more] Math: Gini impurity, how a split is scored
> The tree tries many questions and keeps the one that makes the groups purest. A common score is **Gini impurity**, where `pₖ` is the share of class `k` in a group:
>
> ```math
> Gini = 1 − Σ pₖ²
> ```
>
> A pure group has Gini 0 and a 50/50 group of two classes has 0.5. Take 10 examples split 5 and 5 (Gini 0.5). A question that sends them into groups of (4 and 1) and (1 and 4) leaves each group with Gini `1 − (0.8² + 0.2²) = 0.32`, so the split brings the impurity from 0.5 down to 0.32, and the tree prefers it over a question that changes nothing.

## KNN: ask the neighbours

**K-nearest neighbours** has no training step at all. To classify a new point it finds the K closest training points and goes with the majority vote, so the data itself is the model. That makes it easy to understand but slow on big datasets, since every prediction compares against every stored point. Move the new point and change K below, and notice how K = 1 lets a single odd neighbour decide.

```widget
knnvote
```

> [!compare] Think of arriving in a new town and asking the people nearest to you which café is good. Asking one person is risky, since they might have strange taste, and asking the nine nearest gives a steadier answer.

> [!more] TLDR: choosing K, and why scaling matters
> A small K follows the data closely and is jumpy, since it copies the noise. A big K is smooth but blurs small groups together, and with two classes an odd K avoids ties. Because KNN is all about distance, a feature with big numbers wins: income in thousands would drown out age in years, so scale the features first (the Data handling chapter shows how).
>
> ```math
> distance(a, b) = √( (a₁ − b₁)² + (a₂ − b₂)² + … )
> ```

## Four classifiers, one plane

Each classifier below is trained live in your browser on 120 points, and the tinted background shows what it would predict at every spot of the plane, with the colour change marking the decision boundary. A straight line is perfect for two clusters and hopeless for XOR, a tree handles XOR but staircases around curves, and no single classifier wins everywhere, a fact sometimes called **No Free Lunch**. In practice you try several and compare them, which is what the Evaluation chapter is for.

```widget
classifierboundaries
```

| Classifier | Boundary looks like | Good at | Weak at |
|---|---|---|---|
| Logistic regression | One straight line | Simple, fast, easy to explain | Anything a line cannot separate (XOR, spiral) |
| SVM | A smooth curve with the widest margin | Curvy boundaries, small datasets | Very large datasets, choosing the kernel |
| Decision tree | Horizontal and vertical steps | Mixed feature types, easy to read | Overfits unless you limit its depth |
| KNN | Wobbly, follows the nearby points | Needs no training | Slow on big data, sensitive to noise |

> [!compare] Think of four people drawing a border on a map. One uses a ruler (logistic regression), one uses a French curve and keeps the widest gap between countries (SVM), one only draws along the grid lines (decision tree), and one asks "which five countries are closest to this spot?" (KNN).

## Several classes at once: progress bars or a pie?

When there are more than two classes, the last layer has to turn its raw scores into answers, and there are two common ways. A **sigmoid** gives every class its own 0 to 100% bar, so Cat can be 90% full and Dog 85% full at the same time, and use it when an example can belong to several classes at once (a photo tagged both "beach" and "dog"). A **softmax** shares one fixed 100% between the classes, so if Cat takes 80% then Dog and Bird must split the remaining 20%, and use it when exactly one class is right (this digit is a 7, not a 7 and a 1). Drag the scores below to see both side by side.

```widget
softmaxbars
```

> [!compare] Think of sigmoid as a row of separate progress bars, one for each class, and softmax as one pie chart, where a bigger slice for one class means smaller slices for the others.

> [!more] Math: softmax with real numbers
> ```math
> softmax(zₖ) = e^zₖ / Σⱼ e^zⱼ
> ```
>
> With the starting scores in the widget (Cat 2, Dog 1.5, Bird −1) the exponentials are 7.39, 4.48 and 0.37, which add to 12.24. Dividing gives Cat 60%, Dog 37% and Bird 3%, which always add to exactly 100%. Run the same scores through three separate sigmoids and you get 88%, 82% and 27%, which add to 197%, since nothing forces them to share.

## Why classifiers use cross-entropy, not squared error

Squared error works for predicting numbers, but pair it with a sigmoid output and a trap appears. When the neuron is confidently *wrong*, it sits on the flat tail of the sigmoid, where the slope is almost zero, so the weight updates are tiny and learning crawls at exactly the moment it should hurry. **Cross-entropy** is a loss built so that the flat slope cancels out: the more wrong the neuron is, the bigger the correction. That is why it is the default loss for classification, and the Training a network chapter races the two losses side by side.

> [!more] Math: the loss, and the slope that cancels
> For one example with true label `y` (0 or 1) and predicted probability `a = σ(z)`:
>
> ```math
> cross-entropy:   C = −[ y · ln(a) + (1 − y) · ln(1 − a) ]
> ∂C/∂z = a − y                               (squared error:  ∂C/∂z = (a − y) · σ′(z))
> ```
>
> The squared-error slope carries the extra factor `σ′(z)`, which is nearly 0 when the neuron is saturated, so a confident mistake barely moves the weights. In cross-entropy the factor cancels, leaving just the size of the mistake. It also punishes confident mistakes harshly: predicting `a = 0.01` when the truth is 1 costs `−ln(0.01) = 4.6`, while `a = 0.5` costs only 0.69. With several classes the same idea becomes `C = −ln(probability given to the true class)`.

```cta
flask | See it for yourself | Compare classifiers, from logistic regression to an MLP, side by side on MNIST.
Neural network comparison | @compare#Logistic%20Regression,SVM | Logistic regression next to an SVM
```

## Try it

1. In the four-classifier diagram pick "Two clusters" and cycle through all four. Which ones draw nearly the same boundary, and why?
2. Switch to "XOR". Which classifier completely fails, and why can no single straight line ever solve it?
3. On "Spiral", compare SVM and Decision tree. Which boundary is smoother and which is staircase-shaped?
4. In the logistic regression diagram, drag the threshold to 0.9. Which examples flip from "pass" to "fail"? For a fraud detector, would you raise or lower it?
5. In the SVM diagram, shrink the margin to 0. Does the separating line itself move?
6. In the tree diagram, set age 35 and income 40k. What is the prediction, and why would an unlimited-depth tree reach 100% training accuracy?
7. In the KNN diagram, with the starting point, compare K = 1 and K = 5. Which would you trust, and why?
8. A model reads a photo and must name the one animal in it: cat, dog or bird. Sigmoid or softmax? What if the photo may contain several animals?

## Quick recap

| Tool | Real-life picture | What it does |
|---|---|---|
| Classification | Sorting mail into pigeonholes | Supervised learning that predicts one of a fixed set of classes |
| Decision boundary | A border on a map | The line where the predicted class flips |
| Sigmoid and threshold | A dimmer switch, then a pass mark | Turn a score into a probability, then into a yes or no |
| Margin and support vectors | A tightrope far from the furniture | The SVM's widest gap, decided only by the nearest points |
| Kernel | Bending the map so a ruler works | Lets a simple boundary become a curve |
| Tree split | The next best yes or no question | Cuts the plane into rectangles |
| KNN | Asking the nearest neighbours | Majority vote of the closest K points |
| Softmax | One pie chart | Shares 100% between classes when exactly one is right |
| Cross-entropy | A fine that grows with how sure you were | The loss that keeps learning fast when the model is confidently wrong |
