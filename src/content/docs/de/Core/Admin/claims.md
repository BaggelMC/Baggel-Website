---
title: Claims
---

Bevor du diese Dokumentation liest, stell sicher, dass du die [Player Claims Documentation](/core/player/claims/introduction) gelesen hast. Dort werden die grundlegenden Konzepte von Claims und wie Spieler sie verwenden können behandelt.

## Server-Claims

Anstatt dich auf Plugins wie **WorldGuard** zu verlassen, können Administratoren auch das eingebaute **Claim System** nutzen, um Serverbereiche zu schützen. Server-Claims können entweder von allen Operatoren oder von jedem mit der Berechtigung `buildmc.admin` verwaltet werden.

Die Erstellung eines Server-Claims funktioniert genauso wie die Erstellung jedes anderen Claims. Du musst einfach den Typ **server** verwenden:

`/claim create server <claim name>`

Der ausgewählte Bereich ist danach standardmäßig geschützt, sogar vor Administratoren. Um den Bereich zu ändern, nutze die [Whitelisting](/core/player/claims/whitelist) Funktion, um dir selbst Zugriff zu geben. Server-Claim-Einstellungen werden zusammen mit allen anderen Claims in der Claim UI angezeigt.

Wenn du alle Claim-Schutzmechanismen komplett außer Kraft setzen willst, kannst du dir (oder jemand anderem) die Berechtigung `buildmc.bypass-claims` erteilen.

---

## Platzhalter-Claims

Ein **Placeholder Claim** ist eine spezielle Art von Claim, die **keinen Schutz bietet**. Der Zweck ist es, zu verhindern, dass andere Spieler in diesem Bereich Claims erstellen. Das ist nützlich für Bereiche wie Shopping-Districts, wo du nicht willst, dass Spieler neue Claims anlegen, aber trotzdem frei bauen oder modifizieren sollen können.

Aus Designgründen sind Whitelisting und Schutzregeln bei Placeholder Claims deaktiviert.

---

## Konfiguration

Die Konfigurationsdatei bietet eine detaillierte Steuerung des Claim-Verhaltens. Hier sind die gängigsten Einstellungen:

### Maximale Claim-Mengen

Hier kannst du festlegen, wie viel Gesamtfläche Spieler und Teams insgesamt in Chunks beanspruchen können.

```yaml
claims:
  # The amount of chunks each player can claim
  player-max-chunk-claim-amount: 256 # Default: 256

  # The amount of chunks each team can claim
  team-max-chunk-claim-amount: 1024 # Default: 1024
```

### Claim Tool Item

Das Claim Tool Item ist der Gegenstand, der das Claim Tool darstellt. Beachte dabei, dass Spieler sich diese Gegenstände beliebig in unendlicher Menge geben können. Als Standard wurde die **Karottenrute** gewählt, weil es einer der am wenigsten nützlichen Überlebensgegenstände ist und eine unendliche Menge davon im Allgemeinen kein Problem darstellt.

```yaml
claims:
  tool:
    # The item used for the claim tool
    tool-item: "carrot_on_a_stick" # Default: "carrot_on_a_stick
```

### Auswahlgröße-Limit

Das Auswahlgrößenlimit begrenzt, wie weit eine einzelne Auswahl auf jeder Achse reichen kann. Ein Limit von 10 bedeutet zum Beispiel, dass du keinen Bereich beanspruchen kannst, der über 10 Chunks in jede Richtung reicht; das ergibt maximal eine Fläche von `10x10`.

Historisch war dies aufgrund von Performance-Bedenken auf einen kleineren Wert begrenzt. Das ist aber im Allgemeinen nicht mehr der Fall.

```yaml
claims:
  tool:
    # Limits the maximum size in chunks of the selection
    # If smaller than 0, the limit will be disabled
    limit-selection: 10 # Default: 10
```

---

## Standard-Schutzmechanismen

Jeder einzelne Schutztyp kann standardmäßig entweder aktiviert oder deaktiviert werden. Wenn er standardmäßig aktiviert ist (`default: true`), bedeutet das, dass dieser Schutz automatisch aktiv ist, sobald Spieler einen Claim erstellen – bis die Eigentümer des Claims ihn manuell deaktivieren.

Ein Schutz kann auch von den Befehlen oder der UI ausgeblendet werden, was bedeutet, dass Spieler seinen Wert nicht ändern können. Der Standardwert bleibt dennoch bestehen. **Änderungen eines Wertes nach der Erstellung des Claims und vor dem Ausblenden des Schutzes können nicht zurückgesetzt werden.**

Standardoptionen sind mächtig. Für die meisten Spieler wird das standardmäßige Claim-Verhalten das einzige sein, selbst wenn ihnen theoretisch die Möglichkeit gegeben wäre, es zu ändern. Wähle also sorgfältig!

```yaml
claims:
  protections:
    # Players cannot break blocks
    player-break:
      default: true
      is-hidden: false

    # Players cannot place blocks
    player-place:
      default: true
      is-hidden: false
```

---

## Claim Logs

Die meisten claimbezogenen Aktionen werden automatisch protokolliert. Diese Logs findest du unter: `plugins/BuildMC-Core/logs/claims`

Beispiele für Log-Einträge:

```
[2025-10-28 23:04:13] [CLAIM CREATED] Darkylt (d2d1385c-d33a-4d92-a544-020dc67ce7de) created claim 'testblue'
[2025-10-28 23:06:03] [PROTECTION CHANGE] Darkylt (d2d1385c-d33a-4d92-a544-020dc67ce7de) changed 'buildmc:bells' to 'disabled' in claim 'testblue'
```

Diese Logs sind nützlich für die Moderation, Ermittlungen und das Debugging. Du kannst auch deren Verhalten konfigurieren:

```yaml
claims:
  # Settings for claim logs
  logs:
    enabled: true
    rotation-time: "00:00"      # When to rotate logs (24h format)
    retention-days: 14          # How many days of logs to keep (-1 to disable)
    mirror-to-console: false    # Whether to print events to the console
```

Die Log-Rotation hilft, die Dateigrößen überschaubar zu halten, und die Speicherdauer stellt sicher, dass alte Einträge periodisch gelöscht werden.
