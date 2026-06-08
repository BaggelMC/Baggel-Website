---
title: Basics
navLabel: Basics
navOrder: 9
---

Here you will learn about the most basic concepts of using the `buildmc-api`.

# Getting an Instance
Most of the API is accessible via `net.mathias2246.buildmc.api.BuildMcAPI`.

You can get an instance by using the provided events. You have two recommended options available based on your needs:

1. [BuildMcRegistryEvent](./basics/buildmcregistryevent)

2. [BuildMcFinishedLoadingEvent](./basics/buildmcfinishedloadingevent)

Alternatively you can use `BuildMcAPI.tryLoadAPI()`. This approach is **not recommended**. This will crash your plugin if BuildMC-Core is not loaded before your extension. The method uses the Bukkit Services Manager to get an instance of the plugin.