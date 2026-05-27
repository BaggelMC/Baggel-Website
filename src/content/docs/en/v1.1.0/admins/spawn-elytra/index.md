---
title: Spawn Elytra
navLabel: Spawn Elytra
navOrder: 12
---
![Elytra Showcase](/assets/images/spawn-elytra/showcase.png)

The **Spawn Elytra** system gives players temporary elytra flight inside a defined **elytra zone**. An area set up by the server administrators, usually around spawn or the starting island. The feature helps players **comfortably spread out across a larger area** at the beginning of a season or event, without needing to first earn their own elytra.

This system was inspired by the **Craft Attack** series and is designed to make the early-game experience more dynamic. It allows everyone to spread out from the starting area without granting long-term flight advantages.

---

# Setting Up the Elytra Zone
You can set up an Elytra Zone directly in-game using the following command:
```
/buildmc elytrazone setup <pos1/pos2> <coordinates>
```

After running this command, the Elytra Zone will be immediately available. Alternatively, you can define the coordinates manually in your configuration file:
```
spawn-elytra:
  zone:
    pos1:
      x:
      y:
      z:
    pos2:
      x:
      y:
      z:
    world:
```
> You must restart the server for any configuration changes to take effect.

---

# Configuration Options
The configuration for the `spawn-elytra` section allows you to fine-tune how the system behaves:

`enabled`: Toggle the system on or off.

`boost-strength`: Adjusts the vertical boost applied when players start flying (default: 5).

`allow-fireoworks`: Controls whether players can use rockets while flying with the spawn elytra.

`disable-on-join`: Determines if flight is disabled immediately when a player joins the server ([See](../players/spawn-elytra#stuck))

```
spawn-elytra:
  enabled: true
  boost-strength: 5
  allow-fireworks: false
  disable-on-join: true
  zone:
    pos1:
      x: 100
      y: 64
      z: 100
    pos2:
      x: 200
      y: 90
      z: 200
    world: world
    
```

# Tips & Best Practices
Keep in mind that the bounds are invisible to players. So be generous and leave lot's of spare room around the area to make sure players aren't confused. Do not worry about the area size affecting performance.

Use `/buildmc elytrazone setup` in creative mode for easier placement.