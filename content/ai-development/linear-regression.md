---
title: Linear regression
summary: Drawing the one straight line that fits the data best.
---

> [!aha] Linear regression is just "find the line that keeps every point as close as possible", with "close" measured honestly: square every miss so overshooting and undershooting both count, and big misses hurt more than small ones.

## The idea: predict a number with a straight line

Given points scattered on a graph, linear regression finds the line `y = mx + b` that fits them best: `m` is the slope, `b` is where it crosses the y-axis.

## "Best" means least squared error

For any candidate line, each point misses it by some amount (the **residual**). Square every residual and add them up: that total is the **sum of squared error (SSE)**. The best line is whichever `m` and `b` make SSE as small as possible.

```widget
linregfit
```

> [!compare] Think of it like adjusting a ruler laid across a scatter of dots, trying to get it as close to all of them at once, not perfect for any single one.

## Why *squared* error, not just "distance"

Squaring does two things: it makes every residual positive (so overshoots and undershoots don't cancel out), and it punishes a big miss far more than a small one. A model that is wildly wrong on one point loses more than a model that is slightly wrong on many.

## Try it

1. Drag the slope to 0 with the intercept near the middle of the data. Does a flat line ever get SSE to 0? Why not?
2. Find the slope and intercept that get SSE as low as you can manage. What do you notice about the dashed residual lines when SSE is small?
3. Why would adding one extreme outlier point pull the best-fit line toward it more than adding one ordinary point?

## Quick recap

| Tool | Real-life picture | What it does |
|---|---|---|
| Slope (m), intercept (b) | How steep, and where it starts | The two numbers that define the line |
| Residual | The gap between a dot and the line | How wrong the line is for one point |
| Sum of squared error | Total penalty, big misses cost more | What the best-fit line minimises |
