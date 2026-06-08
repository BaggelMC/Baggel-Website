---
title: BuildMcFinishedLoadingEvent
sidebar:
  order: 22
---

The `BuildMcFinishedLoadingEvent` is fired once during the plugin startup lifecycle. You can use it to get an instance of the `BuildMcAPI` after the plugin has finished loading.

### Why this exists

The BuildMC-Core plugin must load first to initialize and expose its API. This event is fired once the plugin has completed loading. Note that at this stage, most of the setup is completed and has become immutable. If you wish to modify certain behaviours about the plugin, look at the `BuildMcRegistryEvent`.

### How to use it

If you set your plugin up properly, it should load **after** BuildMC-Core loads. You must create an EventHandler (`org.bukkit.event.EventHandler`), that handles `net.mathias2246.buildmc.api.event.lifecycle.BuildMcFinishedLoadingEvent`. You can register this listener in your `onEnable()` method in your plugins Main class.

```java
public class MyExtensionPlugin extends JavaPlugin implements Listener {

    @Override
    public void onEnable() {
        // Register as a listener to receive BuildMcFinishedLoadingEvent
        Bukkit.getPluginManager().registerEvents(this, this);
    }

    @EventHandler
    public void onBuildMcFinishedLoading(BuildMcFinishedLoadingEvent event) {
        BuildMcAPI api = event.getApi();
    }
}
```

You can store a static instance of `BuildMcAPI` in your plugin, to use it whenever you need.
