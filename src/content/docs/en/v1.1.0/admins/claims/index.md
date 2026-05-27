---
title: Claims
navLabel: Claims
navOrder: 10
---

Before reading this documentation, make sure you've read the [Player Claims Documentation](../players/claims). It covers the basic concepts of claims and how players can use them.

# Server Claims

Instead of relying on plugins like **WorldGuard**, administrators can use the built-in **Claim System** to protect server areas as well. Server claims can be managed by all operators or by anyone with the `buildmc.admin` permission.

Creating a server claim works just like creating any other claim, simply using the **server** type:

`/claim create server <claim name>`

The selected area will now be protected by default, even from administrators. To modify the area, use the [whitelisting](../players/claims/whitelist) feature to grant yourself access. Server claim settings appear alongside all other claims in the claim UI.

If you want to bypass all claim protections entirely, you can grant yourself (or someone else) the `buildmc.bypass-claims` permission.

---

# Placeholder Claims

A **Placeholder Claim** is a special claim type that does **not provide any protections**. The purpose is to prevent other players from creating claims in this area. This is useful for areas like shopping districts, where you don’t want players to create new claims but still want them to be able to build or modify freely.

Whitelisting and protection rules are disabled for placeholder claims by design.

---

# Configruation

The configuration file offers detailed control over claim behavior. Below are the most common settings:

## Maximum Claim Amounts

Here you can control how much total area players and teams can claim in total in chunks.

```
claims:
  # The amount of chunks each player can claim
  player-max-chunk-claim-amount: 256 # Default: 256

  # The amount of chunks each team can claim
  team-max-chunk-claim-amount: 1024 # Default: 1024
```

## Claim Tool Item

The Claim Tool Item is the item that represents the Claim Tool. Notice that the players can freely give themselves an infinite amount of this item. The default **Carrot on a Stick** was chosen because it's one of the least useful survival items, and having an infinite amount of it, is generally not problematic.

```
claims:
  tool:
    # The item used for the claim tool
    tool-item: "carrot_on_a_stick" # Default: "carrot_on_a_stick
```

## Selection Size Limit

The selection size limit, limits how far a single selection can reach on each axis. A limit of 10 for example means you can't claim an area that reaches over 10 chunks on each side of the selection, making the maximum area of a claim `10x10`.

Historically this was limited to a smaller value because of performance concerns. But that is generally no longer the case.

```
claims:
  tool:
    # Limits the maximum size in chunks of the selection
    # If smaller than 0, the limit will be disabled
    limit-selection: 10 # Default: 10
```

---

# Default Protections

Each individual protection type can be either enabled or disabled by default. If it is enabled by default (`default: true`), that means when players create a claim this protection will be automatically active, until the claim owners manually disable it.

A protection can also be hidden from the commands or the UI, meaning players cannot change it's value. The default value will still apply. **Any value changes after claim creation and before the protection was hidden cannot be reset.**

Default options are powerful. For most players, the default claim behavior will remain the only claim behavior even if they have the power to change it. So choose carefully.

```
claims:
  protections:
    # Players cannot break blocks
    player-break:
      default: true
      is-hidden: false

    # Players cannot place blocks
    player-place:
      default: true
      is-hidden: false
```

---

# Claim Logs

Most claim-related actions are logged automatically. These logs can be found in: `plugins/BuildMC-Core/logs/claims`

Example log entries:

```
[2025-10-28 23:04:13] [CLAIM CREATED] Darkylt (d2d1385c-d33a-4d92-a544-020dc67ce7de) created claim 'testblue'
[2025-10-28 23:06:03] [PROTECTION CHANGE] Darkylt (d2d1385c-d33a-4d92-a544-020dc67ce7de) changed 'buildmc:bells' to 'disabled' in claim 'testblue'
```

These logs can be useful for moderation and investigation as well as debugging. You can also configure their behavior:

```
claims:
  # Settings for claim logs
  logs:
    enabled: true
    rotation-time: "00:00"      # When to rotate logs (24h format)
    retention-days: 14          # How many days of logs to keep (-1 to disable)
    mirror-to-console: false    # Whether to print events to the console
```

Log rotation helps keep file sizes manageable, and retention ensures old entries are periodically cleared.
