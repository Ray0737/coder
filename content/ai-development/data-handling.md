---
title: Data handling
summary: Turning data into numbers, cleaning it, and splitting it into train, validation and test sets.
---

> [!aha] Never grade a student on the exact questions they studied from. Never test a model on the exact examples it trained on either. That one habit is the difference between a model that works and one that only looks like it works.

## What kind of data goes in?

A model only understands **numbers**, so whatever you start with, the first job is to turn it into a list of numbers. A photo, a song and a sentence all end up the same way, and what changes is which model is good at reading them.

| Data | What it looks like | How it becomes numbers | Usual model |
|---|---|---|---|
| Table (CSV) | Rows and columns: age, price, city | Numbers are used as they are. A category like city becomes 0/1 columns, one per city (**one-hot**) | Linear regression, MLP |
| Image | A grid of pixels | Every pixel is a number, 0 to 255 (or scaled to 0 to 1). A 28 × 28 greyscale picture is 784 numbers. Colour has 3 grids: red, green, blue | CNN |
| Sound | Air pressure wobbling over time | Measured thousands of times a second, giving a long list of numbers. Often turned into a **spectrogram**, a picture of which pitches are loud when | CNN, RNN, Transformer |
| Words (text) | A sentence | Cut into **tokens**, each token gets an ID number, then a vector that carries its meaning | RNN, Transformer, LLM |
| Time series | One reading per tick: sensor, stock price | Already a list of numbers, kept in order | RNN, LSTM |

> [!more] More: how a model is trained, start to finish
> Whatever the data was, training follows the same path:
>
> 1. **Turn it into numbers** (pixels, samples, token IDs, columns).
> 2. **Clean and scale** it, so no feature dominates by size alone.
> 3. **Split** it into train, validation and test sets.
> 4. **Loop:** feed in a batch, get a guess, measure the loss, nudge the weights, repeat for many epochs.
> 5. **Test once** on the held-back test set.

## Features, labels and classes

Every training example is a row with two parts. The **features** are the inputs, the measurable things about one example, and the **label** is the answer you want the model to learn. When the label is one of a fixed set of choices, each choice is a **class**, and when the label is a number there are no classes (that is regression). Without labels you are in unsupervised territory, where the model gets features only and finds structure by itself.

```widget
featurelabel
```

## Cleaning: garbage in, garbage out

Real data is messy before it is useful, so **cleaning** means fixing or removing the problems before training even starts: missing values, duplicate rows, typos, and wildly different scales (age in years next to income in the thousands).

| Problem | Typical fix |
|---|---|
| Missing values | Fill with the average/most common value, or drop the row |
| Duplicate rows | Remove them, or they get counted twice |
| Wrong scale (e.g. age 0–100, income 0–200,000) | Scale every feature to a similar range, so one does not dominate by size alone |
| Typos / inconsistent labels ("NY", "N.Y.", "New York") | Standardise to one spelling |

## The train / validation / test split

Once the data is clean, it gets split into three pieces **before** any training happens. The **training set** is what the model learns its weights from. The **validation set** is not trained on: it is used while building the model, to tune settings and catch overfitting early. The **test set** is touched exactly once, at the very end, to report how well the finished model does on data it never influenced. Drag the sliders to change the split.

```widget
traintestsplit
```

> [!warn] If the model ever sees the test set during training, even by accident, or you keep re-checking the test score and tweaking settings based on it, the test score stops meaning anything. The validation set exists to soak up all the "try this, check the score, adjust" loop, so the test set stays untouched until the last step.

## Try it

1. Why is scaling age (0–100) and income (0–200,000) together a problem for some models, even though both are just numbers?
2. What would go wrong if you cleaned and split the data in the wrong order: split first, then fill in missing values using the *whole* dataset's average?
3. Push validation down to 5% and train up to 80%. What does the model lose by having a tiny validation set, even though it now trains on more data?
4. Why does tuning settings against the *test* set, instead of the validation set, quietly ruin the one number you have left to trust?
5. A 64 × 64 colour photo is fed to a model. How many numbers is that? Which kind of model reads it best?
6. In the widget, which columns are features, which is the label, and what are the three classes? What changes when the label is a price?

## Quick recap

| Tool | Real-life picture | What it does |
|---|---|---|
| Feature | One measurable thing about an example | An input column the model reads |
| Label | The answer key | What the model should predict |
| Class | One choice on a multiple-choice question | A possible value of a yes/no or many-way label |
| Cleaning | Proofreading before you submit | Fixes missing, duplicate or inconsistent data before training |
| Scaling | Converting units to one system | Puts every feature on a similar range |
| Train set | The practice questions | What the model actually learns from |
| Validation set | A practice exam while studying | Tunes settings and catches overfitting, without touching the real exam |
| Test set | The real exam, taken once | Held back completely, the one honest number at the end |
