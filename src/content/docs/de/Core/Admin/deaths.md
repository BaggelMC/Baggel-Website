---
title: Tode
---

![Tode](src/assets/docs/images/deaths/showcase.png)

Das Deaths-System speichert jeden Tod eines Spielers auf dem Server. Für jeden Todesfall werden folgende Daten gespeichert:

- Zeitpunkt des Todes
- Todesnachricht
- Komplettes Inventar des Spielers zum Todeszeitpunkt

Diese Daten ermöglichen es Administratoren, vergangene Todesfälle nachzuvollziehen und verlorene Inventare bei Bedarf wiederherzustellen.

## Todesaufzeichnungen anzeigen

Administratoren können die gespeicherten Todesfälle eines Spielers mit folgendem Befehl einsehen:

```text
/deaths list <player>
```

Dieser Befehl zeigt alle gespeicherten Todes-Einträge des angegebenen Spielers, inklusive relevanter Informationen wie Todesnachricht und Zeitstempel.

## Einen Tod wiederherstellen

Um einen gespeicherten Todesfall wiederherzustellen, nutze:

```text
/deaths restore <player> <death_id>
```

Das Inventar des angegebenen Spielers wird dabei durch das Inventar ersetzt, das zum Zeitpunkt des ausgewählten Todes gespeichert wurde.

### Wichtige Hinweise

- Das Plugin prüft nicht, welche Items der Spieler aktuell besitzt.
- Beim Wiederherstellen können Duplikate entstehen, falls der Spieler bereits Teile seiner Items zurückerhalten oder ersetzt hat.
- Teilweise Wiederherstellungen sind nicht möglich. Es wird immer das komplette gespeicherte Inventar wiederhergestellt.
- Falls der Inventarplatz des Spielers nicht ausreicht, werden überschüssige Items in der Nähe des Spielers auf den Boden gedroppt.

## Admin-Richtlinien

Das Deaths-System ist für die Wiederherstellung von Items in Ausnahmefällen gedacht, zum Beispiel bei:

- Server-Lag
- Technischen Problemen
- Unfairen Bugs
- Anderen nicht gerechtfertigten Todesursachen

Bevor ein Tod wiederhergestellt wird, müssen Administratoren sicherstellen, dass:

1. Der Fall wirklich für eine Wiederherstellung geeignet ist.
2. Der richtige Todes-Eintrag ausgewählt wurde.
3. Die Items tatsächlich verloren gingen und nicht bereits anderweitig wiederbeschafft wurden.

Das Plugin führt keine automatische Prüfung durch und stellt das gespeicherte Inventar unabhängig vom aktuellen Besitz des Spielers wieder her. Die Beweislast liegt daher in der Regel beim Spieler, der die Wiederherstellung anfragt. Administratoren sollten alle verfügbaren Informationen sorgfältig prüfen, bevor sie eine Wiederherstellung durchführen.
