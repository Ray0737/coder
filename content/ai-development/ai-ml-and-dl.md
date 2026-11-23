---
title: AI, ML and DL
summary: Three nested ideas, AI, machine learning and deep learning, and the one shape every neural network shares.
---

> [!aha] AI, ML and DL are not three separate fields side by side. They are nested like dolls: every deep learning system is machine learning, and every machine learning system is AI.

## Artificial intelligence: the biggest circle

**AI** is any program that does something that looks intelligent: answering a question, picking a move, recognising a face. A thermostat and a giant language model both count, at very different levels. So "AI" names the *goal* of acting intelligently, not one method, and machine learning, the next circle, is just one of the methods.

> [!compare] Think of it like calling someone "skilled". A cashier following the price list, a chess champion and a doctor who has seen thousands of cases are all skilled, but in very different ways. The word tells you almost nothing about how the skill works, and "AI" is the same.

> [!more] More: a little history, and narrow vs general AI
> The name dates from 1956, when John McCarthy used it for a summer workshop at Dartmouth College. Early AI was rules written by hand, or a search through possible moves, as in a chess engine.
>
> Everything in use today is **narrow AI**: excellent at one task and useless outside it. **General AI**, one system that can do anything a person can, does not exist yet.

## Machine learning: programs that learn from data

**ML** is the part of AI where the rules are not hand-written. A hand-coded program has a person write every `if/else`, like "if temperature < 18, turn on heater", and changing it means editing the code. A machine learning program is instead given examples, say 10,000 past temperatures and settings, and works out the pattern itself, so changing what it does means feeding it more or different data.

Two words you will meet in every chapter after this one:

> [!more] Feature
> A **feature** is one measurable thing about an example, and the features together are the inputs the model reads. In a table, each column is a feature: age, price, city. In a picture, each pixel is a feature, so a 28 × 28 greyscale image has 784 of them. In the famous iris flower dataset, the four features are sepal length, sepal width, petal length and petal width. The Data handling chapter shows this on a real table.

> [!more] Label
> A **label** is the answer you want the model to learn: spam or not spam, the species of a flower, the price of a house. When the label is one of a fixed set of choices, each choice is a **class**. When the label is a number, there are no classes, and predicting it is called regression. A model that is trained with labels learns from examples where the answer is already known.

Whether the examples come with labels splits ML into two kinds:

> [!more] Supervised learning
> The model gets examples **with** labels, like practice questions that come with an answer key. It learns the link between the features and the label, then predicts the label for new examples it has never seen, like predicting a house price or spotting spam. It comes in two flavours: **classification**, where the label is a class, and **regression**, where the label is a number. Both get their own chapter in Classic ML.

> [!more] Unsupervised learning
> The model gets examples **without** labels, so there is no answer key. It has to find structure on its own, like grouping customers who behave alike, or squeezing many features down to the few that matter. Clustering (K-means) and PCA are the two examples in the Unsupervised learning chapter.

## Deep learning: machine learning with many-layered networks

**DL** is machine learning done with a neural network that has enough layers stacked on top of each other to learn layered, abstract patterns rather than one flat rule. Classic ML usually needs a person to choose the features, while deep learning learns them itself. Click through the three rings below.

```widget
aimldl
```

> [!more] More: why deep learning needs so much data
> Classic ML usually needs a person to choose the features (the columns to look at). Deep learning learns the features itself, building them up layer by layer: edges, then shapes, then whole objects. Learning the features as well as the answer is a bigger job, which is why it needs far more data.

## So what is a neural network?

Every neural network is built from the same shape: an **input layer** that hands over the raw data, one or more **hidden layers** that transform it, and an **output layer** that gives the final answer. Data only ever flows forward, from input toward output. Each circle is loosely inspired by a biological neuron: it takes several inputs, combines them, and only "fires" once that combination crosses some threshold. Real brains are vastly more complex, so the name is a loose inspiration, not a copy.

```widget
forwardpass
```

> [!compare] Think of it like an assembly line. The input layer hands over raw material. Each hidden layer does one stage of processing and passes the result on. The output layer is the finished product at the end of the line.

## Where this course goes from here

| Part | What you will learn | Why it comes here |
|---|---|---|
| 1. Foundations | What AI, ML and DL are, how data is prepared, and the dials of training | Every model is only as good as the data and the setup it learns from |
| 2. Classic ML | Regression, classification, clustering, PCA and how to check a model | The simple models teach the ideas that deep learning builds on |
| 3. Deep learning foundations | The MLP and how a network is trained | One neuron, stacked into layers, taught by trial and error |
| 4. Deep learning models | CNN, RNN, Transformer, generative models, LLM and RL | Neural networks built for images, sequences, text and more |

```cta
books | Got the guts for the real thing? | These chapters keep the maths light on purpose. If you do not mind the heavy maths, go deeper with these two free books.
Neural Networks and Deep Learning | http://neuralnetworksanddeeplearning.com/ | Michael Nielsen
Deep Learning | https://www.deeplearningbook.org/ | Ian Goodfellow, Yoshua Bengio and Aaron Courville
```

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
