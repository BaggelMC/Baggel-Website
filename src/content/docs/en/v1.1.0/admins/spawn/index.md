---
title: Spawn Teleport
navLabel: Spawn Teleport
navOrder: 16
---

The Spawn feature allows players to teleport to the world's spawn location using the `/spawn` command.

For information about player-facing behavior, see the **Spawn** page.

## Configuration

The feature can be configured in `config.yml` under the `spawn-teleport` section.

### enabled

```yaml
spawn-teleport:
  enabled: true
```

Enables or disables the `/spawn` command entirely.

### wait-for

```yaml
spawn-teleport:
  wait-for: 10
```

Determines how many seconds a player must remain stationary before being teleported.

* Values greater than `0` require the player to wait.
* A value of `0` disables the waiting period.
* Negative values also disable the waiting period.

If a player provides movement input during the waiting period, the teleport is cancelled.

## Example

```yaml
spawn-teleport:
  enabled: true
  wait-for: 10
```

In this example, players can use `/spawn`, but must remain still for 10 seconds before the teleport is performed.
