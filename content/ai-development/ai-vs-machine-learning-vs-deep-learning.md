---
title: AI vs machine learning vs deep learning
summary: Three nested ideas, not three different things.
---

> [!aha] AI, ML and DL are not three separate fields sitting side by side. They are nested, like dolls: every deep learning system is machine learning, and every machine learning system is AI. The circles get smaller and more specific as you go in.

## Artificial intelligence: the biggest circle

**AI** is any program that does something that looks intelligent: answering a question, picking a move, recognising a face. By that definition, a thermostat that decides when to turn on the heat and a giant language model both count, just at wildly different levels of sophistication.

> [!compare] Think of it like "vehicle". A skateboard is a vehicle. So is a rocket. The word tells you almost nothing about how it works.

## Machine learning: programs that learn from data

**ML** is the part of AI where the rules are not hand-written. Instead, the program looks at examples and works out the rules itself.

| | Hand-coded AI | Machine learning |
|---|---|---|
| How it decides | A person writes every `if/else` | The program finds patterns in examples |
| What changes it | Someone edits the code | Feeding it more or different data |
| Example | "If temperature < 18, turn on heater" | "Here are 10,000 past temperatures and settings, learn the pattern" |

## Deep learning: machine learning with many-layered networks

**DL** is machine learning done with a particular kind of model: a neural network with enough layers stacked on top of each other that it can learn layered, abstract patterns, rather than one flat rule.

```widget
aimldl
```

## Try it

1. Is a spam filter that uses a fixed list of banned words AI? Is it ML? Explain why.
2. Name one example of AI that is *not* machine learning.
3. Click through all three rings above. Which circle would a spreadsheet macro that sums a column belong to?

## Quick recap

| Tool | Real-life picture | What it does |
|---|---|---|
| AI | "Vehicle" | Anything that acts intelligently, however it is built |
| ML | Learning a recipe by tasting it, not reading it | Learns its own rules from examples, instead of being hand-coded |
| DL | Learning in layers: edges, then shapes, then whole objects | Machine learning with many-layered neural networks |
