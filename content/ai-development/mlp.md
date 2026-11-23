---
title: MLP
summary: From one voting neuron to a stack of smooth sigmoid neurons: why the step had to go, and what a layered network computes.
---

> [!aha] A neural network is a stack of tiny voting booths. The whole story of this chapter is one swap: replace the hard on/off decision with a smooth one, so that a small change in a weight makes a small change in the answer.

Everything here follows the first chapter of Michael Nielsen's free book [Neural Networks and Deep Learning](http://neuralnetworksanddeeplearning.com/). The maths for each idea sits in a dropdown, so you can read the plain story first and open the proof only when you want it.

## The perceptron: a neuron that votes

A perceptron is a tiny voting booth. Every input casts a vote, some votes count more than others (the **weight**), and there is a fixed head start (the **bias**). The booth adds it all up into one number `z`, the **weighted sum**, and then makes a hard yes/no call: output 1 if `z` is above zero, otherwise 0. The bias is just the old "is the total above some threshold?" rule with the threshold moved to the other side of the inequality. Drag the weights and the bias and watch `z` change.

```widget
perceptron
```

> [!more] Math: weights, bias, threshold, and a NAND gate
> A perceptron with inputs `x₁, x₂, …`, weights `w₁, w₂, …` and a bias `b` outputs:
>
> ```math
> output = 0   if  w·x + b ≤ 0
> output = 1   if  w·x + b > 0          where  w·x = w₁x₁ + w₂x₂ + …
> ```
>
> The first version of the rule used a threshold: fire if `w·x > threshold`. Subtract the threshold from both sides and you get `w·x + b > 0` with `b = −threshold`. The bias says how easy it is to fire: a large positive `b` fires on almost any evidence.
>
> A single perceptron can already be a logic gate. Take two inputs, weights `−2` and `−2`, and bias `3`:
>
> | x₁ | x₂ | w·x + b | output |
> |---|---|---|---|
> | 0 | 0 | 3 | 1 |
> | 0 | 1 | 1 | 1 |
> | 1 | 0 | 1 | 1 |
> | 1 | 1 | −1 | 0 |
>
> That is NAND. NAND is universal, so a network of perceptrons can compute anything a computer can.

## One neuron is not enough, so stack them

One perceptron draws a single straight line, so there are things it can never learn, like XOR ("one or the other, but not both"). Put neurons in columns and feed each column's answers to the next, and the limit goes away. The first column just hands over the data (**input layer**), the last column gives the answer (**output layer**), and everything in between is the **hidden layer**. Information only moves forward, so this is a *feedforward* network. Networks that loop back (RNNs) come later in the course.

```widget
mlpdiagram
```

Every line in that picture is one weight, so even a small network has dozens, and "learning" means adjusting all of them.

> [!more] Math: why one perceptron cannot do XOR
> Suppose one perceptron computed XOR, with weights `w₁, w₂` and bias `b`. Each row of XOR forces one inequality:
>
> ```math
> (0,0) → 0 :   b ≤ 0
> (1,0) → 1 :   w₁ + b > 0   so   w₁ > −b ≥ 0
> (0,1) → 1 :   w₂ + b > 0   so   w₂ > −b ≥ 0
> (1,1) → 0 :   w₁ + w₂ + b ≤ 0
> ```
>
> But from the middle two rows, `w₁ + w₂ + b > −b − b + b = −b ≥ 0`, which contradicts the last row. No weights work. With a second layer there is no contradiction, because the hidden neurons can compute OR and NAND and the output neuron can AND them, and `OR AND NAND` is exactly XOR.

## The catch: a hard step cannot be trained

Training is "nudge a weight a tiny bit, and check whether the answer got better". A hard step breaks that. Nudge one weight by 0.1 and the output can flip from 0 to 1, and that flip can change how the whole network treats every other example. You fix your "9" and quietly break the "4"s. And away from the jump, nudging does nothing at all, so there is no hint which way to go. Try it: with the default settings, the weight sits right next to the jump.

```widget
stepsigmoid
```

> [!aha] Learning needs "small nudge in, small change out". The step breaks that rule. The sigmoid, a smoothed-out step, keeps it. That is why, technically, the network is a multilayer *sigmoid* network (MLS), not a multilayer perceptron, even though everyone still calls it an MLP.

> [!more] Math: small change in, small change out
> For any neuron whose output is a smooth function of its weights, a small change gives, to first order:
>
> ```math
> Δoutput ≈ Σⱼ (∂output/∂wⱼ) Δwⱼ  +  (∂output/∂b) Δb
> ```
>
> The change in the output is a *linear* function of the changes in the weights and bias. That linearity is what makes it easy to pick small changes that push the output the way you want. For a step function the slope `∂output/∂w` is 0 everywhere except at the jump, where it does not exist, so the formula tells you nothing.

## The sigmoid neuron

A sigmoid neuron is a perceptron with one change. It computes the same `z = w·x + b`, but instead of a hard 0 or 1 it outputs `σ(z)`, a smooth S-shaped curve that squashes any `z` into the range 0 to 1. The S means it is flat near 0 on the left, flat near 1 on the right, and steep only in the middle, like a dimmer switch. Far from zero it behaves like a step, near zero it glides. The other activation functions below are alternatives for the same job: turn `z` into the neuron's real output.

```widget
activationfunctions
```

Two name traps worth knowing, since papers use them freely: the sigmoid is also called the **logistic function**, and a network of many layers is still called a **multilayer perceptron (MLP)** even though most of its neurons are no longer true perceptrons. Strictly it is a multilayer *sigmoid* network.

> [!more] Math: the sigmoid and its slope
> ```math
> σ(z) = 1 / (1 + e^(−z))          σ′(z) = σ(z) · (1 − σ(z))
> ```
>
> Proof of the slope. Write `σ(z) = (1 + e^(−z))^(−1)` and use the chain rule:
>
> ```math
> σ′(z) = e^(−z) / (1 + e^(−z))²
>       = [1 / (1 + e^(−z))] · [e^(−z) / (1 + e^(−z))]
>       = σ(z) · (1 − σ(z))          because  1 − σ(z) = e^(−z) / (1 + e^(−z))
> ```
>
> Two facts to carry forward. The slope is biggest at `z = 0`, where `σ′ = 0.5 × 0.5 = 0.25`, and it is almost 0 when `|z|` is large. Those flat tails come back when we meet the vanishing gradient. As `z → +∞`, `σ → 1`, and as `z → −∞`, `σ → 0`, so a sigmoid really is a smoothed step.

## Layers: what a network computes

Layer by layer, each neuron takes **all** of the previous layer's outputs, weights them, adds its bias, and applies the activation. That is the whole forward pass. Add hidden layers and each one learns patterns built out of the last layer's patterns: edges, then shapes, then whole digits. "Deep learning" has no secret ingredient. It is this network with enough hidden layers to learn layered features.

```widget
dlvsml
```

> [!compare] Think of a photocopier making a copy of a copy. One hidden layer learns simple patterns. Stack more, and each one learns a pattern built out of the last layer's patterns.

A concrete size check: a 28 × 28 greyscale digit has 784 pixels, so the input layer has **784 neurons**. The output layer has **10**, one per digit, and you read the answer as the output neuron with the highest activation. A 64 × 64 image would need 4,096 inputs.

> [!more] Math: the forward pass in one line, and counting weights
> Let `aˡ` be the vector of outputs of layer `l`, `Wˡ` the matrix of weights into layer `l` (row `j` holds the weights of neuron `j`), and `bˡ` the bias vector:
>
> ```math
> zˡ = Wˡ · aˡ⁻¹ + bˡ          aˡ = σ(zˡ)          a⁰ = the input x
> ```
>
> Count the parameters of a 784 – 30 – 10 network, the one Nielsen uses on MNIST:
>
> ```
> hidden layer:  784 × 30 weights + 30 biases  = 23,550
> output layer:   30 × 10 weights + 10 biases  =    310
> total                                         = 23,860
> ```
>
> Nearly 24,000 numbers to tune, all by the same recipe. That recipe is the next chapter.

## Try it

1. In the perceptron widget, set all three weights to 0. What does `z` become, no matter the bias? What does that say about a neuron with zero weights?
2. In the step-versus-sigmoid widget, drag the weight until the step output stops flipping when nudged. Does the sigmoid still move? Why is that useful?
3. In the activation widget, compare Sigmoid and ReLU for the Dubai score (8). Which keeps almost all of that score, and which squashes it?
4. Pick weights and a bias for a perceptron that acts as AND (fires only when both inputs are 1). Check all four input rows.
5. You want a network to read 32 × 32 greyscale images of the 26 letters A to Z. How many input neurons and output neurons does it need?
6. A sigmoid's slope is at most 0.25. If every weight is 1, how much of a change survives passing through three sigmoid neurons in a row?

## Quick recap

| Tool | Real-life picture | What it does |
|---|---|---|
| Weight, bias | Votes and a head start | Turn inputs into one weighted sum `z` |
| Perceptron | A voting booth with a hard yes/no | Outputs 1 if `z > 0`, otherwise 0 |
| Sigmoid neuron | The same booth with a dimmer switch | Outputs a smooth `σ(z)` between 0 and 1, so small nudges give small changes |
| Hidden layer | A photocopy of a photocopy | Learns patterns built out of the previous layer's patterns |
| Multilayer perceptron | A factory assembly line | Layers of neurons, each feeding the next, forward only |
| Forward pass | Passing a note down the line | `a = σ(W · a_previous + b)`, layer by layer |
