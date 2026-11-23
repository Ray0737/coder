---
title: Basic parameters
summary: Epoch, batch size and learning rate: the three dials that set the rhythm of training, not what is learned.
---

> [!aha] These three words describe the *rhythm* of training, not the model itself. Get them wrong and even a good model never learns well.

## Epoch: one full lap of the data

An **epoch** is one complete pass through every training example, once. Train for 10 epochs and the model has seen every example 10 times, each time adjusting its weights a little more.

> [!compare] Think of it like practicing a song. One epoch is playing it through once. You do not get good after one play-through, so you repeat it, epoch after epoch.

## Batch size: how many examples before a nudge

Weights are not updated after every single example, and not only once after all of them either. They are updated after a **batch**, a small group of examples, and the size of that group sets a trade-off between speed and steadiness.

| Batch size | What happens |
|---|---|
| 1 (stochastic) | Update after every single example. Fast but noisy, zig-zags toward the answer. |
| Small (e.g. 32) | A common middle ground: enough examples to average out noise, still fast. |
| All of it (full batch) | One very stable update per epoch, but slow and memory-heavy. |

## Learning rate: how big each nudge is

The **learning rate** scales every weight update. Too small and training crawls, too big and it overshoots the best answer and can get worse, not better. Pick one below to see what the loss does.

```widget
learningrate
```

## The valley picture

Picture every possible set of weights as a spot on the ground, and the loss ("how bad is the model here?") as the height at that spot. Training is rolling a ball downhill: the **gradient** is the slope under the ball, each update steps the opposite way (downhill), and the learning rate is the length of the step. The Training a network chapter lets you roll that ball yourself.

> [!tip] **Loss**, **cost** and **objective** function are three names for the same thing: the single number training tries to push down. Books and papers use all three.

> [!more] More: the full valley story, and why the starting point matters
> Peaks are terrible guesses and low ground is good ones. With two weights you could draw that landscape, but a real network has millions, so it cannot be drawn, though the idea is identical.
>
> One honest caveat: the ball only feels the slope right under it, so it can settle in a shallow dip instead of the deepest valley on the whole map. Where it starts matters, which is why the starting weights are random and why re-running training can give a slightly different model.

```cta
flask | Try the settings yourself | Change the learning rate, the activation and the batch size on a live network and watch what happens to the loss.
Neural network playground | @neural-playground | Pick data, layers and settings, and watch it learn
```

## Try it

1. If an epoch takes 1,000 examples and the batch size is 100, how many weight updates happen in one epoch?
2. Looking at the "Too high" curve above, why does the loss go up instead of down, even though the model is "training"?
3. Which setting would you change first if training were technically working, but painfully slow: epoch count, batch size, or learning rate? Why?
4. In the valley picture, what would a learning rate that is far too large do to the ball? What would it do if it were almost zero?

## Quick recap

| Tool | Real-life picture | What it does |
|---|---|---|
| Epoch | Playing a song through once | One full pass over every training example |
| Batch size | How many notes you check before adjusting | How many examples are averaged before one weight update |
| Learning rate | Stride length | How big each weight update is |
