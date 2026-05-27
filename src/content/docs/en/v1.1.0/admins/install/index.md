---
title: Installation
navLabel: Install
navOrder: 9
---

# Download

You can download the latest versions from these places:

- [GitHub](https://github.com/BaggelMC/BuildMC-Core-Plugin/releases)

- [Modrinth](https://modrinth.com/plugin/buildmc-core/versions)

---

Installation is simple, just like any other plugin.

`1.` Download the correct `.jar` file for your server type.

`2.` Place it inside your server's `plugins` folder.

`3.` Restart your server.

On first sartup, BuildMC-Core will automatically generate a `BuildMC-Core` folder inside your `plugins` directory. This folder contains all configuration files and data used by the plugin.

By default, BuildMC-Core blocks certain commands like `/reload`. Always perform a **full server restart** after making changes to the configuration. Using reload commands will cause unexpected behavior and plugin errors.

---

# Database Configuration

Before diving in, it's a good idea to consider how your database will be used.

BuildMC-Core uses the **H2 database** to store data. The settings for the database are stored in the `database.yml` config file.

You will find the option `useServerMode` in it. By default, it's set to `false`, which means the plugin runs H2 in **embedded mode**. In this mode, only one process can access the database.

If multiple processes need access, for example when using certain plugin extensions or when running on Folia, you should enable **TCP mode** by setting `useServerMode: true`. This will use more runtime ressources.

For most BuildMC servers, the default mode is perfectly fine and requires no changes.
