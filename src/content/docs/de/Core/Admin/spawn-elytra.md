---
title: Spawn Elytra
---

![Elytra Showcase](src/assets/docs/images/spawn-elytra/showcase.png)

Das **Spawn Elytra** System gibt Spielern vorübergehenden Flug innerhalb einer definierten **Elytra Zone**. Das ist ein Bereich, der normalerweise von den Serveradministratoren eingerichtet wird – meistens rund um den Spawn oder die Startinsel. Dieses Feature hilft den Spielern, zu Beginn einer Saison oder eines Events **komfortabel einen größeren Bereich auszubreiten**, ohne dass sie zuerst ihre eigenen Flügel verdienen müssen.

Dieses System wurde von der **Craft Attack** Serie inspiriert und ist darauf ausgelegt, das frühe Spielerlebnis dynamischer zu gestalten. Es ermöglicht allen, sich vom Startgebiet zu verteilen, ohne dabei dauerhafte Vorteile beim Fliegen zu erhalten.

---

## Die Elytra Zone einrichten

Du kannst eine Elytra Zone direkt im Spiel mit folgendem Befehl einrichten:

```
/buildmc elytrazone setup <pos1/pos2> <coordinates>
```

Nach Ausführen dieses Befehls ist die Elytra Zone sofort verfügbar. Alternativ kannst du die Koordinaten auch manuell in deiner Konfigurationsdatei definieren:

```yaml
spawn-elytra:
  zone:
    pos1:
      x:
      y:
      z:
    pos2:
      x:
      y:
      z:
    world:
```

> Du musst den Server neu starten, damit alle Konfigurationsänderungen wirksam werden.

---

## Konfigurationsoptionen

Die Konfiguration für den `spawn-elytra` Abschnitt lässt dir zu, die Funktionsweise des Systems feinzustimmen:

`enabled`: Schaltet das System ein oder aus.

`boost-strength`: Passt den vertikalen Boost an, der angewendet wird, wenn Spieler mit dem Fliegen starten (Standard: 5).

`allow-fireworks`: Bestimmt, ob die Spieler Raketen benutzen können, während sie mit den Spawn Elytras fliegen.

`disable-on-join`: Bestimmt, ob das Fliegen sofort deaktiviert ist, wenn ein Spieler dem Server beitritt ([Siehe](/core/player/spawn-elytra/#stuck))

```yaml
spawn-elytra:
  enabled: true
  boost-strength: 5
  allow-fireworks: false
  disable-on-join: true
  zone:
    pos1:
      x: 100
      y: 64
      z: 100
    pos2:
      x: 200
      y: 90
      z: 200
    world: world
```

## Empfehlungen

Beachte, dass die Grenzen für Spieler unsichtbar sind. Sei also großzügig und lasse viel Platz um den Bereich herum, damit sich die Spieler nicht verwirrt fühlen. Mach dir keine Sorgen, ob die Größe des Bereichs die Performance beeinflusst.

Verwende `/buildmc elytrazone setup` im Kreativmodus für eine einfachere Platzierung.