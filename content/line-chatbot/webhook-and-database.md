---
title: Webhook and database
summary: Build the Google Sheet, put the Apps Script online as a webhook and read how doPost handles each command.
---

> [!aha] A **webhook** is a web address that waits for someone to send it data. Dialogflow sends every message to ours, a small Apps Script reads it, changes the Sheet, and answers with the reply to show in LINE.

## Step 1: the Sheet

Create a Google Sheet with **three tabs**. The names must match the code exactly, because the script finds each tab by its name.

| Tab | Columns | Used for |
|---|---|---|
| `Inventory` | ID, Name, Category, Description, Quantity, Image URL | the items and the rooms |
| `Equip Log` | User, Item ID, Qty, Timestamp, Action | every borrow, return and add |
| `Room Log` | User, Room ID, Timestamp, Action | every room entry and exit |

Row 1 is the heading, and the data starts on row 2. Items and rooms share the `Inventory` tab: an item's **Quantity** is a number, and a room's is the word `Occupied` or `Unoccupied`.

> [!more] TLDR: the sheet is the database
> One tab for the current state and two logs that only ever grow. The script reads the column positions, so keep the columns in this order.

## Step 2: put the script online

1. In the Sheet, open **Extensions** and then **Apps Script**.
2. Delete the sample code and paste in the script from the Work page ([main.txt](work.html#line-chatbot/main.txt)).
3. Replace `YOUR_SPREADSHEET_URL` on the first line with the address of **your** Sheet.
4. Click **Deploy**, then **New deployment**, and choose the type **Web app**.
5. Set **Execute as** to **Me** and **Who has access** to **Anyone**.
6. Click **Deploy**, and approve the permissions when Google asks.
7. Copy the **Web app URL**, and paste it into Dialogflow's **Fulfillment** page.

If you change the code later, the address keeps running the **old** version. Open **Deploy** and **Manage deployments**, edit the deployment and choose **New version**.

> [!more] TLDR: deploy again after every change
> The most common mistake is to edit the script and test again without deploying a new version. The bot then answers with yesterday's code.

## Step 3: what doPost does

`doPost(e)` is the function that Apps Script calls for every POST request. It is the whole bot in one place: it reads the text, splits it on commas, and runs the branch whose first word matches.

```javascript
function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var userMsg = data.originalDetectIntentRequest.payload.data.message.text;
  var command = userMsg.split(',');          // "Check,P001"  ->  ["Check", "P001"]

  if (command[0] == "Check") {
    // find the row whose ID is command[1], then reply with its name and stock
  }
}
```

> [!more] TLDR: text in, command out
> The first part of the message is the command and the rest are its fields. A branch that is missing a field returns an `Error` message that shows the right syntax.

## Step 4: change the Sheet

Borrowing shows the pattern of all the write commands. The script finds the row, changes one cell and adds a line to the log.

```javascript
var Left = sheet.getRange(rowIdx, 5).getValue();      // Quantity, column 5
var Current = parseInt(Left) - parseInt(command[2]);  // take away the amount borrowed
sheet.getRange(rowIdx, 5).setValue(Current);          // update the Inventory
sheet2.appendRow([command[3], command[1], command[2], timestamp, "Book"]);   // log it
```

Return does the same with a plus sign, and the room commands set the Quantity cell to `Occupied` or `Unoccupied` instead.

> [!more] TLDR: update, then log
> Every change is a `setValue` on the Inventory and an `appendRow` on a log, so the Sheet always shows both the state and its history.

## Step 5: the reply

Whatever the script returns is sent back to Dialogflow as JSON. The helper `buildReply` wraps a LINE message in the shape that Dialogflow understands, and the **Rich replies** chapter explains that shape.

> [!more] TLDR: return a reply from every branch
> If a branch ends without returning anything, Dialogflow gets an empty answer and the user sees nothing. See the checklist in the last chapter.

## Weak points to know about

The script works, but it has limits that a careful reader should know.

| Weak point | Why it matters |
|---|---|
| Commands split on commas | a name that contains a comma shifts every field after it |
| `Add` has no real check | the admin name is only text, so anyone who knows the syntax can add items |
| No check for negative stock | borrowing more than is left makes the quantity go below zero |
| The sheet address is in the code | keep it out of a public repository, because the link gives access to your data |

> [!more] TLDR: fine for a class, not for a shop
> A real system would check who is asking, check the stock before taking it and keep the sheet address in a private setting.
