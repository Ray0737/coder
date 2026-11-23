---
title: Training a network
summary: Score the answer with a cost, roll downhill with gradient descent, and let backpropagation work out every weight's share of the blame.
---

> [!aha] Training is one loop: guess, measure how wrong, work out which weights to blame, nudge them. Everything in this chapter is a way to do one of those four steps better.

This chapter picks up where the MLP chapter stopped: a network of smooth sigmoid neurons with about 24,000 weights and biases, all starting as random numbers. It follows Chapters 1 to 3 of Michael Nielsen's [Neural Networks and Deep Learning](http://neuralnetworksanddeeplearning.com/). The plain story is in the text, and every proof sits in a dropdown.

## Step 1: how wrong is it? The cost function

Training needs a single number for "how wrong is the network right now". That number is the **cost** (also called the loss). Nielsen starts with the **quadratic cost**: for each training example, take the gap between the network's output and the right answer, square it, and average over all the examples. A perfect network scores 0, and the bigger the misses, the bigger the cost. Why not simply count how many digits it got right? Because that count jumps in whole steps as weights change, which is the same trap as the hard step neuron: a small nudge usually changes nothing, and sometimes changes everything. The cost is smooth, so it can guide the nudges.

> [!more] Math: the quadratic cost
> For `n` training examples `x`, with `y(x)` the right answer and `a` the network's output:
>
> ```math
> C(w, b) = (1 / 2n) · Σₓ ‖ y(x) − a ‖²
> ```
>
> The cost depends on all the weights `w` and biases `b`, because the output `a` does. Training means finding the `w` and `b` that make `C` as small as possible. The `½` is only there to cancel the `2` that appears when you take a derivative. Squaring also makes every term positive, so errors in opposite directions cannot cancel each other out.

## Step 2: gradient descent, rolling downhill

Picture the cost as a hilly landscape, where each position is one setting of the weights and the height is the cost. You are somewhere on a hillside in fog and cannot see the valley, but you can feel the slope under your feet. **Gradient descent** says: feel the slope, take a small step downhill, repeat. The size of each step is the **learning rate** `η`. Too small and you crawl, too big and you leap over the valley and land higher on the other side. In the widget the cost is `C = (w − 3)²`, so the bottom is at `w = 3`. Try 0.1, then 0.9, then 1.05.

```widget
gdball
```

> [!more] Math: why stepping against the gradient always lowers the cost
> Let `v` be all the weights and biases written as one long vector. For a small move `Δv`, calculus gives:
>
> ```math
> ΔC ≈ ∇C · Δv                          (∇C is the vector of all the slopes ∂C/∂vⱼ)
> ```
>
> Choose the move `Δv = −η ∇C` with a small positive `η`. Then:
>
> ```math
> ΔC ≈ ∇C · (−η ∇C) = −η ‖∇C‖²  ≤  0
> ```
>
> Because `‖∇C‖²` is never negative, the cost can only go down (to first order). So the update rule is, for every weight and bias:
>
> ```math
> wₖ → wₖ − η · ∂C/∂wₖ          bₗ → bₗ − η · ∂C/∂bₗ
> ```
>
> The catch is "to first order". The formula is only an approximation for small moves, which is why `η` has to be small. In the widget, the exact update is `w → w − η·2(w − 3)`, so the distance to the bottom shrinks by a factor `(1 − 2η)` each step. That is below 1 in size only when `η < 1`, which is why 1.05 diverges.

## Step 3: stochastic gradient descent and mini-batches

The true gradient adds up the slope from every training example, which is slow when there are 60,000 of them. The shortcut is to pick a small random **mini-batch**, say 10 examples, measure the slope on just those, and step. The estimate is noisy, but it points roughly the right way, and you can take thousands of cheap noisy steps for the price of a few exact ones. One full lap through all the data, batch after batch, is an **epoch**. Switch the widget above to "Noisy gradient" to see the path jitter and still drift downhill. The Basic parameters chapter covers epoch, batch size and learning rate on their own.

> [!compare] Think of an election poll. You do not ask every voter, you ask a random few hundred and get a good estimate of the whole. A mini-batch is a poll of the training data.

> [!more] Math: the mini-batch estimate
> Pick a random mini-batch of `m` examples `X₁ … Xₘ`. If `m` is big enough, the average of their gradients is close to the average over all `n`:
>
> ```math
> (1/m) Σⱼ ∇C_{Xⱼ}  ≈  (1/n) Σₓ ∇C_x  =  ∇C
> ```
>
> So the update becomes:
>
> ```math
> wₖ → wₖ − (η/m) Σⱼ ∂C_{Xⱼ}/∂wₖ          bₗ → bₗ − (η/m) Σⱼ ∂C_{Xⱼ}/∂bₗ
> ```
>
> Take mini-batches until the training data is used up, and that is one epoch. Then start a new epoch with the data reshuffled. With `m = 1` this is called online learning, and with `m = n` it is plain gradient descent.

## The landscape: global minimum, local minimum and flat spots

The 1D widget had one valley. A real cost has many weights, so it is a landscape. The picture below is the 2-weight version, the only one we can draw. The two **horizontal axes** are two weights, so every spot on the floor is one setting of the network. The **height** is the cost for that setting, and the colour repeats it: dark blue is low, orange is high. The red ball is your network right now, the white line is the path gradient descent has taken, and training means rolling the ball as low as it will go. Turn the surface with the slider, then try the other two views: the top view is the same landscape seen from above like a map (click it to drop the ball anywhere), and the side slice is a straight cut through both valleys.

```widget
lossland3d
```

There are three kinds of spot worth naming, and each one is on this surface.

```tgrid
Global minimum | The lowest point on the whole landscape (green ring). This is the best set of weights there is.
Local minimum | A valley that is only lowest in its own neighbourhood (orange ring). Every nearby direction goes uphill, so the slope is zero and gradient descent stops, even though a lower point exists elsewhere.
Plateau or saddle | A flat stretch where the slope is almost zero but it is not a minimum: a saddle is a mountain pass, uphill one way and downhill the other. Descent slows to a crawl here. Watch Start C.
```

> [!more] Math: telling a minimum, a maximum and a saddle apart
> A flat spot is a point where every slope is zero: `∇C = 0`. To tell what kind it is, look at the curvature in every direction. The **Hessian** `H` is the matrix of second derivatives `∂²C/∂vᵢ∂vⱼ`, and its eigenvalues are the curvatures along its principal directions:
>
> ```math
> all eigenvalues of H positive     →  every direction curves up    →  a minimum
> all eigenvalues of H negative     →  every direction curves down  →  a maximum
> a mix of positive and negative    →  a saddle (up one way, down another)
> ```
>
> **Why this matters as the number of weights `d` grows.** A minimum needs all `d` curvatures to be positive at once. If you pictured each curvature as an independent coin flip, the chance that all `d` come up positive is `(1/2)ᵈ`, which collapses as `d` grows, while a mix of signs (a saddle) becomes overwhelmingly common. Real curvatures are not independent coins, so treat this as intuition rather than a proof, but it is the usual reason given for why flat spots in big networks are mostly saddles.
>
> **A local and a global minimum in the widget.** The surface is `C = 0.12(x² + y²) − 1.6·e^(−((x−1.5)² + (y−1.5)²)/0.9) − 1.0·e^(−((x+1.5)² + (y+1)²)/0.9)`: a shallow bowl with two Gaussian dents. The deeper dent at about `(1.4, 1.4)` has cost `−1.09` (global) and the shallower one at about `(−1.35, −0.9)` has cost `−0.65` (local). Both have `∇C = 0` and positive curvature, and only the cost tells them apart. Gradient descent only ever sees the slope under the ball, never the whole map, so it cannot know the other valley is lower.

## Step 4: backpropagation, who is to blame?

Gradient descent needs `∂C/∂w` for all 24,000 weights. Working each one out separately would be far too slow. **Backpropagation** gets all of them in one forward pass and one backward pass. Run the input forward and record every value. Then start at the output, where the blame is easy to see, and walk backwards: each layer's blame is the next layer's blame, pushed back through the same weights the answer travelled forward through. Each weight's share of the blame is how active its input was times the blame at its output. Step through a tiny 2-2-1 network below, with real numbers you can check.

```widget
backproptiny
```

> [!compare] Think of grading a group project from the end backwards. The final result was wrong, so you ask who contributed most, walk back through each stage, and nudge everyone who played a part.

> [!more] Math: the four backpropagation equations, with proofs
> Define the **error** of neuron `j` in layer `l` as how much the cost changes per unit change in its weighted sum: `δˡⱼ = ∂C/∂zˡⱼ`. Here `L` is the last layer, `σ′` is the sigmoid's slope, and `⊙` means multiply element by element.
>
> ```math
> BP1   δᴸ = ∇ₐC ⊙ σ′(zᴸ)                        error at the output
> BP2   δˡ = ((Wˡ⁺¹)ᵀ δˡ⁺¹) ⊙ σ′(zˡ)              push the error back one layer
> BP3   ∂C/∂bˡⱼ  = δˡⱼ                             gradient of a bias
> BP4   ∂C/∂wˡⱼₖ = aˡ⁻¹ₖ · δˡⱼ                     gradient of a weight
> ```
>
> **Proofs.** All four are the chain rule.
>
> - **BP1.** `δᴸⱼ = ∂C/∂zᴸⱼ = (∂C/∂aᴸⱼ)(∂aᴸⱼ/∂zᴸⱼ)`, and `aᴸⱼ = σ(zᴸⱼ)`, so `∂aᴸⱼ/∂zᴸⱼ = σ′(zᴸⱼ)`. For the quadratic cost, `∂C/∂aᴸⱼ = aᴸⱼ − yⱼ`.
> - **BP2.** A change in `zˡⱼ` reaches the cost only through the next layer's sums, so `δˡⱼ = Σₖ (∂C/∂zˡ⁺¹ₖ)(∂zˡ⁺¹ₖ/∂zˡⱼ) = Σₖ δˡ⁺¹ₖ · ∂zˡ⁺¹ₖ/∂zˡⱼ`. Since `zˡ⁺¹ₖ = Σⱼ wˡ⁺¹ₖⱼ σ(zˡⱼ) + bˡ⁺¹ₖ`, the derivative is `wˡ⁺¹ₖⱼ σ′(zˡⱼ)`, which gives BP2.
> - **BP3.** `zˡⱼ = Σₖ wˡⱼₖ aˡ⁻¹ₖ + bˡⱼ`, so `∂zˡⱼ/∂bˡⱼ = 1` and `∂C/∂bˡⱼ = δˡⱼ`.
> - **BP4.** The same sum gives `∂zˡⱼ/∂wˡⱼₖ = aˡ⁻¹ₖ`, so `∂C/∂wˡⱼₖ = aˡ⁻¹ₖ δˡⱼ`.
>
> **The algorithm for one example:** (1) set `a⁰ = x`; (2) forward: `zˡ = Wˡ aˡ⁻¹ + bˡ`, `aˡ = σ(zˡ)` for each layer; (3) compute `δᴸ` with BP1; (4) backward: compute `δˡ` for each earlier layer with BP2; (5) read off every gradient with BP3 and BP4. Average over the mini-batch, then update.
>
> **A worked example you can check by hand.** One neuron per layer, `x = 1`, target `y = 1`, with `w₁ = 0.5, b₁ = 0, w₂ = 1, b₂ = 0` and `η = 1`.
>
> ```
> forward:   z₁ = 0.5            a₁ = σ(0.5)    = 0.6225
>            z₂ = 1 × 0.6225     a₂ = σ(0.6225) = 0.6508
> cost:      C = ½(0.6508 − 1)²                 = 0.0610
> BP1:       δ₂ = (a₂ − y) · a₂(1 − a₂) = (−0.3492)(0.2273)      = −0.07937
> BP2:       δ₁ = w₂ · δ₂ · a₁(1 − a₁)  = (1)(−0.07937)(0.2350)  = −0.01865
> BP3, BP4:  ∂C/∂b₂ = −0.07937   ∂C/∂w₂ = a₁ δ₂ = −0.04940
>            ∂C/∂b₁ = −0.01865   ∂C/∂w₁ = x δ₁  = −0.01865
> update:    w₁ = 0.5187, b₁ = 0.0187, w₂ = 1.0494, b₂ = 0.0794
> again:     a₂ = 0.6774,  C = 0.0520      (was 0.6508 and 0.0610)
> ```
>
> One backward pass nudged all four parameters, and the cost fell from 0.0610 to 0.0520. The widget above runs the same procedure on a 2-2-1 network.

## Step 5: a better cost, cross-entropy

The S-curve is a sigmoid neuron's output plotted against `z`: flat near 0 on the left, flat near 1 on the right, and steep only in the middle, like a dimmer switch that is stiff at both ends. A neuron that should say 0 but confidently says 0.98 sits on the flat top, where the quadratic cost's learning signal (multiplied by that near-zero slope) is almost nothing, so it barely learns exactly when it is most wrong. **Cross-entropy** fixes this by scoring *surprise* instead of the plain gap: the cost is `−ln(chance given to the right answer)`. Saying 0.98 when 0 was right gave the truth only a 2% chance, which is a huge surprise and a big nudge, and the flat slope cancels out of the gradient. The table shows the cost, and the widget below compares the two costs on the same mistake.

| The network gave the right answer a chance of | Surprise (cost) |
|---|---|
| 98% | 0.02 |
| 50% | 0.69 |
| 10% | 2.30 |
| 2% | 3.91 |
| 0.1% | 6.91 |

```widget
costcompare
```

> [!more] Math: why the sigmoid's slope cancels
> For one example, one output neuron `a = σ(z)`, target `y`, input `x` on the weight:
>
> ```math
> C = −[ y · ln a + (1 − y) · ln(1 − a) ]
> ```
>
> For a target of `y = 1` this is `−ln a`, and for `y = 0` it is `−ln(1 − a)`: exactly the "surprise" in the table above. It is positive, and it is near 0 when `a ≈ y`, so it behaves like a cost. Now differentiate with the chain rule:
>
> ```math
> ∂C/∂a = −y/a + (1 − y)/(1 − a) = (a − y) / (a(1 − a))
> ∂a/∂z = σ′(z) = a(1 − a)
> ∂C/∂w = (∂C/∂a)(∂a/∂z)(∂z/∂w) = (a − y) · x
> ```
>
> The factor `a(1 − a)`, which is tiny when the neuron is saturated, cancels completely. The gradient is just "error times input", and the same cancellation makes BP1 simply `δᴸ = a − y`. For the quadratic cost the gradient is `(a − y) σ′(z) x`, which is why it stalls. That is why classifiers use cross-entropy rather than squared error.

## Step 6: smarter steps, the optimizers

Plain gradient descent uses only the slope under your feet. Optimizers also remember where you have been. **Momentum** keeps rolling in a steady direction, like a heavy ball. **RMSprop** divides each step by how big that weight's recent slopes were, so steep, jumpy directions slow down and gentle ones speed up. **Adam** does both, and it is the usual default: start with Adam and a learning rate of 0.001.

> [!more] Math: the update rules, and when to use which
> Here `g` is the gradient and `lr` is the learning rate.
>
> ```python
> # SGD
> w = w - lr * g
>
> # Momentum: v remembers the direction (beta is about 0.9)
> v = beta * v + g
> w = w - lr * v
>
> # RMSprop: s remembers how big the gradients were (rho is about 0.9)
> s = rho * s + (1 - rho) * g ** 2
> w = w - lr * g / (s ** 0.5 + 1e-8)
>
> # Adam: both memories at once (beta1 0.9, beta2 0.999, lr 0.001 are the usual defaults)
> m = beta1 * m + (1 - beta1) * g
> s = beta2 * s + (1 - beta2) * g ** 2
> w = w - lr * m / (s ** 0.5 + 1e-8)       # real Adam also corrects m and s for the first few steps
> ```
>
> | Optimizer | What it remembers | Good at | Watch out for |
> |---|---|---|---|
> | SGD | nothing | simple, light, can generalise well | slow, very sensitive to the learning rate |
> | Momentum | the direction it has been going | valleys and flat patches | can overshoot a minimum |
> | RMSprop | the recent size of the gradients | uneven gradients | the learning rate still needs tuning |
> | Adam | both of the above | a strong default | sometimes ends a little worse than well-tuned SGD |
> | AdamW | both, plus clean weight decay | Transformers and big models | the same tuning as Adam |

## Step 7: why deep networks are hard to train

Add hidden layers and, oddly, training can get *worse*. The reason is the **vanishing gradient**. The blame for a wrong answer is passed back layer by layer, and every layer multiplies it by a small number: the weight times the sigmoid's slope, which is never more than 0.25. By the time it reaches the early layers almost nothing is left, so they barely learn while the last layers learn fine.

> [!compare] Think of a game of telephone. The blame is whispered back through every layer, each one a little quieter, until the first layer hears nothing.

In Nielsen's MNIST tests, with the same settings each time, extra hidden layers stopped helping after the second:

| Hidden layers | 1 | 2 | 3 | 4 |
|---|---|---|---|---|
| Test accuracy | 96.48% | 96.90% | 96.57% | 96.53% |

> [!more] Math: the product that shrinks, and the fixes
> Take the simplest deep network: one neuron per layer, four layers. Following BP2 all the way back, the gradient on the first bias is a product:
>
> ```math
> ∂C/∂b₁ = σ′(z₁) · w₂ σ′(z₂) · w₃ σ′(z₃) · w₄ σ′(z₄) · ∂C/∂a₄
> ```
>
> With standard starting weights `|w| < 1`, and `σ′ ≤ 0.25`, every factor `w σ′` is below `1/4`. Each extra layer cuts the first layer's gradient by at least four. You cannot cure it by making the weights huge: a large `w` also pushes `z` out onto the flat tails of the sigmoid, where `σ′(z)` is tiny again. Across many layers the product is also unstable, not only small: it only stays near 1 if the factors happen to balance, which by chance they almost never do.
>
> **Fixes.**
>
> | Fix | How it helps |
> |---|---|
> | ReLU | No flat side, so the slope stays 1 for positive inputs |
> | Smaller starting weights | Start `z` near 0, where the sigmoid is steep |
> | A sensible optimizer | Momentum and per-weight step sizes keep early layers moving |
> | Dropout | Randomly bench some neurons each step, so none can be relied on alone |
> | Batch normalization | Rescale the numbers between layers so they stay in a healthy range |
>
> **Why starting weights matter.** If every weight starts from a bell curve with spread 1, a neuron with 1,000 inputs (500 of them on) has `z` with variance `500 + 1 = 501`, so a typical `z` is about 22 away from 0, far out on the flat tail. Draw each weight with spread `1/√n_in` instead, and the variance of `z` is `500 × (1/1000) + 1 = 1.5`. Now `z` starts near 0 and learning can take off at once.

## Watch it learn: MNIST

[MNIST](https://en.wikipedia.org/wiki/MNIST_database) is 70,000 small handwritten digits, 0 to 9, the "hello world" of deep learning (you can also [download the dataset](http://yann.lecun.com/exdb/mnist/) from its creator, Yann LeCun). Below is a simulated training run of a small MLP: scrub the epoch slider and watch the loss drop, the guesses improve, and the first hidden layer's weights settle into shapes.

```widget
mnisttrainingreplay
```

Three ways to look at the same run:

```tgrid
Bird's Eye | The loss curve. Train loss (solid) always falls. Validation loss (dashed) falls too, then creeps back up late: the network is starting to memorise instead of generalise. That is **overfitting**, from the Evaluation chapter, happening live.
Neuron Level | Ten sample digits with the model's current guess and confidence, plus a peek at 16 of the first hidden layer's neurons. Early on their weights look like static. Later, patterns appear: some neurons specialise in a stroke, a loop, a corner.
Math Level | The same formulas from this chapter (`z`, the activation, the cost, the gradient step), with this epoch's real numbers dropped in.
```

```cta
flask | See it for yourself | Train a small network in your browser, or put an MLP next to a CNN and compare them.
Neural network playground | @neural-playground | Pick data, layers and settings, and watch it learn
Neural network comparison | @compare#MLP,CNN | MLP next to a CNN
```

## Try it

1. In the gradient descent widget, find the largest learning rate that still settles at w = 3. What does the maths say it should be?
2. Switch to "Noisy gradient". Does it reach exactly w = 3? Why not? What would help?
3. In the landscape widget, find a start (click the top view) that ends in the global minimum with plain gradient descent, and one that ends in the local minimum. What do the good starts have in common?
4. In the backprop widget, which is bigger at the end, the output δ or the hidden δs? Why does the hidden one come out smaller?
5. In the cost widget, pick "Mildly wrong" and compare the two lines. When does the choice of cost matter, and when does it hardly matter?
6. A sigmoid's slope is at most 0.25. Roughly how much of a gradient is left after passing back through 5 layers if every weight is about 1? Why does ReLU avoid this?
7. Why does making one weight huge not cure a vanishing gradient?
8. Scrub the MNIST replay past epoch 55. Why does the validation line rise while the train line keeps falling?

## Quick recap

| Tool | Real-life picture | What it does |
|---|---|---|
| Cost function | A score for how wrong you are | One smooth number the training tries to push down |
| Gradient descent | Feeling the slope in fog and stepping downhill | Nudges every weight against the slope of the cost |
| Learning rate | Stride length | How big each nudge is |
| Mini-batch, epoch | An election poll, and one full lap of the data | A cheap noisy estimate of the slope, and one pass over all the data |
| Backpropagation | Grading a group project from the end backwards | Works out every weight's share of the blame in one backward pass |
| Cross-entropy | Learning faster the more wrong you are | A cost whose gradient is just error times input, so it never stalls |
| Optimizer (Momentum, Adam) | A heavy ball with shock absorbers | Uses the memory of past slopes to take better steps |
| Vanishing gradient | A whisper passed down a long line | Early layers get almost no learning signal in deep networks |
| Dropout, batch norm, weight init | Benching players, re-centring a scale, a fair starting line | Tricks that keep training stable and fast |
