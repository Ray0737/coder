---
title: Ensembles
summary: Why a committee of simple models beats one big model, and the two ways to build one: random forests and gradient boosting.
---

> [!aha] An ensemble is a committee of simple models whose answers are combined. It is still supervised learning, for classes or numbers, and it works because models that make different mistakes cancel each other out.

## Why many weak models beat one

A **weak model** is only a little better than guessing, say right 60% of the time. Ask a hundred of them and take the majority vote, and the committee is right about 98% of the time. The trick is that when the models make *different* mistakes, a wrong vote from one is usually outvoted by right votes from the rest, so the errors wash out while the correct answers add up. Set how good each model is and how many vote, and watch the committee's accuracy climb above the dashed line of a single model.

```widget
ensemblevote
```

> [!compare] Think of a jar of jellybeans at a fair. Most people guess badly, some too high and some too low, but the average of everyone's guesses is usually very close, because the high and low errors cancel.

> [!more] Math: the chance a majority is right
> If each of `n` voters (odd) is right with probability `p`, independently, the majority is right when more than half of them are, which is a binomial sum:
>
> ```math
> P(majority right) = Σ C(n, k) · p^k · (1 − p)^(n − k)          summed over every k above n/2
> ```
>
> With `p = 0.6`, one model is right 60% of the time, 11 models 75%, 25 models 85%, 51 models 93% and 101 models 98%. If the models are *not* independent, the gain shrinks. For `n` models whose errors each have variance `σ²` and pairwise correlation `ρ`, the average has variance:
>
> ```math
> Var(average) = ρ · σ² + (1 − ρ) · σ² / n
> ```
>
> The second part vanishes as `n` grows, but the first never does. So a good ensemble needs models that are individually decent *and* different from each other, and the next two sections are two different ways to get that.

## Random forest: many trees on shuffled data

A **random forest** trains many decision trees at once, and each tree sees a different random version of the problem. This trick is called **bagging**, short for bootstrap aggregating: every tree gets its own **bootstrap sample** (the same number of rows, drawn at random *with replacement*, so some rows repeat and some are missing), and at each split it only considers a random feature. The trees then vote. One fully grown tree memorises the noise and draws a jagged boundary, but the forest averages the jagged parts away. Compare the two on the half-moons below, and score both on fresh points that no tree has seen.

```widget
forestdemo
```

> [!compare] Think of asking a hundred doctors for a diagnosis, where each has read a different random handful of the case files. Any one of them has odd blind spots, but their majority opinion is far steadier.

> [!more] TLDR: why trees, and what the two random tricks do
> A single deep tree has very little bias but a lot of variance: change the data a little and the whole tree changes. That is exactly the kind of model that gains from averaging. The two tricks (resampling the rows, and a random feature at each split) exist to make the trees *different* from each other, which is the `ρ` in the formula above. Forests are also hard to ruin: more trees never hurt, and the default settings usually work.
>
> A free bonus: each tree leaves out about a third of the rows. Scoring every row using only the trees that never saw it gives an honest test score without a separate test set, called the **out-of-bag score**.

> [!more] Math: how much of the data each tree sees
> Draw `n` rows with replacement. The chance a particular row is never picked is `(1 − 1/n)^n`, which tends to `1/e` as `n` grows:
>
> ```math
> unique rows in a bootstrap sample ≈ 1 − 1/e ≈ 63.2%          left out ("out-of-bag") ≈ 36.8%
> ```

## Gradient boosting: each tree fixes the last one's mistakes

**Boosting** builds the committee in a different way: one tree at a time, in a row, with every new tree trained on whatever the committee so far still gets wrong. The first guess is just the average. Then you measure the gaps between the guess and the truth (the leftovers), fit a tiny tree to those gaps, and add a small fraction of it, set by the **learning rate**. Repeat, and the leftovers shrink round after round. Add rounds below and watch the orange line crawl toward the dots, and keep an eye on the test error, because adding rounds forever eventually starts chasing noise.

```widget
boostdemo
```

> [!compare] Think of a golfer. The first shot gets near the hole, and every next shot is a small correction from wherever the ball landed, not a fresh attempt from the tee.

> [!more] TLDR: XGBoost, LightGBM and when to stop
> **XGBoost**, **LightGBM** and **CatBoost** are fast, careful implementations of this same idea, with extras like penalties on overly complex trees, handling of missing values and training on many cores. The knobs that matter most are the learning rate (smaller is safer but needs more rounds), the depth of each tree (usually shallow) and the number of rounds. Instead of guessing that last one, you keep a validation set and stop once its error stops improving, which is called **early stopping**.

> [!more] Math: boosting is gradient descent on the predictions
> Let `F` be the committee's prediction, `h` the new small tree and `η` the learning rate:
>
> ```math
> F_new(x) = F_old(x) + η · h(x)          h is fit to the leftovers   rᵢ = yᵢ − F_old(xᵢ)
> ```
>
> Why those leftovers? For squared error `L = ½ (y − F)²`, the negative slope with respect to the prediction is `−∂L/∂F = y − F`, which is exactly the leftover. So each new tree is a step of gradient descent, taken in the space of predictions instead of the space of weights. For other losses (such as cross-entropy for classes) the leftover is replaced by that loss's negative slope, which is why it is called *gradient* boosting.

## Forest or boosting?

Both build many trees, but in opposite ways. A forest grows its trees independently and averages them, so it mostly fixes variance. Boosting grows them in order, each correcting the last, so it mostly fixes bias, and it usually reaches a higher score but needs more care to tune.

| | Random forest | Gradient boosting |
|---|---|---|
| How trees are built | All at once, independently | One after another, each fixing the last |
| Each tree is | Deep and jagged | Small and shallow |
| Mainly reduces | Variance (overfitting) | Bias (underfitting) |
| Tuning | Forgiving, defaults often fine | More knobs, can overfit with too many rounds |
| Training | Easy to run in parallel | Sequential by nature |

## When to pick it over a neural network

For a table of rows and columns (customers, loans, sensor readings), boosted trees or a forest are usually the first thing to try, and they often match or beat a neural network with far less data, tuning and training time. Neural networks pull ahead when the input is raw pixels, sound or text, where the features must be learned layer by layer, which is what the CNN, RNN and Transformer chapters are about.

| Your data | A good first choice |
|---|---|
| A spreadsheet or database table | Gradient boosting, or a random forest |
| A few hundred to a few thousand rows | A forest or boosting (a neural network needs more) |
| Images, audio, long text | A neural network |
| You must explain each prediction | A single small tree, or a linear model |

> [!compare] Think of a toolbox. The neural network is the power tool, brilliant for big jobs like images and language, and the boosted tree is the dependable hand tool you reach for first on a table.

> [!more] TLDR: why trees do so well on tables
> Table columns are a mixed bag: different units, missing values, and no built-in order like pixels or words have. A tree asks one yes/no question about one column at a time, so it needs no scaling and copes with all of that, while a neural network has to be tuned to cope. A 2022 benchmark by Grinsztajn, Oyallon and Varoquaux (*Why do tree-based models still outperform deep learning on typical tabular data?*) found trees still ahead on medium-sized tables. That is a result about typical benchmarks and not a law, so on your own data the way to know is to try both and compare them, as the Evaluation chapter shows.

## Try it

1. In the voting diagram set each model to 50% right and add more models. What happens, and why can a committee of coin flips never help?
2. Set each model to 60% right. About how many models does the committee need to reach 95%?
3. In the forest diagram, compare One tree and Random forest on the fresh points. Why is the single tree's 100% on training points not good news?
4. Move the trees slider from 1 up to 30. Where does adding more trees stop helping?
5. In the boosting diagram, pick learning rate 1 and drag the rounds to 100. What happens to training error and to test error?
6. Why can a forest be trained on many computers at once while boosting cannot?
7. You have 5,000 customers in a spreadsheet and want to predict who will cancel. Then you have 10,000 photos and want to name the animal in each. Which model family first, for each?

## Quick recap

| Tool | Real-life picture | What it does |
|---|---|---|
| Ensemble | A committee of advisers | Combines many models' answers into one |
| Weak model | A guesser a little better than a coin flip | Individually modest, useful when its mistakes differ from the others' |
| Bagging, bootstrap | Each adviser reads a different random set of files | Trains every model on its own resample of the rows |
| Random forest | A hundred doctors voting | Many deep trees, each on a different resample, averaged |
| Boosting | A golfer correcting each shot | Small trees added in a row, each fit to what is still wrong |
| Learning rate, early stopping | Small steps, and stopping on time | Control how fast boosting learns and when it quits |
| Out-of-bag score | Marking the questions an adviser never studied | A free test score from the rows each tree left out |
