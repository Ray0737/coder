---
title: AI, ML and DL
summary: Artificial intelligence, machine learning and deep learning: three nested ideas, then the shape every neural network shares.
---

> [!aha] AI, ML and DL are not three separate fields sitting side by side. They are nested, like dolls: every deep learning system is machine learning, and every machine learning system is AI. The circles get smaller and more specific as you go in.

```cta
books | Got the guts for the real thing? | These chapters keep the maths light on purpose. If you do not mind the heavy maths, go deeper with these two free books.
Neural Networks and Deep Learning | http://neuralnetworksanddeeplearning.com/ | Michael Nielsen
Deep Learning | https://www.deeplearningbook.org/ | Ian Goodfellow, Yoshua Bengio and Aaron Courville
```

## Artificial intelligence: the biggest circle

**AI** is any program that does something that looks intelligent: answering a question, picking a move, recognising a face. By that definition, a thermostat that decides when to turn on the heat and a giant language model both count, just at wildly different levels of sophistication. The name goes back to 1956, when researcher John McCarthy used it for a summer workshop at Dartmouth College. For decades after that, most AI was written by hand: experts spelled out rules ("if this, then that"), or a program searched through possible moves, the way a chess engine does. Such systems can be very strong, but only at the one job someone programmed them for. Everything in use today is **narrow AI**: excellent at one kind of task (translating, spotting spam, playing Go) and useless outside it. The science-fiction kind, one system that can do anything a person can, is called **general AI**, and it does not exist yet. So "AI" names the *goal* of acting intelligently, not any one method of getting there. Machine learning, the next circle, is just one of those methods.

> [!compare] Think of it like calling someone "skilled". A cashier following the price list, a chess champion and a doctor who has seen thousands of cases are all skilled, but in very different ways. The word tells you almost nothing about how the skill works, and "AI" is the same.

## Machine learning: programs that learn from data

**ML** is the part of AI where the rules are not hand-written. Instead, the program looks at examples and works out the rules itself.

| | Hand-coded AI | Machine learning |
|---|---|---|
| How it decides | A person writes every `if/else` | The program finds patterns in examples |
| What changes it | Someone edits the code | Feeding it more or different data |
| Example | "If temperature < 18, turn on heater" | "Here are 10,000 past temperatures and settings, learn the pattern" |

Two words you will meet in every ML chapter after this one: a **feature** is one measurable thing about an example (age, price, a pixel), and a **label** is the answer you want the model to learn (spam or not spam, the price of the house).

| Kind | What it gets | What it does | Example |
|---|---|---|---|
| Supervised | Examples **with** labels | Learns to predict the label for new examples | Predict a house price, spot spam |
| Unsupervised | Examples **without** labels | Finds structure on its own | Group customers who behave alike |

## Deep learning: machine learning with many-layered networks

**DL** is machine learning done with a particular kind of model: a neural network with enough layers stacked on top of each other that it can learn layered, abstract patterns, rather than one flat rule. Classic ML usually needs a person to choose the features (the columns to look at). Deep learning learns the features itself, which is why it needs far more data.

```widget
aimldl
```

## So what is a neural network?

Every neural network is built from the same shape: an **input layer** that hands over the raw data, one or more **hidden layers** that transform it, and an **output layer** that gives the final answer. Data only ever flows forward, from input toward output.

```widget
forwardpass
```

Each circle in that diagram is loosely inspired by a biological neuron: it takes several inputs, combines them, and only "fires" once that combination crosses some threshold. Real brains are vastly more complex, so the name is a loose inspiration, not a literal copy.

> [!compare] Think of it like an assembly line. The input layer hands over raw material. Each hidden layer does one stage of processing and passes the result on. The output layer is the finished product at the end of the line.

## Where this course goes from here

| Part | What you will learn | Why it comes here |
|---|---|---|
| Data | Cleaning data and splitting it into train and test | Every model is only as good as the data it learns from |
| Machine learning | Regression, classification, clustering, PCA and how to check a model | The simple models teach the ideas that deep learning builds on |
| Deep learning | MLP, CNN, RNN, Transformer, generative models, LLM and RL | Neural networks, from one neuron up to modern AI |

## Try it

1. Is a spam filter that uses a fixed list of banned words AI? Is it ML? Explain why.
2. Name one example of AI that is *not* machine learning.
3. Click through all three rings above. Which circle would a spreadsheet macro that sums a column belong to?
4. In the network diagram, how many numbers come out of the hidden layer and go into the output layer?
5. Why does information only flowing "forward" make a neural network different from a loop in a recipe that repeats a step?

## Quick recap

| Tool | Real-life picture | What it does |
|---|---|---|
| AI | Calling someone "skilled" | Anything that acts intelligently, however it is built |
| ML | Learning a recipe by tasting it, not reading it | Learns its own rules from examples, instead of being hand-coded |
| DL | Learning in layers: edges, then shapes, then whole objects | Machine learning with many-layered neural networks |
| Input layer | Raw material entering a factory | Hands over the data, unchanged |
| Hidden layer | One stage of an assembly line | Transforms the previous layer's output into something new |
| Output layer | The finished product | The network's final answer |
