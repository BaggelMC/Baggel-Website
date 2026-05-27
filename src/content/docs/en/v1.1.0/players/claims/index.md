---
title: Claims
navLabel: Claims
navOrder: 3
---

![Claim Showcase](/assets/images/claims/claim-showcase.png)

# Introduction

The **Claim System** exists to protect your builds and prevent griefing. In previous BuildMC servers, griefing was a recurring issue. To ensure fair play and preserve creativity, BuildMC introduced a powerful claim system that allows **players** and **teams** to claim areas of chunks that others cannot access or modify.

# Creating a Claim

To create a claim, you first need to define the area to be claimed. We got a tool for that! Use the `/claim claimtool` command to obtain the **Claim Tool**.

![Claim Tool Demo](/assets/images/claims/claimtool-demo-2.png)

You can use the Claim Tool to select which chunks of the world you want to claim.

With the claim tool in hand:

- Left-click to mark the **first corner chunk** of your selection.
- Right-click to mark the **second corner chunk**.

> By default, the selection size is limited to 10x10 chunks.

Once you have both corner chunks selected, a message will appear in chat, telling you that the area is ready to be claimed!

Now you can use the `/claim create <type> <name>` command to create your claim.
Make sure to replace `<type>` with the type of claim you want to create (See: [Claim Types](./claims/claim-types)) and `<name>` with the name of your claim.

After creation, your claim is immediately protected by the default protections.

---

# Managing your Claim
The default settings of the claim might not be enough for you. You may want more or fewer protections. To manage your claim it is generally recommended to use the [Claim Management UI](#claim-management-ui). But everything can be managed via commands.

## Protections
Protections define what parts of your claim are secured. If a protection is active, that means players who do not own the claim and are not whitelisted (See: [Whitelist](./claims/whitelist)) will be blocked from performing that specific action in your claim.

You can modify protections via command:
```/claim protections <type> <name> <protection> <true/false>```

---

# Claim Management UI

The claim system includes and easy to use graphical interface for editing the settings of your claims. You can open with the `/claim` or the `/claim edit` commands.

Once you open the UI, you will be presented with all the claims you have access to.

![Claim Select UI](/assets/images/claims/claim-select-ui.png)

From there you can select the claim you want to modify by clicking on the item.
Here you are presented with information about your claim and three settings.

> Clicking the `Back` button in the bottom right always takes you back to the previous page.

![Claim Edit UI](/assets/images/claims/claim-edit-ui.png)
![Claim Edit UI Info](/assets/images/claims/claim-edit-ui-info.png)

## Protections

Clicking on the shield takes you to the Protections Menu.

![Claim Protections UI](/assets/images/claims/claim-protections.png)

Each protection has an item representing it. Hovering over it reveals it's name and a small description of what it does.
Below each item is red or green glass. That represents if the current protection is active or not. **Red means the action will be blocked** and players are not allowed to perform it. **Green means the action is allowed** and anyone can perform it on your claim. Clicking on the glass allows you to toggle the active state for that protection. Changes are applied immediately.

## Whitelist

Clicking on the player head takes you to the Whitelist Menu. (See: [Whitelist](./claims/whitelist))

![Claim Whitelist UI](/assets/images/claims/claim-whitelist.png)

Here you can see all players that are currently whitelisted on the claim. Below each player head is a red glass pane. Clicking on it will allow you to remove that player from the whitelist. In the middle of the UI is a green glass pane. Clicking on it allows you to add a new player to the whitelist. It will open a sign. You will have to enter the player name of the player you wish to add to the whitelist into the **first line** of the sign.

![Claim Whitelist Sign UI](/assets/images/claims/claim-whitelist-sign.png)

The Player will then be whitelisted.

_Notice: Opening the Sign UI will spawn a temporary Sign below you. This sign only exists for you and no other player. The sign will disappear after closing it. This may cause server-client synchronization issues in some edge cases. If this happens, simply logging in again should resolve the issue._

---

# Other Commands

## Owner Lookup
Use `/claim who` to check who owns a certain chunk.