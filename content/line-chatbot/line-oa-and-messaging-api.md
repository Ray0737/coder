---
title: LINE OA and Messaging API
summary: Step-by-step: make a LINE Official Account, switch on the Messaging API and connect it to Dialogflow.
---

> [!aha] LINE has two doors into one bot. The **Official Account** is the front: the name and the chat that people add as a friend. The **Messaging API channel** is the back: the keys and the web address that let a program send and receive messages.

## The two halves

You will use two LINE websites, and each does a different job.

| Site | What you do there |
|---|---|
| LINE Official Account Manager | create the account, set the profile, and turn off the built-in replies |
| LINE Developers Console | get the keys, set the webhook address and test it |

LINE now asks you to **create the Official Account first**, then switch on the Messaging API for it. Creating a Messaging API channel directly from the Developers Console is no longer offered, so follow the order below.

> [!more] TLDR: account first, channel second
> Make the Official Account, enable the Messaging API on it, and a channel with keys appears in the Developers Console.

## Step 1: create the Official Account

1. Sign in to LINE Official Account Manager with your LINE account, and choose to create a new account.
2. Fill in the account name, the business type and a short description.
3. Finish the sign-up. The account appears in your list, and you can open its page.

The name is what users see in the chat, so pick one the class will recognise, such as `Lab Inventory Bot`.

> [!more] TLDR: a normal LINE login
> You log in with your own LINE account. Nothing here costs money for the free plan, which is enough for class.

## Step 2: enable the Messaging API

1. In the Official Account Manager, open **Settings** for your account.
2. Open **Messaging API** and click **Enable Messaging API**.
3. Choose a **provider**, which is just a name for you or your group, or create a new one, and confirm.

A **provider** groups your channels. Pick a name for the class or the team, and do not use a personal one if the project is shared.

> [!more] TLDR: this creates the channel
> After this step the Developers Console lists a Messaging API channel, with the same name as your account.

## Step 3: copy the three values

Open the **LINE Developers Console**, choose your provider and then the channel.

| Value | Where to find it |
|---|---|
| Channel ID | **Basic settings** tab |
| Channel secret | **Basic settings** tab |
| Channel access token | **Messaging API** tab, at the bottom, click **Issue** |

Dialogflow needs these three. They are **secrets**: anyone who has the access token can send messages as your bot, so never paste them on a website, into a screenshot or into a file on GitHub.

> [!warn] Keep the channel secret and the access token private. If one leaks, press **Reissue** next to it, and update Dialogflow.

> [!more] TLDR: three values for Dialogflow
> Channel ID, channel secret and channel access token. Copy them straight into Dialogflow in the next step and nowhere else.

## Step 4: connect LINE to Dialogflow

1. In Dialogflow, click **Integrations** in the left menu.
2. Find **LINE** and click it.
3. Paste the Channel ID, the Channel secret and the Channel access token into the three boxes.
4. Click **Start**. Dialogflow shows a **Webhook URL** for LINE. Copy it.
5. Back in the Developers Console, on the **Messaging API** tab, paste that address into **Webhook URL** and click **Update**.
6. Click **Verify**. A green success message means LINE can reach Dialogflow.
7. Turn on **Use webhook**.

The Dialogflow LINE address is not the Apps Script address. LINE talks to Dialogflow, and Dialogflow talks to your script, each through its own URL.

> [!more] TLDR: two addresses, two jobs
> LINE's webhook URL is the one Dialogflow gives you. The script's address goes in Dialogflow's **Fulfillment** page.

## Step 5: turn off the automatic replies

A new Official Account answers by itself with a greeting and an auto-reply. If you leave them on, users get those messages **together with** your bot's reply.

1. In the Official Account Manager, open **Settings** and then **Response settings**.
2. Turn **Greeting message** and **Auto-response messages** off.
3. Check that **Webhooks** is turned on.

> [!more] TLDR: the usual reason for a double reply
> If the bot answers twice, or with a message you never wrote, the auto-response is still on.

## Step 6: add the bot and try it

On the **Messaging API** tab there is a **QR code**. Scan it with the LINE app to add the account as a friend, then send `Start`. The carousel menu should arrive. The QR code is the key to your bot's chat, so share it only with the people who should use it.

> [!more] TLDR: when it works
> A reply to `Start` proves the whole road: LINE, Dialogflow, the script and back. If nothing arrives, the **End to end** chapter has a checklist.
