---
title: Dialogflow intents
summary: Step-by-step: make a Dialogflow agent, write an intent, turn on the webhook and test it.
---

> [!aha] Dialogflow is the switchboard of the bot. It receives the message, decides which intent it is, and either answers by itself or calls your webhook to answer. You set all of this in a web console, with no code.

## Before you start

The course uses **Dialogflow ES** (Essentials), the simpler version, at `dialogflow.cloud.google.com`. You need a Google account. Dialogflow ES is separate from Dialogflow CX, which has a different console, so check that you are on ES.

| You need | For |
|---|---|
| A Google account | signing in to Dialogflow and the Cloud project |
| The Apps Script Web App URL | the webhook (made in the Webhook chapter) |
| The LINE channel details | the LINE integration (made in the LINE chapter) |

> [!more] TLDR: ES, not CX
> Open the console and look for the agent name at the top left, with a gear icon. If you see "flows" and "pages", it is CX, which is not what this course uses.

## Step 1: create the agent

An **agent** is one whole chatbot in Dialogflow, with its own intents and settings.

1. Go to the Dialogflow ES console and sign in.
2. Click **Create agent** in the left menu.
3. Give it a name, such as `inventory-bot`. Choose the language (English) and the time zone.
4. Choose **Create a new Google project**, or an existing one if you have one.
5. Click **Create**.

> [!more] TLDR: one agent per bot
> The agent holds everything. Its settings are behind the gear icon next to its name, and that is also where the Google project is shown.

## Step 2: write an intent

An intent is one thing the user can say. To see how it works, make a small one first.

1. Click **Intents** in the left menu, then **Create intent**.
2. Name it, for example `greet`.
3. Under **Training phrases**, click **Add training phrases** and type a few examples, such as `hello`, `hi` and `good morning`.
4. Under **Responses**, click **Add responses** and type a reply, such as `Hello! Send Start to open the menu.`
5. Click **Save**. Dialogflow trains the agent for a few seconds.

> [!more] TLDR: phrases in, response out
> The training phrases are what the user might say and the response is what the bot says back. Five to ten phrases per intent is a good start.

## Step 3: send the command to the webhook

Our commands, such as `Check,P001`, are handled by the script, so Dialogflow must pass them on. The easiest way is to use the **Default Fallback Intent**, which catches every message that matches no other intent.

1. In **Intents**, click **Default Fallback Intent**.
2. Scroll down to **Fulfillment**.
3. Switch on **Enable webhook call for this intent**.
4. Click **Save**.

If a command is caught by another intent first, such as the **Default Welcome Intent** for `Start`, open that intent and switch on the same webhook toggle.

```text
User sends:       Check,P001
Matches:          nothing   ->   Default Fallback Intent
Fulfillment:      webhook call is ON   ->   sent to Apps Script
```

> [!more] TLDR: one toggle per intent
> Every intent that should reach the script needs **Enable webhook call for this intent**. If the bot answers with a Dialogflow reply and not yours, this toggle is off.

## Step 4: connect the webhook

1. Click **Fulfillment** in the left menu.
2. Switch **Webhook** to **Enabled**.
3. Paste the **Web App URL** from Apps Script into **URL**. It must start with `https://`.
4. Click **Save** at the bottom.

Dialogflow now sends a **POST request** with JSON to that address every time an intent with the webhook toggle is matched. The script must answer within **5 seconds**, or Dialogflow gives up.

```json
{
  "queryResult": { "queryText": "Check,P001", "intent": { "displayName": "Default Fallback Intent" } },
  "originalDetectIntentRequest": { "payload": { "data": { "message": { "text": "Check,P001" } } } }
}
```

> [!more] TLDR: what the script receives
> The script reads the raw text from `originalDetectIntentRequest.payload.data.message.text`, which is what the LINE user typed. It does not use the intent name at all.

## Step 5: test it

In the right-hand panel, **Try it now**, type a message and press Enter. Dialogflow shows the reply, the matched intent and, with **Diagnostic info** below the reply, the full request and the response from your webhook. Note that **Try it now** does not come from LINE, so `originalDetectIntentRequest.payload.data` is empty there, and a script that reads it will fail in this panel. Test the real thing from the LINE app, once LINE is connected.

> [!more] TLDR: where to look when it breaks
> **Diagnostic info** shows the webhook's answer or its error. In Apps Script, the **Executions** page shows the same call from the other side.

Next is the **LINE OA and Messaging API** chapter, which opens the LINE side and links the two.
