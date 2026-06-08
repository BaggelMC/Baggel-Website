---
title: DeferredRegistry
---

`DeferredRegistry` is an implementation of Bukkit's `Registry` interface.

A `DeferredRegistry` stays mutable until `initialize()` is called, after which all mutation will silently fail.

In BuildMC-Core `DeferredRegistry` is used to store objects, that others may wish to modify, but cannot be changed after initialization. Internal `DeferredRegistry`s are typically exposed in the `BuildMcAPI` via `RegistriesHolder`. During `BuildMcRegistryEvent`, plugins can modify an exposed `DeferredRegistry`, after which it will be initialized and the plugin finishes loading.
