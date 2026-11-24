---
title: What a chatbot is
summary: A program you talk to in a chat app, and the four parts that make the LINE inventory bot work.
---

> [!aha] A chatbot is not one big program. It is a chain of small ones: an app where people type, a part that works out what they mean, a part that does the job, and a place where the data lives.

## A program you talk to

A **chatbot** is a program whose screen is a chat. The user types a message, the program works out what it means, does something and sends a message back. Some bots are only a menu in disguise, and some use AI to understand free sentences. The one in this course is the first kind, with a few buttons and a few typed commands, and it is a good place to start because every step can be seen.

> [!more] TLDR: menu bot or AI bot
> A rule-based bot follows rules you wrote, so it is simple and predictable. An AI bot understands free text, but needs much more data and checking.

## The four parts

Every chatbot, big or small, has the same four jobs. In this course each job has its own tool.

| Job | What it does | Tool in the course |
|---|---|---|
| Channel | where the user types | LINE Official Account |
| Understanding | works out what the message means | Dialogflow |
| Logic | does the job and builds the reply | Google Apps Script |
| Memory | stores the data | Google Sheets |

```text
User (LINE)  ->  LINE Messaging API  ->  Dialogflow  ->  Apps Script (webhook)  ->  Google Sheets
     ^                                                                                  |
     +---------------------------------- the reply travels back -----------------------+
```

> [!more] TLDR: one message, four stops
> A message goes from LINE to Dialogflow, then to the Apps Script webhook, which reads or writes the Sheet and sends a reply back along the same road.

## What our bot does

The bot is an **inventory tracker**. People can check how many of an item are left, borrow it and give it back, book a room, read their history and (for admins) add a new item. Everything is written to a spreadsheet, so there is a record of who took what, and when.

| Group | Commands |
|---|---|
| Equipment | `Check`, `Equipment booking`, `Equipment return`, `Equipment log` |
| Rooms | `Room book`, `Room return`, `Room log` |
| Admin | `Add` |

> [!more] TLDR: why this bot
> It shows the whole path of a real bot without any AI: a chat, a webhook and a database. The same road works for a shop, a library or a school lab.

## Serverless: no computer to run

Nothing here runs on your own computer. LINE, Dialogflow, Apps Script and Sheets are all online services, so the bot is awake while your laptop is off. You need only a Google account, a LINE account and a browser.

> [!more] TLDR: what you need
> A Google account (Sheets, Apps Script and Dialogflow), and a LINE account for the Official Account and the Developers console. No install, no server.
