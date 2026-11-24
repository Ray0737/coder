---
title: End to end: check stock
summary: Follow one command through every stop, and a checklist for when the bot does not answer.
---

> [!aha] When a bot breaks, the fault is at one of the stops. Learn the road once, and you can find which stop by asking what each one received.

## One command, five stops

Follow `Check,P001`, the command that shows an item's stock.

| Stop | What happens |
|---|---|
| 1. LINE | the user types `Check,P001` and sends it |
| 2. Dialogflow | no intent matches, so the **Default Fallback Intent** runs, and its webhook toggle sends it on |
| 3. Apps Script | `doPost` splits the text into `Check` and `P001`, and looks for P001 in column 1 of `Inventory` |
| 4. Google Sheets | the row is found, so the name (column 2), the stock (column 5) and the picture (column 6) are read |
| 5. Back to LINE | `Result2` builds a Flex card, Dialogflow passes it on and LINE draws it |

> [!more] TLDR: five stops, one reply
> Each stop only does one thing, and each hands its result to the next. The reply returns along the same road.

## Try it

1. Add one row to `Inventory`: an ID `P001`, a name, a quantity and a picture address.
2. Send `Start` from LINE. The carousel arrives.
3. Send `Check,P001`. The card arrives with the picture, the name and the stock.
4. Send `Equipment booking,P001,2,Ann`. The stock drops by 2 and a line appears in `Equip Log`.
5. Send `Equipment log,Ann`. The log lines for Ann are listed.

> [!more] TLDR: test in this order
> Menu, then read, then write, then read the log. If a step fails, the stops above tell you where to look.

## When there is no reply

Look at the stops from the outside in.

| What you see | Probable cause | What to do |
|---|---|---|
| nothing, and no error | **Use webhook** is off in LINE, or auto-response is still on | check the Messaging API tab and Response settings |
| LINE's **Verify** fails | the Dialogflow LINE webhook URL is wrong, or the integration is not started | copy the URL again from Dialogflow's LINE integration |
| the reply is a Dialogflow sentence, not yours | the intent's webhook toggle is off | open the intent and turn on **Enable webhook call** |
| "webhook call failed" in Diagnostic info | the script crashed, or took more than 5 seconds | open **Executions** in Apps Script and read the error |
| the old behaviour after you changed the code | the Web App was not deployed again | **Manage deployments**, then **New version** |
| an `Error` message with a syntax line | a field is missing from the command | send it again with every field |

> [!more] TLDR: the three logs
> LINE's **Verify** button tests the first stop, Dialogflow's **Diagnostic info** tests the second, and Apps Script's **Executions** page tests the third.

## An item that does not exist

If the ID is not in the Sheet, the `Check` branch finds no match and reaches the end of `doPost` without returning anything. Dialogflow then receives an empty answer and the user gets no reply, with no error message. A safer script ends each branch with a reply such as "Item not found", the way the `Add` and log branches already do.

```javascript
// at the end of a branch, after the loop that did not find the ID
return Result3("Item " + command[1] + " was not found.");
```

> [!more] TLDR: always return something
> Every path through `doPost` should end with a reply, even for a bad ID. A silent bot looks broken.

## Going further

The same road suits many bots: a lab key log, a class sign-in or a shop's stock. Change the Sheet and the commands, and keep the parts. The files on the Work page show how the script grew from a prototype to the final version, one step at a time.

> [!more] TLDR: what you built
> A chat front end, a switchboard, a webhook and a database, joined by plain web requests. That pattern is the same in most real bots.
