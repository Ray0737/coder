---
title: LLM and reinforcement learning: fine-tuning, RLHF and Q-learning
summary: Predicting the next word, and learning from reward instead of labels.
---

> [!aha] Underneath everything, a large language model does one simple job on repeat: given the text so far, guess a probability for every possible next word, then pick one. Reinforcement learning answers a completely different question: no labelled "right answer" exists, so an agent instead learns from a reward signal, by trial and error.

## Language modeling: predicting the next token

```widget
tokensample
```

Every candidate next word gets a score (a **logit**), and those scores get turned into probabilities. The **temperature** slider controls how sharply the model commits to its favourite: low temperature almost always picks the top word, high temperature flattens the odds so less likely words get a real chance. Press "Sample next word" a few times at different temperatures and watch the kind of sentence that builds up.

## Fine-tuning and RLHF

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
gridworld
```

Drag "Episodes trained" up and watch the greedy path from start to goal get shorter. At 0 episodes the agent has learned nothing and barely finds the goal; after enough practice, it settles on a short, direct route. Press Play to watch it actually walk that route. Switch "Q-values" on to shade every cell by its best learned Q-value: the brighter cells are the ones the agent has learned lead somewhere good, which is *why* the path straightens out, not just that it does.

## Q-learning and policy gradient, in one line each

- **Q-learning** learns a table (or a network) of "how good is this action, from this state", called a **Q-value**, and then always picks whichever action has the highest Q-value. That is exactly what powers the grid-world widget above.
- **Policy gradient** methods skip the Q-value table and directly learn a policy: a rule that outputs a probability for each action, nudged to make the better-scoring actions more likely over time.

## Try it

1. Set the temperature all the way down, then all the way up, in the token widget. Describe the difference in how predictable the bar chart becomes.
2. In the RLHF widget, press Reset then Step once. Did the preference bars move toward A or B, and does that match which response had the higher reward?
3. In the grid-world widget, compare the path length at 0 episodes trained against 40. What changed about the agent's behaviour, concretely? Turn on Q-values and describe what the shading looks like near the start versus near the goal.
4. Why does RLHF need a separate reward model at all? Why not just have humans score every single response the model produces while training?
5. In the grid world, the reward is -1 per step and +10 at the goal. Why would that encourage a *shorter* path, not just *any* path that reaches the goal?

## Quick recap

| Tool | Real-life picture | What it does |
|---|---|---|
| Language modeling | Finishing someone else's sentence | Predicts a probability for the next token, given everything so far |
| Temperature | How adventurous a guesser you are | Low = always pick the top guess, high = spread the odds out more |
| Fine-tuning | An editor teaching house style | Keeps training a base model on a smaller, curated dataset |
| RLHF | Reader feedback shaping future drafts | A reward model, trained on human rankings, nudges the model's outputs |
| Q-learning | A table of "how good is this move, from here" | Learns action values, then always takes the best one |
| Policy gradient | Directly learning a habit, not a scorecard | Learns a rule for picking actions, nudged toward higher reward |
