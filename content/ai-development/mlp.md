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

### Bias: how easy it is to fire

Think of the bias as how eager the neuron is to say yes. A big positive bias and it fires on almost any evidence. A very negative bias and it needs overwhelming evidence before it fires. It is the old "is the sum above some threshold?" rule with the threshold moved to the other side: `w·x > threshold` becomes `w·x + b > 0`, with `b = −threshold`.

**Fun fact:** the perceptron comes from the late 1950s, when Frank Rosenblatt built on the 1943 artificial neuron of McCulloch and Pitts. One perceptron can already act as a logic gate (AND, OR, NAND, the building blocks of every computer). But it can only draw a single straight line, so it cannot learn XOR ("one or the other, but not both"), a limit famously pointed out in 1969 by Minsky and Papert. Stacking neurons into layers is the way out.

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

### Which way does the data flow?

| Type | Loops? | Good for |
|---|---|---|
| Feedforward (this chapter) | None. Information only moves forward, never back. | Fixed-size inputs: a row of numbers, the pixels of one image |
| Recurrent (RNN) | Yes. An output is fed back in, one step later. | Ordered data: audio, sensor readings, words in a sentence |

A loop within a single instant would have no answer, because a neuron's input would depend on its own output. A recurrent network gets away with it because the feedback only arrives at the *next* time step. The RNN chapter picks this up.

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

### Why the smooth ones won

With a hard step, a tiny nudge to one weight can flip a neuron from 0 to 1, and that flip can change how the whole network treats every *other* example. You fix your "9" and quietly break the "4"s. A sigmoid is a smoothed-out step: a tiny nudge to a weight makes a tiny change to the output, so training can improve a little at a time.

> [!aha] Learning needs "small nudge in, small change out". A hard step breaks that rule. The smooth curves, and ReLU, which bends but never jumps, keep it.

Two name traps worth knowing, since papers use them freely: the sigmoid is also called the **logistic function** (so a "logistic neuron" is a sigmoid neuron), and a network of many layers is still called an MLP even though most of its neurons are no longer true perceptrons.

## Training: backpropagation, in one line

> [!aha] Backpropagation is grading a group project from the end backwards: the final answer was wrong, so you ask "which step contributed most to that?", walk back through the layers, and nudge every weight that played a part.

1. Run the input forward through every layer to get an answer (a **forward pass**).
2. Compare the answer to the real one with a **loss function**: a single number for "how wrong".
3. Walk backward layer by layer, working out how much each weight is to blame (the **gradient**).
4. Nudge every weight a little in the direction that lowers the loss.
5. Repeat, for every example, for many **epochs**.

That nudge is controlled by the **learning rate**: too big and training overshoots and never settles, too small and it crawls.

**Fun fact:** the idea of backpropagation was around in the 1970s, but nobody paid much attention until a 1986 paper by Rumelhart, Hinton and Williams showed it made multi-layer networks learn far faster than earlier methods, and let them solve problems that had been out of reach. It is still the workhorse of neural-network learning today.

### Math level: the four steps with symbols

Here `a` is a layer's output, `z` is its weighted sum, `δ` is "how much this layer is to blame", and `σ′` is the slope of the activation.

```
1. Input:        set the first layer's a to the data
2. Feedforward:  for each layer,  z = w · a(previous) + b,  then  a = σ(z)
3. Output error: δ(last)  = (how wrong the output is) × σ′(z)
4. Go backwards: δ(layer) = (next layer's weights, flipped) · δ(next layer) × σ′(z)

Result:  gradient of a weight = a(previous) × δ      gradient of a bias = δ
```

In words: the blame at the end is pushed backwards through the very same weights the answer travelled forwards through, and each weight's share of the blame is how active its input was times the blame at its output.

## Why deep networks are hard to train

More layers should help, and at first they do. In Nielsen's MNIST tests, one hidden layer of 30 neurons scored 96.48%, two layers 96.90%, but a third gave 96.57% and a fourth 96.53%. Same settings, more layers, no gain. The extra layers could in theory just do nothing, so something is wrong with *learning*, not with the idea.

The clue: the layers learn at wildly different speeds. Early layers often barely move while later layers learn fine. That is the **vanishing gradient** problem.

> [!compare] Think of a game of telephone. The blame for a wrong answer has to be whispered back through every layer. Each layer passes it on a little quieter, so by the time it reaches the first layer it is almost silent and that layer has nothing to learn from.

**Why it happens:** by the chain rule, the gradient at an early layer is a *product* of one term per later layer. Each term is roughly `w × σ′(z)` (the weight times the activation's slope). A sigmoid's slope is never above 0.25, so unless the weights are big, every extra layer multiplies the signal by something small and it shrinks fast.

> [!aha] The real culprit is not "vanishing" or "exploding" on its own, it is **unstable**. A product of many terms is only stable if they happen to balance out near 1. By chance they almost never do, so the early layers get either nothing or far too much.

Making the weights large does not fix it, because a large `w` also pushes `z` out onto the flat tails of the sigmoid, where `σ′(z)` is tiny again. That is why the fixes are the ones you already met: ReLU (no flat side), smaller starting weights, and a sensible optimizer.

A few more suspects, from papers Nielsen points to: Glorot and Bengio (2010) found that sigmoids can saturate the last hidden layer early in training, and Sutskever, Martens, Dahl and Hinton (2013) showed that good weight initialization and momentum make a big difference. Training deep networks has no single cause, and it is still an active research area.

## The rest of the toolbox

A few more pieces you will see on every real network, in one table:

| Tool | Real-life picture | What it does |
|---|---|---|
| Dropout | Randomly benching a few players each practice | Turns off a random slice of neurons each step, so the network can't lean on just a few of them |
| Batch normalization | Re-centring a scale between weighings | Rescales the numbers flowing between layers so training stays stable as it goes deeper |
| Optimizer (SGD, Adam) | The strategy for taking the nudge | Decides *how* to use the gradient: a plain step (SGD), or a smarter step that remembers recent nudges (Adam) |
| Weight initialization | Not starting every runner on the same square | The random starting values for every weight, before any training happens. Starting badly can stall learning before it begins |

**Why a bad start hurts:** the classic recipe is to draw every starting weight from a bell curve centred on 0 with a spread of 1. That works, but it is wasteful. Give a neuron 1,000 inputs and the sum `z` collects a thousand random terms, so it easily lands 20 or more away from 0, far out on the flat tails of a sigmoid where the slope is almost zero. Those neurons start out saturated and learn at a crawl. The fix is to start with *smaller* weights, shrunk in proportion to the number of inputs, so `z` begins near 0 where the curve is steep and learning can take off straight away.

### Optimizers explained

```terms
SGD (Stochastic Gradient Descent) | The simplest optimizer. It computes the gradient on a small batch of examples and takes one step downhill. Easy to understand, but it can be slow and can get stuck on flat stretches called saddle points.
Adam | The most popular optimizer. It adapts the step size for each weight individually, combining momentum (keep moving the same way) with RMSprop (scale steps by how large the recent gradients were). Usually the best default choice.
```

> [!tip] All optimizers use gradient descent at their core. They just differ in *how* they decide the step size and direction.

## MNIST training replay: watch it learn

MNIST is a set of 70,000 small handwritten digits, 0–9, the "hello world" of deep learning. Below is a simulated training run of a small MLP on MNIST: scrub the epoch slider and watch the loss drop, the guesses improve, and the first hidden layer's weights settle into shapes.

```widget
mnisttrainingreplay
```

How big is this network at the edges? Each image is 28 × 28 = 784 pixels, each a greyscale value between 0 and 1, so the input layer has **784 neurons**. The output layer has **10**, one per digit. To read the answer you do not compare against a 0.5 threshold, you simply take the output neuron with the highest activation (`argmax`). The 0.5 rule is for a single yes/no output, like "is this a 9, or not?". A 64 × 64 image would need 4,096 input neurons.

Three ways to look at the same run:

- **Bird's Eye**: the loss curve. Train loss (solid) always falls. Validation loss (dashed) falls too, then creeps back up late: the network is starting to memorise instead of generalise. That is **overfitting**, from the earlier chapter, happening live.
- **Neuron Level**: ten sample digits with the model's current guess and confidence, plus a peek at 16 of the first hidden layer's neurons. Early on their weights look like static. By the later epochs, patterns appear: some neurons specialise in a stroke, a loop, a corner.
- **Math Level**: the same formulas from this chapter (`z`, the activation, the loss, the gradient step), with this epoch's real numbers dropped in.

```cta
flask | See it for yourself | Train a small network in your browser, or put an MLP next to a CNN and compare them.
Neural network playground | @neural-playground | Pick data, layers and settings, and watch it learn
Neural network comparison | @compare#MLP,CNN | MLP next to a CNN
```

## Try it

1. In the perceptron widget, set all three weights to 0. What does `z` become, no matter the bias? What does that tell you about a neuron with zero weights?
2. In the activation widget, compare Sigmoid and ReLU for the Dubai score (8). Which one keeps almost all of that score, and which one squashes it down?
3. Scrub the MNIST replay to epoch 1, then epoch 100. Describe in one sentence what changed on each of the three views.
4. Scrub past epoch 55 on Bird's Eye. Why does the validation line rise even while the train line keeps falling?
5. You want a network to read 32 × 32 greyscale images of the 26 letters A to Z. How many input neurons and how many output neurons does it need?
6. A step neuron and a sigmoid neuron both get a tiny nudge to one weight. Which output could jump from 0 to 1, and why does that make the step neuron hard to train?
7. A sigmoid's slope is at most 0.25. Roughly how much does that shrink a signal passing back through 5 layers, if the weights are about 1? Why does ReLU avoid this?
8. Why does making one weight huge not cure a vanishing gradient?

*Further reading: Michael Nielsen's free book [Neural Networks and Deep Learning](http://neuralnetworksanddeeplearning.com/) is the source of several ideas on this page.*

## Quick recap

| Tool | Real-life picture | What it does |
|---|---|---|
| Weight, bias | Votes and a head start | Turn inputs into one weighted sum `z` |
| Activation function | The rule the voting booth follows | Turns `z` into the neuron's real output |
| Hidden layer | A photocopy of a photocopy | Learns patterns built out of the previous layer's patterns |
| Backpropagation | Grading a group project backwards | Works out which weights to blame and nudges them |
| Epoch | One full lap of the training data | A single pass where every weight gets nudged once per example |
| Learning rate | Stride length | How big each nudge is |
| Vanishing gradient | A whisper passed down a long line | Early layers get almost no learning signal in deep networks, so they barely train |
| Dropout, batch norm, optimizer, weight init | Benching players, re-centring a scale, a nudge strategy, a fair starting line | The extra tricks that make training stable and fast |
