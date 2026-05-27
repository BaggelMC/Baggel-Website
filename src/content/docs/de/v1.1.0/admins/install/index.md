---
title: Installation
navLabel: Install
navOrder: 9
---

# Download

Die neuesten Versionen findest du hier:

- [GitHub](https://github.com/BaggelMC/BuildMC-Core-Plugin/releases)

- [Modrinth](https://modrinth.com/plugin/buildmc-core/versions)

---

Die Installation ist genau wie bei jedem anderen Plugin.

`1.` Lade die passende `.jar`-Datei für deinen Servertyp runter.

`2.` Leg die Datei in den `plugins`-Ordner deines Servers.

`3.` Starte deinen Server neu.

Beim ersten Start generiert BuildMC-Core automatisch einen Ordner namens `BuildMC-Core` in deinem `plugins`-Verzeichnis. Dort speichert das Plugin alle Konfigurationsdateien und Daten, die es braucht.

Standardmäßig blockiert BuildMC-Core bestimmte Befehle wie `/reload`. Mach IMMER einen **kompletten Server-Neustart** nach Änderungen an der Konfiguration. Das Verwenden von Reload-Befehlen kann unerwartetes Verhalten und Plugin-Fehler verursachen.

---

# Datenbank-Einstellungen

Bevor wir starten, ist es gut, kurz zu überlegen, wie du deine Datenbank nutzen willst.

BuildMC-Core nutzt die **H2-Datenbank**, um Daten zu speichern. Die Einstellungen für die Datenbank stehen in der Datei `database.yml`.

Dort findest du die Option `useServerMode`. Standardmäßig ist diese auf `false` eingestellt, was bedeutet, dass das Plugin H2 im **Embedded Mode** betreibt. In diesem Modus kann nur ein Prozess auf die Datenbank zugreifen.

Wenn mehrere Prozesse Zugriff brauchen, zum Beispiel wenn du bestimmte Plugin-Erweiterungen nutzt oder auf Folia läufst, solltest du **TCP Mode** aktivieren, indem du `useServerMode: true` setzt. Beachte: Das verbraucht allerdings mehr Ressourcen im Laufzeitbetrieb.

Für die meisten BuildMC-Server ist der Standardmodus völlig in Ordnung und erfordert keinerlei Änderungen.