---
title: End Event System
---

![End Showcase](src/assets/docs/images/end-event/end-portal.png)

In den meisten BuildMC-Events wird die **Enddimension** zu Beginn des Projekts geschlossen gehalten. Zu einem späteren Zeitpunkt wird dann ein bestimmtes Datum für die Community festgelegt, um das End zu öffnen und gemeinsam den Ender Dragon zu besiegen.

Früher wurde dies manuell über die `server.properties`-Datei gesteuert, was einen **vollständigen Serverneustart** erforderte – dieser Prozess war ziemlich lästig. Das **End Event System** wurde eingeführt, um dies zu automatisieren. Es ermöglicht eine Echtzeit-Steuerung des Endportals direkt im Spiel, ohne dass ein Neustart nötig ist.

Diese Funktion gibt es mittlerweile sogar als Gamerrule in Vanilla Minecraft. Das bedeutet, dass moderne Server nicht mehr zwingend einen Neustart benötigen. Dennoch bietet das **End Event System** immer noch einen echten Mehrwert, vor allem durch die informative Action-Bar-Nachricht und die Ankündigung an alle Spieler, wenn das End geöffnet wird. Das **End Event System** funktioniert völlig unabhängig von dieser Gamerrule.

---

Standardmäßig ist das End **blockiert**, und die Spieler können nicht in Endportale eintreten.

Administratoren können es sofort öffnen mit:

```
/buildmc endevent open
```

Die Ausführung dieses Befehls sendet eine globale Ankündigung und erlaubt sofortigen Zugang zur Enddimension. Den aktuellen Status des Ends kann man zwar auch in der Config-Datei ändern, aber wir empfehlen dringend die Verwendung des Befehls, da dieser sofort aktualisiert wird, ohne dass ein Neustart nötig ist.

---

## Konfiguration

Die Einstellungen für das End Event findest du in der `config.yml`.

Standardmäßig werden explosive Entitäten daran gehindert, durch Endportale zu gelangen, um Zerstörung in der Nähe des Spawnbereichs zu verhindern. Es wird dennoch dringend empfohlen, den Spawn-Bereich mit einem [Claim](/core/admin/claims#server-claims) zu schützen, der eine vollständige Zerstörung verhindert.

```yaml
# The End-Event settings
# Verwende '/buildmc endevent allow true/false', um festzulegen, ob Spieler in die Enddimension dürfen
end-event:
  # HINWEIS: Kann durch den Befehl '/buildmc endevent' überschrieben werden
  allow-end: false # Standardwert: false

  # Liste der Entitätstypen, die daran gehindert werden sollen, durch Endportale zu gelangen.
  # Dies dient der Verhinderung von Zerstörung des Spawns
  blocked-entities:
    - TNT
    - TNT_MINECART
    - CREEPER
```

---

## Nachrichten anpassen

Die ausgegebene Nachricht, wenn das End geöffnet oder geschlossen wird, stammt aus unserem Sprachsystem. Das bedeutet, je nachdem, welche Sprache der Spieler in seinem Spiel gewählt hat, wird eine andere Meldung angezeigt. Um diese Nachrichten zu bearbeiten, müssen Administratoren die Sprachdateien bearbeiten.

Diese Dateien findest du unter: `plugins/BuildMC-Core/lang`

In jeder Sprachdatei (z.B. `en-US.yml`) suche und ändere diese Schlüssel:

```yaml
messages:
  end-event:
    broadcast-opened: "<green>Das End wurde geöffnet! Macht euch bereit für den Kampf!"
    broadcast-closed: "<red>Das End wurde geschlossen!"
```

Aktualisiere alle relevanten Sprachdateien, um die Konsistenz über alle Client-Sprachen hinweg zu gewährleisten. Starte nach der Bearbeitung den Server neu, damit die Änderungen wirksam werden.

> **Tipp:** Halte deine Ankündigung kurz und prägnant – das ist ein Moment, den jeder sehen wird.
