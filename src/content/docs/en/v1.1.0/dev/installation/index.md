---
title: Setup
navLabel: Setup
navOrder: 8
---

To set up an integration with BuildMC-Core in your plugin, you must use the `buildmc-api`. You can get it via maven:

```
<repositories>
    <repository>
        <id>central</id>
        <url>https://central.sonatype.com/repository/maven-snapshots/</url>
    </repository>
</repositories>

<dependency>
    <groupId>net.mathias2246</groupId>
    <artifactId>buildmc-api</artifactId>
    <version>1.1.0-SNAPSHOT</version>
    <scope>provided</scope>
</dependency>
```

This should make the `buildmc-api` available in your project. Notice that the API is unusable without the server also running BuildMC-Core.

## Plugin.yml

You must also declare the dependency on BuildMC-Core in your `paper-plugin.yml`. This is to tell the server how to load it properly.

```
dependencies:
  server:
    BuildMC-Core:
      load: BEFORE
      required: true
      join-classpath: true
```