---
title: Linear regression
summary: Predicting a number with the one straight line that fits best, and why squared error decides which line that is.
---

> [!aha] Linear regression is supervised learning where the label is a number. The whole chapter is one question: which straight line keeps every point as close as possible, and what should "close" mean?

## Predicting a number with a line

**Regression** is the supervised-learning job where the answer is a number on a scale, like a house price or tomorrow's temperature. **Linear regression** is the simplest way to do it: it assumes the feature and the number are linked by a straight line, `y = m·x + b`, where the **slope** `m` says how much `y` rises for each step in `x` and the **intercept** `b` says where the line starts when `x` is 0. "Training" just means finding the best `m` and `b` from the examples, and once you have them, predicting is plugging a new `x` into the formula.

> [!compare] Think of a taxi fare. There is a fixed starting fee (the intercept) plus a price for every kilometre (the slope). Knowing those two numbers, you can predict the fare for any trip.

## "Best" means the least squared error

Draw any line through the dots and each dot misses it by some gap, called a **residual**. Square every gap and add them up, and you get the **sum of squared error (SSE)**. The best line is the one whose `m` and `b` make SSE as small as possible. Drag the sliders and watch the dashed gaps shrink, or press Best fit to jump to the winner.

```widget
linregfit
```

> [!compare] Think of laying a ruler across a scatter of dots and trying to get it as close to all of them at once, not perfect for any single one.

> [!more] Math: the best slope and intercept, in two lines
> SSE is a smooth bowl in `m` and `b`, so its lowest point is where both slopes are zero. Write `x̄` and `ȳ` for the averages:
>
> ```math
> SSE(m, b) = Σ (yᵢ − (m·xᵢ + b))²
> ∂SSE/∂b = −2 Σ (yᵢ − m·xᵢ − b) = 0          gives   b = ȳ − m·x̄
> ∂SSE/∂m = −2 Σ xᵢ (yᵢ − m·xᵢ − b) = 0       gives   m = Σ (xᵢ − x̄)(yᵢ − ȳ) / Σ (xᵢ − x̄)²
> ```
>
> The top of that fraction measures how `x` and `y` move together, and the bottom measures how much `x` spreads out on its own. For the 12 dots above the formulas give `m = 2.03` and `b = 3.07`, with SSE = 57.5, down from 1,358.8 for the starting guess `m = 1, b = 0`.
>
> Two names you will meet: the **mean squared error** `MSE = SSE / n` (the average miss, which lets you compare datasets of different sizes) and `RMSE = √MSE` (back in the same units as `y`, so an RMSE of 3 on prices means "typically off by about 3").

## Why squared, and not just the distance

Squaring does two jobs at once. It makes every gap positive, so a miss above the line and a miss below it cannot cancel out, and it punishes a big miss far more than a small one: one miss of 4 costs 16, while four misses of 1 cost only 4. The price is that one far-away dot pulls hard on the line. Drag the extra point up and down and watch the solid line swing away from the dashed one.

```widget
lsoutlier
```

> [!compare] Think of a tug of war where every dot pulls on the line with a force that grows with how far away it is. Ten dots close by are easily beaten by one dot very far away.

> [!more] TLDR: why not use the plain distance instead?
> Using the plain distance (the absolute error, **MAE**) also works, and it is less bothered by outliers. Squared error wins as the default for two reasons. Its slope shrinks smoothly toward zero as the line gets close, which is exactly what gradient descent likes, while the absolute value has a sharp corner at zero. And it has a clean answer by formula (the two lines above), with no searching needed. Squared error also matches a common assumption about the real world: if the noise in your data is bell-shaped, the line with the least squared error is also the most likely one.
>
> If your data has wild outliers that are mistakes, clean them first, or switch to MAE.

## More than one feature

Real problems have many features at once, and linear regression handles them the same way: give every feature its own weight, add a bias, and add it all up, so `price = w₁·size + w₂·rooms + w₃·age + b`. The best weights are still the ones that make SSE smallest. That is exactly the weighted sum from the MLP chapter, so linear regression is one neuron with no activation function.

| Features | Prediction rule | Picture |
|---|---|---|
| 1 | `y = m·x + b` | A line |
| 2 | `y = w₁x₁ + w₂x₂ + b` | A flat sheet (a plane) |
| Many | `y = w·x + b` | The same flat surface in many dimensions, which cannot be drawn but works the same |

> [!compare] Think of a restaurant bill. Each dish has a price (its weight), the bill is the quantity of each dish times its price, plus a service fee (the bias).

> [!more] Math: the same fit as one line of matrices, and by gradient descent
> Stack all `n` examples into a matrix `X` (one row each, plus a column of 1s for the bias) and all the labels into a vector `y`. The predictions are `ŷ = X·w`, and the weights with the least SSE have a closed form, called the **normal equation**:
>
> ```math
> w = (Xᵀ X)⁻¹ Xᵀ y
> ```
>
> That inverse gets slow and unstable when there are thousands of features. The alternative is gradient descent, which is what neural networks use. Start anywhere and repeat a small step downhill, where `η` is the learning rate:
>
> ```math
> m ← m − η · ∂MSE/∂m          ∂MSE/∂m = −(2/n) Σ xᵢ (yᵢ − ŷᵢ)
> b ← b − η · ∂MSE/∂b          ∂MSE/∂b = −(2/n) Σ (yᵢ − ŷᵢ)
> ```
>
> The Training a network chapter rolls this ball downhill for you.

## Where a straight line stops working

A line can only be straight. If the real pattern curves, like a ball's height over time, a line will miss in a systematic way however well it is fit, which is called **underfitting**. The usual fix is to give the model curved features such as `x²` and `x³` and fit again, and the next stops in this course (classification, ensembles and neural networks) are all ways to bend further. The Evaluation chapter shows how to tell a model that is too simple from one that is too wiggly.

## Try it

1. Press Best fit, then nudge the slope by one tick. How much does SSE rise? What does that say about how sharp the bottom of the bowl is?
2. Set the slope to 0 with the intercept near the middle of the data. Can a flat line ever reach SSE 0? Why not?
3. In the second diagram, drag the extra point to 0, then to 60. In which direction does it pull the slope each time?
4. Why would you not simply delete every outlier you see? Name a case where the outlier is the most important point.
5. A model predicts house price from size and number of rooms. How many weights does it learn, counting the bias?
6. Predictions from a linear model have an RMSE of 5,000 on prices. Is that good? What else would you need to know?

## Quick recap

| Tool | Real-life picture | What it does |
|---|---|---|
| Regression | Reading a number off a scale | Supervised learning whose label is a number |
| Slope and intercept | Price per kilometre, plus a starting fee | The two numbers that define the line |
| Residual | The gap between a dot and the line | How wrong the line is for one point |
| SSE, MSE, RMSE | Adding up the penalties, then averaging | The score the best-fit line makes as small as possible |
| Outlier | One far-away dot in a tug of war | A point that drags the line toward it |
| Several features | A restaurant bill | One weight per feature, plus a bias: one neuron without an activation |
