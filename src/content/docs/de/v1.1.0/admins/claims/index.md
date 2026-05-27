---
title: Claims
navLabel: Claims
navOrder: 10
---

Bevor du diese Doku liest, lies einmal die [Player Claims Documentation](../players/claims). Da geht's um die Basics von Claims und wie Spieler die nutzen können.

# Server Claims

Anstatt dich auf Plugins wie **WorldGuard** verlassen zu müssen, können Administratoren mit dem integrierten **Claim System** auch Serverbereiche schützen. Server-Claims können entweder von allen Operatoren oder von jedem, der die Berechtigung `buildmc.admin` hat, verwaltet werden.

Ein Server-Claim zu erstellen ist genauso einfach wie das Erstellen eines beliebigen anderen Claims. Du nutzt einfach den Typ **server**:

`/claim create server <claim name>`

Der ausgewählte Bereich ist ab sofort standardmäßig geschützt, sogar vor Administratoren. Um den Bereich zu ändern, nutze die [whitelisting](../players/claims/whitelist) Funktion, um dir selbst Zugriff zu geben. Server-Claim-Einstellungen werden zusammen mit allen anderen Claims in der Claim-Oberfläche angezeigt.

Wenn du alle Claim-Schutzmechanismen komplett umgehen willst, kannst du dir (oder jemand anderem) die Berechtigung `buildmc.bypass-claims` geben.

---

# Placeholder Claims

Ein **Placeholder Claim** ist eine spezielle Claim-Art, die **keinen Schutz bietet**. Der Zweck davon ist es, zu verhindern, dass andere Spieler in diesem Gebiet Claims erstellen. Das ist nützlich für Gebiete wie Shopping-Districts, wo du nicht willst, dass Spieler neue Claims erstellen, aber trotzdem frei bauen oder verändern können sollen.

Placeholder Claims sind so konzipiert, dass Whitelisting und Schutzregeln komplett deaktiviert sind.

---

# Konfiguration

Die Konfigurationsdatei bietet dir eine detaillierte Kontrolle darüber, wie die Claims funktionieren sollen. Hier sind die gängigsten Einstellungen:

## Maximal mögliche Claims

Hier kannst du festlegen, wie viel Gesamtfläche Spieler und Teams insgesamt in Chunks claimen dürfen.

```
claims:
  # Die Anzahl der Chunks, die jeder Spieler claimen kann
  player-max-chunk-claim-amount: 256 # Standard: 256

  # Die Anzahl der Chunks, die jedes Team claimen kann
  team-max-chunk-claim-amount: 1024 # Standard: 1024
```

## Claim Tool Item

Das Claim Tool Item ist das Item, das als Claim Tool dient. Pass auf: Spieler können sich hier beliebig viele Exemplare geben. Als Standard wurde die **Karottenrute** gewählt, weil das eines der wenigsten nützlichen Überlebens-Items ist, und ein unendlich großer Vorrat an so etwas ist meistens kein Problem.

```
claims:
  tool:
    # Das Item, das für das Claim Tool verwendet wird
    tool-item: "carrot_on_a_stick" # Standard: "carrot_on_a_stick
```

## Begrenzung der Auswahlgröße

Der Limit der Auswahlgröße bestimmt, wie weit eine einzelne Auswahl auf jeder Achse reichen kann. Ein Limit von 10 bedeutet zum Beispiel, dass du kein Gebiet claimen kannst, das über 10 Chunks in jede Richtung hinausreicht. Das macht die maximale Claim-Fläche zu `10x10`.

Historisch wurde dies wegen Performance-Problemen auf einen kleineren Wert begrenzt. Aber das ist heute meistens nicht mehr der Fall.

```
claims:
  tool:
    # Begrenzt die maximale Größe in Chunks der Auswahl
    # Bei einem Wert kleiner 0 ist das Limit deaktiviert
    limit-selection: 10 # Standard: 10
```

---

# Standard-Schutzmechanismen

Jede einzelne Schutzart kann standardmäßig entweder aktiviert oder deaktiviert werden. Wenn sie standardmäßig aktiviert ist (`default: true`), heißt das, dass dieser Schutz automatisch aktiv ist, sobald Spieler einen Claim erstellen. Bis die Claim-Besitzer ihn manuell wieder ausschalten.

Einen Schutz kannst du auch verstecken, damit er in den Befehlen oder der UI nicht sichtbar ist. Das bedeutet, dass Spieler ihn nicht ändern können. Der Standardwert gilt trotzdem. **Beachte: Alle Wertänderungen, die nach der Claim-Erstellung erfolgen und bevor der Schutz versteckt wurde, können nicht mehr zurückgesetzt werden.**

Die Standardoptionen sind mächtig. Für die meisten Spieler wird das Standard-Claim-Verhalten die einzige Option sein, selbst wenn sie die Möglichkeit haben, es zu ändern. Also: Pass gut auf, was du auswählst.

```
claims:
  protections:
    # Spieler können keine Blöcke brechen
    player-break:
      default: true
      is-hidden: false

    # Spieler können keine Blöcke platzieren
    player-place:
      default: true
      is-hidden: false
```

---

# Claim-Protokolle (Logs)

Die meisten Claim-Aktionen werden automatisch protokolliert. Du findest diese Logs hier: `plugins/BuildMC-Core/logs/claims`

Beispiel-Einträge im Log:

```
[2025-10-28 23:04:13] [CLAIM CREATED] Darkylt (d2d1385c-d33a-4d92-a544-020dc67ce7de) created claim 'testblue'
[2025-10-28 23:06:03] [PROTECTION CHANGE] Darkylt (d2d1385c-d33a-4d92-a544-020dc67ce7de) changed 'buildmc:bells' to 'disabled' in claim 'testblue'
```

Diese Logs sind für Moderation und Ermittlungen, und Debugging hilfreich. Du kannst auch ihr Verhalten konfigurieren:

```
claims:
  # Einstellungen für Claim Logs
  logs:
    enabled: true
    rotation-time: "00:00"      # Wann die Logs rotiert werden (24h Format)
    retention-days: 14          # Wie viele Tage Logs aufbewahrt werden sollen (-1 um zu deaktivieren)
    mirror-to-console: false    # Ob Ereignisse auch in der Konsole ausgegeben werden sollen
```

Log-Rotation hilft, die Dateigrößen überschaubar zu halten, und die Speicherdauer stellt sicher, dass alte Einträge regelmäßig gelöscht werden.
