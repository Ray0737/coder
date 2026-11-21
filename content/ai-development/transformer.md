---
title: Transformer
summary: Self-attention, positional encoding and BERT/GPT: every word looks at every other word, all at once.
---

> [!aha] An RNN reads a sentence one word at a time, so word 10 only learns about word 1 after passing through 9 steps of memory. A Transformer lets every word look directly at every other word in one step. That one change is most of why modern language models got so much better.

## The big picture

The original Transformer has an **encoder** that understands the input and a **decoder** that writes the output. Both are stacks of the same few building blocks. Pick a block type to see where it appears.

```widget
tfarch
```

## Self-attention: every word asks "who matters to me?"

For each word, self-attention produces a weight for every other word in the sentence: how much should this word's meaning be influenced by that one? Pick a query word below, and a head, and see where its attention lands.

```widget
attentionmap
```

Notice "sat" paying attention to "cat" (its subject) and to "on" (what follows it), while "mat" leans on "on" and "the". Nothing here is hard-coded, these weights come from training: the model learned which relationships matter for understanding the sentence.

> [!compare] Think of it like a group project meeting. Before you can contribute, you quickly check in with everyone else in the room, weighing some opinions more than others, before deciding what to say. Every word in a Transformer does that, with every other word, at the same time.

### The same thing with real numbers

Step through attention for the 3-word sentence "the cat sat", with 4-number vectors, exactly as a computer does it.

```widget
qkvmath
```

## Multi-head attention: asking the question several ways

One attention pattern can only capture one kind of relationship at a time. **Multi-head attention** runs several attention patterns in parallel (each a "head"), so one head might track grammatical subject/verb pairs while another tracks nearby words, and the results are combined. Flip between "Head 1" and "Head 2" in the widget above: Head 1 links related words however far apart they sit, Head 2 mostly just looks at its immediate neighbours. A real Transformer has many more heads than two, running at once, not one after another.

Here are twelve heads side by side. Click one to see its full table.

```widget
headsgrid
```

## Positional encoding: attention has no sense of order

Self-attention looks at every word at once, so on its own it has no idea which word came first. **Positional encoding** adds a fixed, unique pattern of numbers to each position before anything else happens, so "cat sat" and "sat cat" don't look identical to the model.

```widget
posenc
```

## Encoder-decoder, BERT and GPT

| Tool | Real-life picture | What it does |
|---|---|---|
| Encoder | Reading the whole input to fully understand it | Turns the input sentence into a rich representation, attending in both directions |
| Decoder | Writing one word at a time, only looking backward | Generates the output one token at a time, only attending to tokens already produced |
| BERT | A model trained to fill in blanks | Encoder-only, reads in both directions at once, good at understanding text |
| GPT | A model trained to predict the next word | Decoder-only, reads left to right, good at generating text |

## Watching a decoder generate, one token at a time

A decoder-only model like GPT produces text the same way every time: look at the prompt plus everything written so far, pick the single most likely next token, append it, and repeat. Nothing to the right of the current position exists yet, by construction.

```widget
autogen
```

Step through it and notice that word 2 isn't chosen until word 1 already exists: every step re-reads the *entire* sentence so far before adding one more word.

```cta
flask | See it for yourself | Put a Transformer next to an LSTM and compare how they work and how they score.
Neural network comparison | @compare#LSTM,Transformer | LSTM next to a Transformer
```

## Try it

1. Click through each token as the query in the attention widget. Which word has the most spread-out attention (closest to equal weight on everything), and which has the most concentrated attention on just one other word?
2. Switch to Head 2 and repeat. Does the most-attended word change for most queries, or stay about the same?
3. Why would a model that can only look at earlier tokens (like GPT) be naturally suited to generating text one word at a time, but a model that looks in both directions (like BERT) is not?
4. If you removed positional encoding entirely, what would "the cat sat on the mat" and "the mat sat on the cat" look like to self-attention?

## Quick recap

| Tool | Real-life picture | What it does |
|---|---|---|
| Self-attention | Checking in with everyone in the room before speaking | Every token weighs how much every other token should influence it |
| Multi-head attention | Asking the same question from several angles at once | Runs several attention patterns in parallel, then combines them |
| Positional encoding | A stamped timestamp on every word | A fixed, unique wave pattern per position, so word order isn't lost |
| Encoder / decoder | Reading to understand / writing one word at a time | Encoder sees the whole input at once, decoder generates one token at a time |
| BERT / GPT | Fill-in-the-blank / predict-the-next-word | BERT is encoder-only (understanding), GPT is decoder-only (generation) |
