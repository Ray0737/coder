---
title: Classification
summary: Logistic regression, SVM, decision trees and KNN: four opinions on where one class ends and the next begins.
---

> [!aha] Classification is the art of drawing a line (or a curve, or a staircase) between groups of points. Every classifier is a different opinion about what shape that boundary should have, and none of them is right for every dataset.

## Classification vs regression

Machine learning problems with labels come in two flavours. **Regression** predicts a number (a house price, tomorrow's temperature). **Classification** predicts a category (spam or not spam, which digit, which animal). The regression chapter predicted numbers; from here on the answer is a class.

| | Regression | Classification |
|---|---|---|
| Predicts | A number on a scale | One of a fixed set of classes |
| Example | "This house costs 4.2 million" | "This email is spam" |
| Drawn as | A line through the points | A boundary between groups of points |

## Four classifiers, one plane

Each classifier below is trained live, in your browser, on 120 points. The tinted background shows what it would predict at every spot of the plane, and the place where the tint changes colour is the **decision boundary**. Pick a classifier, then a dataset, and watch the boundary change.

```widget
classifierboundaries
```

| Classifier | Boundary looks like | Good at | Weak at |
|---|---|---|---|
| Logistic regression | One straight line | Simple, fast, easy to explain | Anything a line cannot separate (XOR, spiral) |
| SVM | A smooth curve with the widest possible margin | Curvy boundaries, small datasets | Very large datasets, choosing the kernel |
| Decision tree | Horizontal and vertical steps | Mixed feature types, easy to read | Overfits unless you limit its depth |
| KNN | Wobbly, follows the nearby points | Needs no training | Slow on big data, sensitive to noise |

> [!compare] Think of four people drawing a border on a map. One uses a ruler (logistic regression). One uses a French curve and keeps the widest gap between countries (SVM). One only draws along the grid lines of the map (decision tree). One just asks "which five countries are closest to this spot?" (KNN).

**No Free Lunch:** no single classifier is best for every problem. The right one depends on your data, so in practice you try several and compare them (that is what the Evaluation chapter is for). The next four sections open up how each one works.

## Logistic regression: a line, then a probability

A straight line can output any number, from −∞ to +∞, which makes no sense as a probability. Logistic regression first computes a plain weighted score, just like linear regression, then squashes it through the **sigmoid** so it always lands between 0 and 1.

```
score = w·x + b                 (any number at all)
probability = sigmoid(score)    (always between 0 and 1)
```

A probability of 0.71 is not an answer by itself. A **threshold** (often 0.5) turns it into one: at or above the threshold means "yes", below means "no". Drag the threshold and see which examples change their answer.

```widget
logregboundary
```

> [!compare] Think of a pass mark on a test. 71/100 is not "pass" or "fail" until a line is drawn somewhere, say at 50.

Raise the threshold and the model says "yes" less often: fewer false alarms, but more real cases missed. Lower it and the reverse happens. This is the same precision/recall trade-off from the Evaluation chapter, controlled by one slider. And since it is just a weighted sum followed by a sigmoid, logistic regression is exactly **one neuron**: stack many and you get the MLP chapter.

## SVM: not just any line, the one with the widest gap

If two groups of points do not overlap, many different lines separate them. An SVM picks the line that maximises the **margin**: the gap between the line and the nearest point of each group.

```widget
svmmargin
```

The points sitting exactly on the edge of the margin are the **support vectors**. Move any other point further away and nothing changes; move a support vector and the whole line shifts. A wide margin leaves the most breathing room for new, unseen points to still land on the right side.

> [!compare] Think of a tightrope stretched as far as possible from the furniture on both sides of a room. Only the furniture closest to the rope decides how it is stretched; moving a chair against the far wall changes nothing.

For curved boundaries (the spiral above) an SVM uses a **kernel**: a way of measuring similarity that lets a straight-line method draw a curve.

## Decision tree: a game of 20 questions

A decision tree is the "20 questions" game, except the model worked out which questions to ask, and in what order, by seeing which ones split the data most cleanly. Every box that is not a leaf is a yes/no question about one feature. Follow the arrows from the top and you land on a leaf: the prediction.

```widget
decisiontree
```

At each box, the tree tries lots of possible questions ("Age < 30?", "Income < 50k?", ...) and keeps the one that splits the data into the *purest* groups. It repeats this for every new box until the groups are pure enough or it hits a limit. Because every question looks at one feature, the boundary is made of horizontal and vertical steps.

A tree with no depth limit can keep splitting until every training example has its own leaf: perfect training accuracy and an overfit mess on new data. Real trees are limited in depth or pruned back, trading a little training accuracy for a model that generalises.

> [!compare] Think of sorting a pile of mixed coins with the fewest, most useful questions: "silver or gold coloured?" splits it better than "does it have a 7 on it?"

## KNN: ask the neighbours

**K-nearest neighbours** has no training step at all. To classify a new point it finds the K closest training points (K = 5 in the diagram) and goes with the majority vote. The data itself is the model. That makes it easy to understand but slow on big datasets, and sensitive to noisy points sitting near the boundary.

## Several classes at once: progress bars or a pie?

When there are more than two classes, the output layer has to turn its raw scores into answers, and there are two common ways.

> [!compare] **Sigmoid is a row of separate progress bars.** Every class gets its own 0 to 100% bar. "Cat" can be 90% full and "Dog" 85% full at the same time, and neither steals from the other. **Softmax is one pie chart.** There is a fixed 100% to share, so if "Cat" takes 80%, "Dog" and "Bird" have to split the remaining 20%.

Use separate sigmoids when an example can belong to several classes at once (a photo tagged both "beach" and "dog"). Use softmax when exactly one class is right (this digit is a 7, not a 7 and a 1).

### Why classifiers use cross-entropy, not squared error

Squared error works for predicting numbers, but pair it with a sigmoid output and a trap appears: when the neuron is confidently *wrong*, it sits on the flat tail of the sigmoid, where the slope is almost zero, so the weight updates are tiny and learning crawls exactly when it most needs to hurry. **Cross-entropy** is a loss designed so that slope cancels out: the more wrong the neuron is, the bigger the correction. It is the default loss for classification for that reason.

## Try it

1. In the first diagram pick "Two clusters" and cycle through all four classifiers. Which ones draw nearly the same boundary? Why?
2. Switch to "XOR". Which classifier completely fails, and why can no single straight line ever solve it?
3. On "Spiral", compare SVM and Decision tree. Which boundary is smoother and which is staircase-shaped?
4. In the logistic regression diagram, drag the threshold to 0.9. Which examples flip from "pass" to "fail"? For a fraud detector where missing fraud is costly, would you raise or lower the threshold?
5. In the SVM diagram, shrink the margin to 0. Does the separating line itself move?
6. In the tree diagram, trace the path for someone aged 35 with an income of 40k. What is the prediction, and why would an unlimited-depth tree eventually reach 100% training accuracy?
7. A model reads a photo and must name the one animal in it: cat, dog or bird. Would you end it with separate sigmoids or a softmax, and why? What if the photo can contain several animals at once?

## Quick recap

| Tool | Real-life picture | What it does |
|---|---|---|
| Classification | Sorting mail into pigeonholes | Predicts which of a fixed set of classes an example belongs to |
| Decision boundary | A border on a map | The line where the predicted class flips |
| Sigmoid and threshold | A dimmer switch, then a pass mark | Turn a score into a probability, then into a yes/no |
| Margin and support vectors | A tightrope far from the furniture | SVM's widest gap, decided only by the nearest points |
| Kernel | Bending the map so a ruler works | Lets a simple boundary become a curve |
| Tree split | The next best yes/no question | Cuts the plane into rectangles |
| KNN | Asking the nearest neighbours | Majority vote of the closest K points |
