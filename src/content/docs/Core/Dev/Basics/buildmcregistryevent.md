---
title: BuildMcRegistryEvent
sidebar:
  order: 21
---

The `BuildMcRegistryEvent` is fired once during the plugin startup lifecycle.

### Why this exists

The BuildMC-Core plugin must load first to initialize and expose its API. By the time BuildMC-Core is fully enabled, its registries would normally be locked and immutable. However, other plugins may want to change behaviours before they get fully locked.

This event solves that ordering problem. Once the server signals that plugin startup is complete (`ServerLoadEvent`), BuildMC-Core fires `BuildMcRegistryEvent`, passing its API instance. In the event handler, extensions can then safely register or modify values, after which BuildMC-Core will freeze all values and proceed to run.

### How to use it

If you set your plugin up properly, it should load **before** BuildMC-Core loads. You must create an EventHandler (`org.bukkit.event.EventHandler`), that handles `net.mathias2246.buildmc.api.event.lifecycle.BuildMcRegistryEvent`. You can register this listener in your `onEnable()` method in your plugins Main class.

```java
public class MyExtensionPlugin extends JavaPlugin implements Listener {

    @Override
    public void onEnable() {
        // Register as a listener to receive BuildMcRegistryEvent
        Bukkit.getPluginManager().registerEvents(this, this);
    }

    @EventHandler
    public void onRegistry(BuildMcRegistryEvent event) {
        BuildMcAPI api = event.getApi();

        // Configure the API here...
    }
}
```

You can store a static instance of `BuildMcAPI` in your plugin, to use it whenever you need.
