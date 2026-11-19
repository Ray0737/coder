---
title: Unsupervised learning: K-means and PCA
summary: No labels, no answer key. Find the groups in the data, and find the few numbers that matter.
---

> [!aha] Unsupervised learning has no "correct answers" to learn from. Given only a pile of unlabelled data, it has to find structure on its own. Two classic jobs: **clustering** (which points belong together?) and **dimensionality reduction** (which few numbers capture most of the story?).

## Unsupervised: there is no answer key

Every chapter before this one had labels: spam or not spam, pass or fail, a known number to predict. Here the data has no labels at all. K-means finds natural groups in it. PCA squeezes many columns into a few. Neither one is told what the "right" result looks like.

| | Clustering (K-means) | Dimensionality reduction (PCA) |
|---|---|---|
| Question | Which points belong together? | Which few numbers keep most of the information? |
| Output | A group number for every point | A short list of new numbers for every point |
| Used for | Customer segments, grouping photos | Plotting, faster training, less overfitting |

## K-means: join the nearest centre, then move the centre

K-means finds **K** groups by repeating one simple move until nothing changes:

1. Place **K** centroids, anywhere to start.
2. **Assign**: every point joins whichever centroid is nearest.
3. **Update**: move each centroid to the average position of its group.
4. Repeat steps 2 and 3 until the assignments stop changing.

```widget
kmeanscluster
```

> [!compare] Think of K new students dropped at random spots in a crowded room. Everyone walks to their nearest student. Each of the K students then walks to the middle of the crowd around them. Repeat, and both the groups and the K students settle into place.

**You have to choose K.** K-means does not discover how many groups there are, you tell it: K=3 above means always 3 groups, whether or not that matches the data. A bad K gives clusters that do not mean much. The widget uses K=3 because that matches how its data was generated.

## PCA: fewer numbers, almost nothing lost

If two features are strongly correlated, you do not really have two separate pieces of information, you have one piece measured twice. **Principal Component Analysis** looks at a cloud of points and finds the one straight line through it that keeps the most spread (the most **variance**) when every point is projected onto it. That line is the **first principal component (PC1)**.

Real datasets often have dozens or hundreds of features, many overlapping in what they tell you. Fewer, better-chosen numbers per example means faster training, easier plotting, and less overfitting from the model chasing noise in redundant columns.

```widget
pcavariance
```

> [!compare] Think of photographing a flat sheet of paper. Shoot it straight-on and you lose almost nothing. Shoot it edge-on and the photo is just a line: all the useful spread is gone. PCA finds the angle that keeps the most of the paper visible.

The bar chart shows what share of the data's total spread each component captures ("variance explained"). A high PC1 share means that one direction alone captures most of what makes the points differ, so keeping just that one number per point (instead of the original two, or in real datasets, hundreds) loses comparatively little.

## Try it

1. Step through every iteration of K-means above. Does any point change which centroid it is closest to after iteration 2?
2. Why does moving a centroid to the "average position of its group" make sense as the next guess for the true centre?
3. What would happen on iteration 0 if two of the three starting centroids landed in almost the same spot?
4. If the points formed a perfect circle instead of a tilted oval, what would you expect PC1's share of the variance to be, compared to PC2's?
5. The PCA widget's data was generated as `y ≈ 0.75x + noise`. Why does that formula make PC1 land close to that same slope?
6. Name one real pair of features that is strongly correlated, like height and shoe size, where PCA would lose very little.

## Quick recap

| Tool | Real-life picture | What it does |
|---|---|---|
| Unsupervised learning | Sorting mail with no address labels | Finds structure in data that has no answer key |
| Centroid | A meeting point everyone walks toward | The current "centre" of one cluster |
| K | How many groups you decide to look for | Chosen before running the algorithm, not discovered by it |
| Dimensionality reduction | Summarising a long report in one paragraph | Fewer numbers per example, keeping most of the information |
| Principal component | The angle to shoot a flat photo of tilted paper | The direction through the data that keeps the most spread |
| Variance explained | How much of the paper one photo shows | How much information one component keeps |
