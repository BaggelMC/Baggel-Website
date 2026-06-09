---
title: Spawn
---

Die Spawn-Funktion ermöglicht es Spielern, mit dem Befehl `/spawn` zu ihrem Ausgangspunkt (Spawn-Standort) in der Welt zu teleportieren.

Weitere Informationen zum Spielerverhalten finden Sie auf der Seite [Spawn](/core/player/spawn-teleport).

## Konfiguration

Die Funktion kann in der Datei `config.yml` unter dem Abschnitt `spawn-teleport` konfiguriert werden.

### enabled

```yaml
spawn-teleport:
  enabled: true
```

Schaltet oder deaktiviert den `/spawn`-Befehl vollständig aus.

### wait-for

```yaml
spawn-teleport:
  wait-for: 10
```

Bestimmt, wie viele Sekunden ein Spieler unbeweglich verharren muss, bevor er teleportiert wird.

*   Werte größer als `0` setzen eine Wartezeit des Spielers voraus.
*   Ein Wert von `0` deaktiviert die Wartezeit.
*   Negative Werte deaktivieren ebenfalls die Wartezeit.

Gibt ein Spieler während der Wartezeit einen Bewegungsbefehl ab, wird der Teleport abgebrochen.

## Beispiel

```yaml
spawn-teleport:
  enabled: true
  wait-for: 10
```

In diesem Beispiel können Spieler `/spawn` nutzen müssen jedoch 10 Sekunden lang ruhig bleiben, bevor der Teleport ausgeführt wird.