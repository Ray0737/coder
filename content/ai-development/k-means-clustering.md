---
title: K-means clustering
summary: No labels, no answer key. Just group the points that sit close together.
---

> [!aha] K-means has no "correct answers" to learn from. Given only a pile of points, it has to invent the groups itself, by repeating one simple move until nothing changes: join your nearest centre, then move each centre to the middle of its group.

## Unsupervised: there is no answer key

Every chapter so far had labels: spam/not spam, pass/fail, a known number to predict. **K-means** is **unsupervised**: the data has no labels at all. The goal is just to find **K** natural groups (clusters) in it.

## The loop: assign, then move, repeat

1. Place **K** centroids, anywhere to start.
2. **Assign**: every point joins whichever centroid is nearest.
3. **Update**: move each centroid to the average position of its group.
4. Repeat steps 2–3 until the assignments stop changing.

```widget
kmeanscluster
```

> [!compare] Think of it like K new students dropped at random spots in a crowded room. Everyone walks to their nearest student. Each of the K students then walks to the middle of the crowd around them. Repeat, and both the groups and the K students settle into place.

## You have to choose K

K-means does not discover how many groups there are, you tell it: K=3 above, always 3 groups, whether or not that matches the data. Picking a bad K gives clusters that don't mean much; this chapter's widget uses K=3 because that matches how the seeded data was generated.

## Try it

1. Step through every iteration above. Does any point ever change which centroid it's closest to after iteration 2?
2. Why does moving a centroid to the "average position of its group" make sense as the next guess for where the true centre is?
3. What would happen on iteration 0 if two of the three starting centroids happened to be placed in almost the same spot?

## Quick recap

| Tool | Real-life picture | What it does |
|---|---|---|
| Unsupervised learning | Sorting mail with no address labels | Finds structure in data that has no answer key |
| Centroid | A meeting point everyone walks toward | The current "centre" of one cluster |
| K | How many groups you decide to look for | Chosen before running the algorithm, not discovered by it |
