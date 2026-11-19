---
title: SVM
summary: Not just any line between two groups. The one with the widest gap on both sides.
---

> [!aha] Lots of different lines could separate two groups of points. A support vector machine (SVM) does not settle for just any of them: it finds the one with the widest possible empty gap on either side.

## Many lines separate two groups. Only one is "best"

If two groups of points don't overlap, you could draw many different lines between them. SVM picks the line that maximises the **margin**: the gap between the line and the nearest point of each group.

```widget
svmmargin
```

## Support vectors: the only points that matter

The points sitting exactly on the edge of the margin are called **support vectors**. Move any other point further from the line and nothing changes. Move a support vector, and the whole line shifts. They are the only points the line actually depends on.

> [!compare] Think of it like a tightrope stretched as far as possible from the furniture on both sides of a room. Only the pieces of furniture closest to the rope decide how it's stretched; moving a chair against the far wall changes nothing.

## Why the widest margin, specifically?

A line that barely squeezes between the two groups is fragile: a new point just slightly off from training data could land on the wrong side. A wide margin leaves the most breathing room for new, unseen points to still land correctly.

## Try it

1. Shrink the margin to 0. Does the separating line itself move?
2. Why might a *very* wide margin eventually start cutting into one of the two groups, if you kept increasing it on real (not perfectly separated) data?
3. Both logistic regression and SVM can separate two groups with a line. What does SVM specifically optimise for, that plain logistic regression does not?

## Quick recap

| Tool | Real-life picture | What it does |
|---|---|---|
| Margin | A tightrope as far as possible from furniture on both sides | The gap SVM tries to maximise |
| Support vectors | The nearest pieces of furniture | The only points that decide where the line goes |
| Separating line | The rope itself | The boundary between the two groups |
