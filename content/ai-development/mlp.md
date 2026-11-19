---
title: MLP
summary: Multilayer perceptron: one artificial neuron, stacked into layers, taught by trial and error.
---

> [!aha] A multi-layer perceptron is many tiny "guess, check, adjust" machines stacked in layers. Each one only ever does three things: multiply, add, decide.

## The perceptron: one neuron

A perceptron is a tiny voting booth. Every input casts a vote, some votes count more than others (the **weight**), there is a fixed head start before anyone votes (the **bias**), and the booth adds it all up.

```
z = w₁x₁ + w₂x₂ + w₃x₃ + bias
```

`z` is called the **weighted sum**. The neuron does not decide anything yet, it only adds. Drag the weights and the bias below and watch `z` change.

```widget
perceptron
```

## Multi-layer perceptron: input, hidden, output

"Multi-layer" just means several of these voting booths, arranged in columns. Data flows one way, left to right.

| Layer | What it does |
|---|---|
| Input layer | Hands over the raw features. No maths happens here, it is just the data. |
| Hidden layer | Every neuron here takes **all** of the previous layer's outputs, weights them, sums them, and decides. A network can have many hidden layers. |
| Output layer | The last layer's decision is the network's answer. |

```widget
mlpdiagram
```

Every line in that picture is one weight. A small network like this already has dozens of them, which is why training is just "adjust every line a little, many times."

## Deep learning is part of ML

> [!compare] Think of it like a photocopier making a copy of a copy. One hidden layer learns simple patterns. Stack more hidden layers, and each one learns a pattern built out of the last layer's patterns: edges, then shapes, then whole digits.

"Deep learning" has no secret ingredient. It is a multi-layer perceptron (or a cousin of one) with enough hidden layers that it starts learning layered, abstract features instead of one flat pattern.

```widget
dlvsml
```

## Activation functions: how a neuron decides

The weighted sum `z` can be any number at all. The **activation function** is the rule that turns `z` into the neuron's actual output. Same three raw scores, five different decisions:

```widget
activationfunctions
```

- **Step** only ever says 0 or 1: a hard yes/no, mostly seen in the original 1950s perceptron.
- **Sigmoid** squashes anything into 0–1, read as "how sure am I".
- **Softmax** is Sigmoid's cousin for picking **one of several** classes: it looks at every score together and turns them into probabilities that add up to 1.
- **tanh** is Sigmoid shifted to −1…1, so it can push a signal down as well as up.
- **ReLU** is the lazy one: negative becomes 0, positive passes straight through. It is cheap to compute and the default choice in most hidden layers today.

## Training: backpropagation, in one line

> [!aha] Backpropagation is grading a group project from the end backwards: the final answer was wrong, so you ask "which step contributed most to that?", walk back through the layers, and nudge every weight that played a part.

1. Run the input forward through every layer to get an answer (a **forward pass**).
2. Compare the answer to the real one with a **loss function**: a single number for "how wrong".
3. Walk backward layer by layer, working out how much each weight is to blame (the **gradient**).
4. Nudge every weight a little in the direction that lowers the loss.
5. Repeat, for every example, for many **epochs**.

That nudge is controlled by the **learning rate**: too big and training overshoots and never settles, too small and it crawls.

## The rest of the toolbox

A few more pieces you will see on every real network, in one table:

| Tool | Real-life picture | What it does |
|---|---|---|
| Dropout | Randomly benching a few players each practice | Turns off a random slice of neurons each step, so the network can't lean on just a few of them |
| Batch normalization | Re-centring a scale between weighings | Rescales the numbers flowing between layers so training stays stable as it goes deeper |
| Optimizer (SGD, Adam) | The strategy for taking the nudge | Decides *how* to use the gradient: a plain step (SGD), or a smarter step that remembers recent nudges (Adam) |
| Weight initialization | Not starting every runner on the same square | The random starting values for every weight, before any training happens. Starting badly can stall learning before it begins |

## MNIST training replay: watch it learn

MNIST is a set of 70,000 small handwritten digits, 0–9, the "hello world" of deep learning. Below is a simulated training run of a small MLP on MNIST: scrub the epoch slider and watch the loss drop, the guesses improve, and the first hidden layer's weights settle into shapes.

```widget
mnisttrainingreplay
```

Three ways to look at the same run:

- **Bird's Eye**: the loss curve. Train loss (solid) always falls. Validation loss (dashed) falls too, then creeps back up late: the network is starting to memorise instead of generalise. That is **overfitting**, from the earlier chapter, happening live.
- **Neuron Level**: ten sample digits with the model's current guess and confidence, plus a peek at 16 of the first hidden layer's neurons. Early on their weights look like static. By the later epochs, patterns appear: some neurons specialise in a stroke, a loop, a corner.
- **Math Level**: the same formulas from this chapter (`z`, the activation, the loss, the gradient step), with this epoch's real numbers dropped in.

## Try it

1. In the perceptron widget, set all three weights to 0. What does `z` become, no matter the bias? What does that tell you about a neuron with zero weights?
2. In the activation widget, compare Sigmoid and ReLU for the Dubai score (8). Which one keeps almost all of that score, and which one squashes it down?
3. Scrub the MNIST replay to epoch 1, then epoch 100. Describe in one sentence what changed on each of the three views.
4. Scrub past epoch 55 on Bird's Eye. Why does the validation line rise even while the train line keeps falling?

## Quick recap

| Tool | Real-life picture | What it does |
|---|---|---|
| Weight, bias | Votes and a head start | Turn inputs into one weighted sum `z` |
| Activation function | The rule the voting booth follows | Turns `z` into the neuron's real output |
| Hidden layer | A photocopy of a photocopy | Learns patterns built out of the previous layer's patterns |
| Backpropagation | Grading a group project backwards | Works out which weights to blame and nudges them |
| Epoch | One full lap of the training data | A single pass where every weight gets nudged once per example |
| Learning rate | Stride length | How big each nudge is |
| Dropout, batch norm, optimizer, weight init | Benching players, re-centring a scale, a nudge strategy, a fair starting line | The extra tricks that make training stable and fast |
