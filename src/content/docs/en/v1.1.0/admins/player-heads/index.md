---
title: Player Heads
navLabel: Player Heads
navOrder: 14
---

![Player Head](/assets/images/player-heads/showcase.png)

When a player is killed by another player, the victim will drop their Player Head. The head uses the player’s skin at the time of their death, displays their username as the item name, and includes the death message as the lore.

Note that the lore is lost when the head is placed and then broken again as a block. This feature will not work if `keepInventory` is enabled.

You can disable this feature in the config file:
```
player-head:
  # When true, players will drop their head on death.
  on-death: true # Default: true
```

That’s all there is to it. A simple but fun feature that rewards PvP encounters with a collectible memento.
