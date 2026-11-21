---
title: RNN, LSTM and GRU
summary: Recurrent networks, long short-term memory and gated recurrent units: a network with a memory, and why plain memory fades.
---

> [!aha] An MLP looks at one input and forgets it immediately. A sentence, a sound, a stock price: these only make sense in order. An RNN carries a running summary, the **hidden state**, forward from one step to the next, so step 10 can still be shaped by what happened at step 1.

## Why sequences need memory

Some data only makes sense in order. A word means something because of the words before it, and a sensor reading means something because of the readings before it. A model that looks at each item on its own loses all of that.

> [!compare] Think of it like reading a sentence word by word with your finger covering everything after the current word. You still understand it, because you remember the words you already read. A model that looks at each word in total isolation cannot do that.

### What happens at each step

```tgrid
Current input | The new piece of the sequence at this timestep: the next word, the next sensor reading, the next slice of audio.
Previous hidden state | The RNN's own summary of everything it has read so far. This is its memory, handed forward from the last step.
New hidden state | The two are mixed by one small set of weights, and the result becomes the summary for the next step. Reusing the same weights at every step is what "recurrent" means.
```

### Why a loop is allowed here

> [!aha] The MLP chapter banned loops because a neuron whose output fed its own input at the *same* instant would have no answer. In an RNN, an output only affects the input at a *later* step, never instantly, so a loop is perfectly fine.

### When to reach for one

Whenever each step brings new information that depends on what just happened. Feeding the previous hidden state forward is the short-term memory that links one timestamp to the next.

```tgrid4
Sensor readings | Live temperature or motion data, where the next value depends on the last few.
Audio | A waveform is thousands of samples, and its meaning comes from their order.
Stock prices | Each price is read in the context of the days before it.
Words | What a word means depends on the words that came before it.
```

## Watching memory fade: the vanishing gradient problem

A plain RNN squashes its hidden state through the same formula at every step, so whatever the first input contributed shrinks a little more each time. After enough steps it is effectively gone, even though the network technically "saw" it. That is the **vanishing gradient problem**: during training, the signal that should correct early weights shrinks the same way, so a plain RNN struggles to learn long-range patterns.

An LSTM and a GRU both fix this with **gates** that decide, at every step, how much of the old memory to keep. Drag the three sliders and press Play to watch the signal fade as it travels back through 20 steps. Anything below 1 shrinks exponentially:

```widget
gradcompare
```

```tgrid
Plain RNN | Multiplies by the same weight at every step, so the signal shrinks, or explodes, fast. Fine for short sequences, but it forgets what happened far back.
LSTM | A separate cell state with a forget gate that can stay close to 1, so memory and gradient survive many steps. The cost is more parameters: about four times a plain RNN.
GRU | Blends the old state with a fresh candidate through one update gate. Nearly as good as an LSTM at holding long memory, with fewer parameters and faster training.
```

## LSTM and GRU: adding a memory gate

An **LSTM** (Long Short-Term Memory) adds a separate memory line plus three gates: a forget gate (how much old memory to keep), an input gate (how much new information to add), and an output gate (how much of the memory to reveal as the hidden state). A **GRU** (Gated Recurrent Unit) is a simplified version with two gates instead of three, usually about as good and a little cheaper to run.

| Tool | Real-life picture | What it does |
|---|---|---|
| Hidden state | A running summary you update as you read | Carries information from earlier steps to later ones |
| Vanishing gradient | A whisper passed down a long line of people | Old information fades the further it travels through the steps |
| Forget gate | Deciding what to cross off your notes | Controls how much of the old memory survives this step |
| Input gate | Deciding what is worth writing down | Controls how much of the new information gets added |

### One LSTM cell, step by step

Pick a word or press Play. Watch the three gates decide how much old memory to keep, how much new information to write and how much to show the rest of the network. The chart shows how each dimension of the hidden state moves over time.

```widget
lstmaction
```

## Seq2seq: when the output is also a sequence

For translation or summarising, the input and output are both sequences, and they are not even the same length. **Seq2seq** uses one RNN (the encoder) to read the whole input and compress it into a final hidden state, then a second RNN (the decoder) starts from that state and generates the output one step at a time.

```widget
seq2seqdemo
```

Step through it: three input words go in, the encoder compresses them into a single context cell, then the decoder reads only that context and emits two output words, a different length, built entirely from the one summary vector.

```cta
flask | See it for yourself | Compare a simple RNN, an LSTM and a GRU side by side.
Neural network comparison | @compare#Simple%20RNN,LSTM | RNN next to an LSTM
```

## Try it

1. Set the RNN weight w to 0.8 and press Play. How much of the signal is left after 20 steps back?
2. Keep the LSTM forget gate at 0.95. How much does the LSTM keep after 20 steps, and why does a gate close to 1 matter so much?
3. Raise w above 1. What happens to the plain RNN's line, and why is that a different problem from vanishing?
4. Move the GRU update gate z to 0 and then to 0.2. What does each setting mean for how much the GRU remembers?
5. In the seq2seq widget, step past the context cell. Why would the decoder be stuck if the encoder only passed along the *last* raw input instead of a compressed context built from all three?
6. Why would a seq2seq model need the *whole* input read before it starts producing any output, unlike a model that predicts one next value at a time?

## Quick recap

| Tool | Real-life picture | What it does |
|---|---|---|
| RNN | Reading with one finger covering the rest of the sentence | Reuses the same weights every step, carrying a hidden state forward |
| Vanishing gradient | A whisper fading down a long line | Early information's influence shrinks the further it has to travel |
| LSTM / GRU | A notebook with a gate deciding what to keep | Gates control how much old memory survives each step |
| Seq2seq | Reading a whole paragraph before translating it | Encoder reads the input, decoder generates the output |
