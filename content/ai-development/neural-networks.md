---
title: Neural networks
summary: The big picture, before the next chapter opens up one neuron at a time.
---

> [!aha] A neural network is just layers of tiny decision-makers, each one feeding its answer to the next layer. This chapter is the 30,000-foot view; the next one, MLP, opens up exactly what's happening inside each neuron.

## A network is layers, data flows one way

Every neural network is built from the same shape: an **input layer** that hands over the raw data, one or more **hidden layers** that transform it, and an **output layer** that gives the final answer. Data only ever flows forward, from input toward output.

```widget
forwardpass
```

## Why "neural"

Each circle in that diagram is loosely inspired by a biological neuron: it takes several inputs, combines them, and only "fires" (produces a meaningful output) once that combination crosses some threshold. Real brains are vastly more complex than this, the name is a loose inspiration, not a literal copy.

> [!compare] Think of it like an assembly line. The input layer hands over raw material. Each hidden layer does one stage of processing and passes the result on. The output layer is the finished product at the end of the line.

## What's next

This chapter deliberately stayed at the big picture: layers, and data flowing forward through them. The next chapter, **MLP**, zooms into a single neuron, shows exactly how weights, bias and an activation function turn numbers into a decision, and how a whole network of them gets *trained* through backpropagation.

## Try it

1. In the diagram above, how many numbers come out of the hidden layer and go into the output layer?
2. Why does information only flowing "forward" (left to right) make this different from, say, a loop in a recipe that repeats a step?
3. Before reading the next chapter, guess: what do you think decides how much one input matters to a neuron?

## Quick recap

| Tool | Real-life picture | What it does |
|---|---|---|
| Input layer | Raw material entering a factory | Hands over the data, unchanged |
| Hidden layer | One stage of an assembly line | Transforms the previous layer's output into something new |
| Output layer | The finished product | The network's final answer |
| Forward pass | Material moving down the line | Data flowing from input to output, one direction only |
