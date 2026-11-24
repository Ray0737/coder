---
title: Rule-based NLP
summary: How a bot understands a message with rules: intents, training phrases, parameters and a fallback.
---

> [!aha] NLP means getting a computer to read human text. A rule-based bot does not understand like a person: it matches the message to a pattern you prepared, and does whatever you attached to that pattern.

## Intents: what the user wants

An **intent** is one thing a user can want, such as "check the stock" or "say hello". Each intent has a list of **training phrases**, example sentences that mean it. When a message arrives, the NLP engine finds the intent whose examples look most like the message. It is not an exact match, so "how many Arduinos are left?" can match an intent trained on "check stock".

> [!more] TLDR: examples, not exact words
> Give an intent several differently worded examples and the engine learns to match new sentences of the same kind. More examples means better matching.

## Parameters: the details inside a message

A sentence often carries details. In "check P001", the code `P001` is the detail, called a **parameter**, and its type is called an **entity**. Dialogflow can pull parameters out for you, such as a number, a date or a name from a list you made.

```text
User says:       "borrow 2 arduino"
Intent:          borrow_equipment
Parameters:      item = arduino      quantity = 2
```

> [!more] TLDR: intent plus parameters
> The intent says what to do and the parameters say with what. Together they are what the program needs to act.

## Our bot takes a shortcut

Our bot does not use free sentences. The user sends a **command**, a short text with the fields split by commas, such as `Check,P001`. The webhook splits the text on the commas and reads the first part as the command. So the rules live in the **Apps Script**, and Dialogflow's job is only to hand the raw text over.

```text
Check,P001
Equipment booking,B001,2,Ann
Room book,R1901,Ann
```

> [!more] TLDR: commands over sentences
> A command is easy to parse and never misunderstood, but the user has to know the syntax. That is why the bot also shows a carousel menu with the commands ready to send.

## The fallback: what nothing matches

When a message matches no intent, Dialogflow uses the **Default Fallback Intent**. A normal bot uses it for "Sorry, I did not get that". Here it is useful in another way: if you turn on the webhook for the fallback intent, every command that matches nothing else is sent to the script.

> [!more] TLDR: the fallback is the catch-all
> The next chapter shows how to turn the webhook on. Make sure no other intent catches a command first, or the script never sees it.

## Rules and AI

A rule-based bot is like a vending machine: press the right button and you get the right thing, and anything else gets "invalid". An AI bot is more like a shop assistant who understands a vague request. Rules are the better choice when the job is exact, such as changing the stock of an item, because a wrong guess would change real data.

> [!more] TLDR: choose rules for exact jobs
> Use rules when the action must be correct every time. Use AI when the user may say the same thing in many different ways.
