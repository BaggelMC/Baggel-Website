---
title: Deaths
---

![Deaths](src/assets/docs/images/deaths/showcase.png)

The Deaths system records every player death on the server. For each death, the plugin stores:

- Time of death
- Death message
- Complete player inventory at the time of death

This data allows administrators to review past deaths and restore lost inventories when appropriate.

## Viewing Death Records

Administrators can view a player's recorded deaths using:

```text
/deaths list <player>
```

This command displays all recorded death entries for the specified player, including relevant information such as the death message and timestamp.

## Restoring a Death

To restore a recorded death, use:

```text
/deaths restore <player> <death_id>
```

The specified player's inventory will be replaced with the inventory that was recorded at the time of the selected death.

### Important Notes

- The plugin does not verify which items the player currently owns.
- Restoring a death may create duplicate items if the player has already recovered or replaced some of their lost items.
- Partial restores are not supported. The entire recorded inventory is restored.
- If the player's inventory does not have enough free space, any excess items will be dropped on the ground near the player.

## Administrative Guidelines

The Deaths system is intended to support item recovery in exceptional circumstances, such as:

- Server lag
- Technical issues
- Unfair bugs
- Other illegitimate causes of death

Before restoring a death, administrators are responsible for verifying that:

1. The death qualifies for restoration.
2. The correct death record has been selected.
3. The items being restored were genuinely lost and have not already been recovered.

The plugin performs no automatic validation and will restore the recorded inventory regardless of the player's current possessions. As a result, the burden of proof generally falls on the player requesting the restoration. Administrators should carefully review all available evidence before proceeding.
