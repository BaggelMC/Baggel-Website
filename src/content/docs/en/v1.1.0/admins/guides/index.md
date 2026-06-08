---
title: Guides
navLabel: Guides
navOrder: 17
---

The Guides feature allows server administrators to create informational pages that players can read in-game.

Guides are useful for explaining server-specific mechanics, commands, rules, or other information without requiring external documentation.

## Enabling Guides

Guides are configured in `guides.yml`.

```yaml
enabled: true
```

Set `enabled` to `true` to allow players to access guides, or `false` to disable the feature entirely.

## Creating Guides

Guides are defined under the `guides` section.

```yaml
guides:
  commands: "<lang:messages.guides.commands>"
```

Each key becomes a guide that players can access using:

```text
/guides <guide>
```

For example, the configuration above creates a guide called `commands`, which players can view using:

```text
/guides commands
```

## Guide Format

Guide content is rendered using MiniMessage.

You can use any valid MiniMessage formatting tags, including colors, decorations, click events, hover events, and translatable components.

Guides may be written directly inside `guides.yml`:

```yaml
guides:
  commands: "<gold>Welcome to the server!</gold>"
```

However, this approach only supports a single language.

## Recommended: Use Language Files

We recommend storing guide content inside the plugin's language files and referencing it through MiniMessage's `<lang:key>` tag.

This allows guides to automatically adapt to the language selected by each player in their Minecraft client.

Language files can be found in:

```text
plugins/BuildMC-Core/lang/
```

Under `messages.guides`, you can create custom guide entries:

```yaml
messages:
  guides:
    guide-not-found: "<red>This guide does not exist!</red>"

    commands: |-
      ===================== <blue>Commands</blue> =====================
      <gray>Here is a list of useful commands:</gray>

      <gray>- </gray><gold>/rules</gold> | Displays the server rules
      <gray>- </gray><gold>/spawn</gold> | Teleports you to spawn
      <gray>- </gray><gold>/claim</gold> | Manage your claims
      <gray>- </gray><gold>/status</gold> | Set or remove your status

    spawn-elytra: |-
      ==================== <blue>Spawn Elytra</blue> ====================

      When you are inside an area where the Spawn Elytra is active,
      you can fly using a <gold>double jump</gold>.

      Press <gold><key:key.swapOffhand></gold> to receive a boost.
```

These guide entries are automatically registered as translatable components by the plugin.

You can then reference them from `guides.yml`:

```yaml
guides:
  commands: "<lang:messages.guides.commands>"
  spawn-elytra: "<lang:messages.guides.spawn-elytra>"
```

When a player opens a guide, the correct translation will be displayed based on their selected Minecraft language.

We strongly recommend translating guides into all languages supported by your server.

## Designing Guides

Since guides use MiniMessage, they can become difficult to edit manually.

We recommend you to use our own [MiniMessage Editor](/tools/minimessage/) to design your guides.

You can alternatively also use the [Official MiniMessage Viewer](https://webui.advntr.dev).