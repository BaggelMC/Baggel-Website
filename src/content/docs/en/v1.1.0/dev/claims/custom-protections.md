---
title: Custom Protections
navLabel: Custom Protections
navOrder: 0
---

BuildMC-Core allows you to overwrite, remove and add protections.

## Writing a custom Protection

All protections must be implementations of `net.mathias2246.buildmc.api.claims.Protection`.

---

The constructor of `Protection` expects:

`key` - A `NamespacedKey` that identifies your Protection. This is how players will reference your protection in commands. *It is best practice to use your own namespace.*

`defaultEnabled ` - A `boolean` if your protection should be enabled by default when creating a new claim.

`isHidden` - A `boolean` that specifies whether this protection should be hidden from players in the UI and commands.

---

`Protection` implements the `org.bukkit.event.Listener` interface. Most Protections are essentially event listeners, that cancel the events if the protection applies.

Each `Protection` can specify an `EventHandler`, to handle events. Each `EventHandler` must evaluate by itself if the protection applies and which actions to take.

Note that you are not forced to use a Bukkit `EventHandler`. For example some Protections use a ProtoclLib `PacketListener` to enforce it's protections.

---

To make a protection integrate well, you can Override certain methods.

`@NotNull GuiItem getDisplay(@NotNull Player uiHolder, @NotNull Gui gui)` - This method returns a GuiItem (`com.github.stefvanschie.inventoryframework.gui.GuiItem`), used for displaying your protection in the claims UI to players.

---

## Getting the Registry

Protections in BuildMC-Core are stored in a [DeferredRegistry](../api/deferred-registry). A `DeferredRegistry` must be modified during the handling of [BuildMcRegistryEvent](../basics/buildmcregistryevent), as afterwards it will become immutable.

To get the Registry you need an instance of `BuildMcAPI`. [Here is how to get it](../basics#getting-an-instance).

All BuildMC-Core registires are stored in the `RegistriesHolder`, which can be retrieved via:

```java
buildMcAPI.getRegistriesHolder();
```

To get the Protections Registry out of the `RegistriesHolder`, you can use the `net.mathias2246.buildmc.util.registry.DefaultRegistries` enum, to get the key. For example:

```java
Object registryObj = registriesHolder.get(DefaultRegistries.PROTECTIONS.toString());
```

After verifying that `registryObj != null` it can be cast to `DeferredRegistry<Protection>`.

## Modifying Protections

From here you can modify the Protections Registy using the provided methods.

For example, to remove an existing protection, you can use it's NamespacedKey:

```java
private static final NamespacedKey friendlyFireProtectionKey = Objects.requireNonNull(NamespacedKey.fromString("buildmc:player_friendly_fire"));
protectionsRegistry.removeEntry(friendlyFireProtectionKey);
```

Or to add your own:
```java
protectionsRegistry.addEntry(newProtection);
```

---

If everything goes well, BuildMC-Core will handle the newly added Protections and integrate them into the system.