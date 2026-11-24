---
title: Rich replies: Flex Messages
summary: Send more than text: a carousel menu with buttons and a Flex card with a picture.
---

> [!aha] A LINE reply can be a plain text, a menu with buttons or a designed card. They are all just JSON that the script builds, and LINE draws it.

## The wrapper

Dialogflow does not know LINE's message types, so the script wraps each one in a **custom payload**. The helper `buildReply` does it for every reply: it marks the message for the `line` platform, sets the type to custom payload (`4`) and puts the LINE message under `payload.line`.

```javascript
function buildReply(linePayload) {
  var result = {
    "fulfillmentMessages": [{
      "platform": "line",
      "type": 4,                         // custom payload
      "payload": { "line": linePayload }
    }]
  };
  return ContentService.createTextOutput(JSON.stringify(result))
                       .setMimeType(ContentService.MimeType.JSON);
}
```

> [!more] TLDR: one helper for every reply
> Whatever the message type, it goes through `buildReply`. Change the LINE message, and nothing else.

## Text

The simplest message is a `text`. The script uses it for confirmations, errors and logs, so most replies are three lines long.

```javascript
buildReply({ "type": "text", "text": "UPDATE SUCCESS\nITEM: Arduino\nSTATUS: 83" })
```

> [!more] TLDR: text for answers
> Use text when the answer is a few words. `\n` starts a new line.

## The carousel menu

A **carousel** is a row of cards that you swipe, each with a picture, a title and up to three buttons. Each button is a `message` action: pressing it makes the **user** send that text, so a button can send a command such as `Equipment booking,ID,QTY,USER`. The user then edits the ID and the quantity before sending.

```javascript
{ "type": "template", "altText": "Inventory Management Menu",
  "template": { "type": "carousel", "columns": [
    { "thumbnailImageUrl": "https://...", "title": "Equipment", "text": "Check, Borrow, or Return gear",
      "actions": [ { "type": "message", "label": "Check Item", "text": "Check,ID" } ] }
  ] } }
```

LINE sets limits: a carousel has up to **10 cards**, each with up to **3 buttons**, and every card must have the same number of buttons. Pictures must be an `https` address.

> [!more] TLDR: buttons are shortcuts
> A button does not run code. It sends a message for you, so the same command still goes through Dialogflow and the script.

## The Flex card

A **Flex Message** is a card you design yourself. It is made of boxes, and each box lays out its contents in a row, a column or a line of text. The `Check` command answers with a card: a picture (the `hero`), the item's name in bold and its stock below.

```javascript
{ "type": "flex", "altText": "Item Status",
  "contents": { "type": "bubble",
    "hero": { "type": "image", "url": Pic, "size": "full", "aspectRatio": "20:13", "aspectMode": "cover" },
    "body": { "type": "box", "layout": "vertical", "contents": [
      { "type": "text", "text": Data, "weight": "bold", "size": "xl" }
    ] } } }
```

> [!more] TLDR: design it in a simulator
> LINE has a **Flex Message Simulator** on the Developers site, where you can build a card and copy its JSON. Then replace the fixed words with variables.

## altText

Both the carousel and the Flex card have an `altText`. It is the text that LINE shows in the chat list and in a notification, where the card cannot be drawn. A short and clear one, such as "Item Status", is enough. The message is not accepted without it.

> [!more] TLDR: always set altText
> A missing `altText` makes LINE reject the message, and the user sees nothing.
