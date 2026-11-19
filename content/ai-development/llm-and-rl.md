---
title: LLM and RL
summary: Large language models and reinforcement learning: predicting the next word, and learning from reward instead of labels.
---

> [!aha] Underneath everything, a large language model does one simple job on repeat: given the text so far, guess a probability for every possible next word, then pick one. Reinforcement learning answers a completely different question: no labelled "right answer" exists, so an agent instead learns from a reward signal, by trial and error.

## How an LLM reads: tokens, vectors, layers

A language model does not read letters or words. It reads **tokens**: numbered pieces of text. Type anything below.

```widget
tokenizer
```

Each token ID is then turned into a vector. Similar meanings end up as nearby vectors, and directions in that space can carry relationships.

```widget
embedding
```

Put together, here is what happens for every single token the model produces:

1. **Text in:** you send some text, like "The cat sat".
2. **Tokenize:** the text is cut into tokens and each piece becomes a number from a fixed vocabulary.
3. **Embed:** each token number becomes a vector, so similar meanings sit close together.
4. **Transformer × N:** the vectors pass through N Transformer layers (dozens in big models), each one refining what every token means in context.
5. **Output probabilities:** the last layer gives a probability for every token in the vocabulary. One is picked, added to the text, and the whole thing repeats.

Each layer refines the representation. Generating a paragraph means running this loop once per token.

## Language modeling: predicting the next token

```widget
tokenplay
```

Every candidate next word gets a score (a **logit**), and those scores get turned into probabilities. The **temperature** slider controls how sharply the model commits to its favourite: low temperature almost always picks the top word, high temperature flattens the odds so less likely words get a real chance. Press "Generate" a few times at different temperatures and watch the kind of sentence that builds up.

## Fine-tuning and RLHF

GPT becomes ChatGPT through a four-stage pipeline:

1. **Pre-training:** the model reads a huge amount of text and learns to predict the next token. Knowledgeable, but not yet helpful.
2. **SFT (supervised fine-tuning):** train on human-written examples of good answers so it follows instructions.
3. **Reward model:** humans rank several answers, and a separate model learns to predict those rankings as a score.
4. **PPO:** reinforcement learning nudges the model toward answers the reward model scores highly, while staying close to the original.


A **base model** is trained purely to predict the next token over huge amounts of text, which makes it good at continuing text, not necessarily at being a helpful assistant. **Fine-tuning** keeps training it, but on a smaller, curated set of examples of the behaviour you actually want.

**RLHF** (Reinforcement Learning from Human Feedback) goes a step further: humans rank a handful of the model's own responses from best to worst, a separate **reward model** learns to predict those rankings, and then the main model is nudged, using reinforcement learning, toward responses the reward model scores highly.

> [!compare] Think of it like a writer (the base model) who already knows grammar and a huge amount of facts, then gets an editor (fine-tuning) teaching them the house style, then ongoing feedback from readers (RLHF) nudging future drafts toward what people actually respond well to.

```widget
rlhfnudge
```

The reward model's two scores never change. What changes, one nudge at a time, is how often the main model would choose to produce something like response A instead of response B. That shifting preference, repeated across millions of examples, is RLHF.

## Reinforcement learning: learning from reward, not labels

An RL agent takes actions in an environment, gets a reward signal, and gradually learns which actions tend to lead to more reward. There is no "correct answer" supplied anywhere, just trial, error, and a score.

```widget
qlearning
```

Press Train and watch the average reward (purple line) climb. At first the agent wanders and sometimes falls into the trap; after enough episodes it settles on a short, direct route. Press Walk to watch it follow the arrows, and switch "Show" to Q-values to shade every cell by its best learned Q-value: the cells closer to the goal glow brighter, because the reward flows backwards through the grid one step at a time.

## Q-learning and policy gradient, in one line each

- **Q-learning** learns a table (or a network) of "how good is this action, from this state", called a **Q-value**, and then always picks whichever action has the highest Q-value. That is exactly what powers the grid-world widget above.
- **Policy gradient** methods skip the Q-value table and directly learn a policy: a rule that outputs a probability for each action, nudged to make the better-scoring actions more likely over time.

## Try it

1. Set the temperature all the way down, then all the way up, in the token widget. Describe the difference in how predictable the bar chart becomes.
2. In the RLHF widget, press Reset then Step once. Did the preference bars move toward A or B, and does that match which response had the higher reward?
3. In the Q-learning widget, press Walk before training, then train fully and press Walk again. What changed about the agent's behaviour, concretely? Switch to Q-values and describe what the shading looks like near the start versus near the goal.
4. Why does RLHF need a separate reward model at all? Why not just have humans score every single response the model produces while training?
5. In the grid world, the reward is -0.1 per step, +10 at the goal and -5 in the trap. Why would that encourage a *shorter* path, not just *any* path that reaches the goal?

## Quick recap

| Tool | Real-life picture | What it does |
|---|---|---|
| Language modeling | Finishing someone else's sentence | Predicts a probability for the next token, given everything so far |
| Temperature | How adventurous a guesser you are | Low = always pick the top guess, high = spread the odds out more |
| Fine-tuning | An editor teaching house style | Keeps training a base model on a smaller, curated dataset |
| RLHF | Reader feedback shaping future drafts | A reward model, trained on human rankings, nudges the model's outputs |
| Q-learning | A table of "how good is this move, from here" | Learns action values, then always takes the best one |
| Policy gradient | Directly learning a habit, not a scorecard | Learns a rule for picking actions, nudged toward higher reward |
