---
title: End Event System
navLabel: End Event
navOrder: 13
---

![End Showcase](/assets/images/end-event/end-portal.png)

In den meisten BuildMC-Events wird die **End-Dimension** zu Beginn des Projekts gesperrt. Erst zu einem späteren, gemeinsam von der Community festgelegten Datum wird das End geöffnet, um zusammen den Ender Dragon zu bekämpfen.

Früher musste das manuell über die `server.properties`-Datei gesteuert werden, was einen **kompletten Serverneustart** erforderte. Ein ziemlich umständlicher Prozess. Deshalb wurde das **End Event System** eingeführt, um das zu automatisieren. Damit lässt sich der Zustand des End-Portals in Echtzeit direkt im Spiel steuern, ohne dass ein Neustart nötig ist.

Da diese Funktion mittlerweile als Gamerule in Vanilla Minecraft integriert wurde, ist für moderne Versionen kein Serverneustart mehr erforderlich. Das **End Event System** bietet aber trotzdem noch Vorteile, wie etwa eine informative Action-Bar-Nachricht und eine weltweite Ankündigung für die Spieler, sobald das End geöffnet wird. Das **End Event System** funktioniert unabhängig von dieser Gamerule.

---

Standardmäßig ist das End **gesperrt**, und die Spieler können nicht durch End-Portale gehen.

Administratoren können es aber sofort mit folgendem Befehl öffnen:

```
/buildmc endevent open
```

Die Ausführung dieses Befehls sendet eine globale Ankündigung und gewährt sofortigen Zugang zum End. Den aktuellen End-Status kann man zwar auch in der Konfigurationsdatei ändern, aber wir empfehlen dringend die Verwendung des Befehls, da dieser sofort aktualisiert wird und keinen Neustart benötigt.

---

# Konfiguration

Die Einstellungen zum End-Event findest du in der Datei `config.yml`.

Standardmäßig sind sprengstoffartige Entitäten vom Betreten von End-Portalen blockiert, um Zerstörung in der Nähe des Spawn-Bereichs zu verhindern. Dennoch ist es immer ratsam, den Spawn-Bereich mit einem [claim](./claims) zu schützen, um jede Art von Zerstörung komplett auszusperren.

```
# Die End-Event-Einstellungen
# Nutze '/buildmc endevent allow true/false', um festzulegen, ob Spieler in die End-Dimension dürfen
end-event:
  # HINWEIS: Kann durch den Befehl '/buildmc endevent' überschrieben werden
  allow-end: false # Standard: false

  # Liste der Entitäten, die vom Durchqueren von End-Portalen blockiert werden sollen.
  # Das dient dazu, den Spawn zu schützen
  blocked-entities:
    - TNT
    - TNT_MINECART
    - CREEPER
```

---

# Nachrichten anpassen

Die gesendete globale Nachricht, wenn das End geöffnet oder geschlossen wird, stammt aus unserem Sprachsystem. Das heißt, je nachdem, welche Sprache der Spieler in seinem Spiel eingestellt hat, wird eine andere Nachricht angezeigt. Um diese Nachrichten zu bearbeiten, müssen Administratoren die Sprachdateien bearbeiten.

Diese Dateien befinden sich hier: `plugins/BuildMC-Core/lang`

Innerhalb jeder Sprachdatei (z.B. `en-US.yml`) musst du diese Keys finden und bearbeiten:
```
messages:
  end-event:
    broadcast-opened: "<green>Das End wurde geöffnet! Macht euch bereit für den Kampf!"
    broadcast-closed: "<red>Das End wurde geschlossen!"
```

Aktualisiere alle relevanten Sprachdateien, damit die Konsistenz über alle Client-Sprachen gewährleistet ist. Starte nach der Bearbeitung den Server neu, damit die Änderungen wirksam werden.

> **Tipp:** Halte deine Ankündigungen kurz und klar. Das ist ein Moment, den jeder mitbekommen wird.