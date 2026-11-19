---
title: Decision tree
summary: A flowchart of yes/no questions that a machine learns to ask by itself.
---

> [!aha] A decision tree is the "20 questions" game, except the model worked out which questions to ask, and in what order, by seeing which ones split the data most cleanly.

## Reading a tree

Every box that isn't a leaf is a yes/no question about one feature. Follow the arrows from the top down, and you land on a leaf: the prediction.

```widget
decisiontree
```

## How a tree picks its questions

At each box, the tree tries lots of possible questions ("Age < 30?", "Income < 50k?", ...) and picks whichever one splits the data into the *purest* groups: ideally, each resulting group is mostly one answer, not a 50/50 mix. It repeats this for every new box, going deeper until the groups are pure enough or it hits a limit.

> [!compare] Think of it like sorting a pile of mixed coins by asking the fewest, most useful questions: "Is it silver or gold coloured?" splits it better than "Does it have a 7 on it?"

## The trade-off: deeper trees overfit

A tree with no limit on depth can keep splitting until every single training example has its own leaf: perfect training accuracy, and an overfit mess that fails on new data. Real trees are usually limited in depth, or pruned back afterward, trading a little training accuracy for a model that actually generalises.

## Try it

1. Starting at the root in the diagram, trace the path for someone aged 35 with an income of 40k. What's the prediction?
2. Why would letting a tree grow infinitely deep eventually guarantee 100% training accuracy?
3. Looking at the overfitting chapter's U-shaped curve, where on that curve would an unlimited-depth tree probably sit?

## Quick recap

| Tool | Real-life picture | What it does |
|---|---|---|
| Decision tree | A game of 20 questions | A chain of yes/no splits ending in a prediction |
| Split | The best next question to ask | Chosen to make the resulting groups as pure as possible |
| Depth limit / pruning | Stopping before you ask every possible question | Keeps the tree from memorising the training data |
