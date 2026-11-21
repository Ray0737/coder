---
title: RNN, LSTM and GRU
summary: Recurrent networks, long short-term memory and gated recurrent units: a network with a memory, and why plain memory fades.
---

> [!aha] An MLP looks at one input and forgets it immediately. A sentence, a sound, a stock price: these only make sense in order. An RNN carries a running summary, the **hidden state**, forward from one step to the next, so step 10 can still be shaped by what happened at step 1.

## Why sequences need memory

> [!compare] Think of it like reading a sentence word by word with your finger covering everything after the current word. You still understand it, because you remember the words you already read. A model that looks at each word in total isolation cannot do that.

At every timestep, an RNN takes the current input **and** its own previous hidden state, and produces a new hidden state. The same small set of weights is reused at every step, that is what "recurrent" means.

Why are loops allowed here when the MLP chapter banned them? Because of time. A neuron whose output fed its own input at the *same* instant would have no answer. In an RNN, an output only affects the input at a *later* step, never instantly, so a loop is perfectly fine.

**When to reach for one:** whenever each step brings new information that depends on what just happened: live sensor readings, audio waveforms, stock prices, the words of a sentence. Feeding the previous hidden state forward is the short-term memory that links one timestamp to the next.

## Watching memory fade: the vanishing gradient problem

```widget
rnnunroll
```

Run it in "Plain RNN" mode and step through all six inputs. The hidden state keeps getting squashed by the same formula every step, so whatever the first input contributed shrinks a little more each time. After enough steps, it is effectively gone, even though the network technically "saw" it. That is the **vanishing gradient problem**: during training, the signal that should correct early weights shrinks the same way, so a plain RNN struggles to learn long-range patterns.

Switch to "LSTM gates" and run it again. The hidden state now survives much longer, because a **gate** decides, at every step, whether to keep the old memory or make room for something new. Try "GRU gates" too: it survives the fade almost as well, but by *blending* the old state with a fresh candidate every step instead of fully overwriting it, the LSTM's keep-or-replace switch.

Drag the two sliders and press Play to watch the gradient fade as it travels back through 20 steps. A plain RNN multiplies by the same number every step, so anything below 1 shrinks exponentially. The LSTM's cell state is multiplied by a forget gate that can stay close to 1.

```widget
gradcompare
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

1. In "Plain RNN" mode, note the hidden state value after the first step, then after the last step. How much smaller is it?
2. Switch to "LSTM gates" with the same inputs. Compare the final hidden state to the plain RNN's. Which one still carries a usable signal?
3. The gate sequence used here opens on steps 1, 2, 4 and 6 and closes on 3 and 5. Looking at the numbers, what seems to happen to the hidden state on a step where the gate is closed?
4. Compare GRU to LSTM on the same six inputs. Both resist the fade, but GRU blends instead of switching: does that make its hidden state move more smoothly or more jaggedly step to step?
5. In the seq2seq widget, step past the context cell. Why would the decoder be stuck if the encoder only passed along the *last* raw input instead of a compressed context built from all three?
6. Why would a seq2seq model need the *whole* input read before it starts producing any output, unlike a model that predicts one next value at a time?

## Quick recap

| Tool | Real-life picture | What it does |
|---|---|---|
| RNN | Reading with one finger covering the rest of the sentence | Reuses the same weights every step, carrying a hidden state forward |
| Vanishing gradient | A whisper fading down a long line | Early information's influence shrinks the further it has to travel |
| LSTM / GRU | A notebook with a gate deciding what to keep | Gates control how much old memory survives each step |
| Seq2seq | Reading a whole paragraph before translating it | Encoder reads the input, decoder generates the output |
