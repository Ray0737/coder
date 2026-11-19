---
title: PCA: dimensionality reduction
summary: Fewer numbers per example, almost none of the information lost.
---

> [!aha] If two features are strongly correlated, you don't really have two separate pieces of information, you have one piece of information measured twice. PCA finds that one real direction and lets you drop the redundant one.

## Why reduce dimensions at all

Real datasets often have dozens or hundreds of features, many of them overlapping in what they tell you. Fewer, better-chosen numbers per example means faster training, easier plotting, and less overfitting from the model chasing noise in redundant columns.

## Finding the direction of most spread

**Principal Component Analysis** looks at a cloud of points and finds the one straight line through it that keeps the most spread (the most **variance**) when every point is projected onto it. That line is the **first principal component (PC1)**.

```widget
pcavariance
```

> [!compare] Think of it like photographing a flat sheet of paper. Shoot it straight-on (along its real "flat" direction) and you lose almost nothing. Shoot it edge-on and the photo is just a line: all the useful spread is gone. PCA finds the angle that keeps the most of the paper visible.

## Reading "variance explained"

The bar chart above shows what share of the data's total spread each component captures. A high PC1 percentage means that one direction alone captures most of what makes the points differ from each other, so keeping just that one number per point (instead of the original two, or in real datasets, hundreds) loses comparatively little.

## Try it

1. If the points formed a perfect circle instead of a tilted oval, what would you expect PC1's share of the variance to be, compared to PC2's?
2. The widget's data was generated as `y ≈ 0.75x + noise`. Why does that formula make PC1 land close to that same slope?
3. Name one real feature pair in daily life that is likely strongly correlated, the way height and shoe size are, where PCA-style reduction would lose very little information.

## Quick recap

| Tool | Real-life picture | What it does |
|---|---|---|
| Dimensionality reduction | Summarising a long report in one paragraph | Fewer numbers per example, keeping most of the information |
| Principal component | The angle to shoot a flat photo of tilted paper | The direction through the data that keeps the most spread |
| Variance explained | How much of the paper that one photo shows | How much information one component keeps |
