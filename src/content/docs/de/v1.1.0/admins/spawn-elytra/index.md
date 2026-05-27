---
title: Spawn Elytra
navLabel: Spawn Elytra
navOrder: 12
---

![Elytra Showcase](/assets/images/spawn-elytra/showcase.png)

Das **Spawn Elytra** System gibt Spielern temporäre Elytra-Flüge innerhalb einer definierten **Elytra-Zone**. Das ist ein Bereich, den die Server-Administratoren einrichten, meistens rund um den Spawn oder die Startinsel. Die Funktion hilft den Spielern, **zu Beginn einer Saison oder eines Events bequem einen größeren Bereich zu erkunden**, ohne erst ihre eigenen Elytras farmen zu müssen.

Dieses System wurde von der **Craft Attack** Serie inspiriert und soll das frühe Spielgefühl dynamischer machen. Es erlaubt jedem, sich vom Startgebiet auszubreiten, ohne dabei langfristige Flug-Vorteile zu gewähren.

---

# Die Elytra-Zone einrichten

Du kannst eine Elytra-Zone direkt im Spiel mit folgendem Befehl einrichten:

```
/buildmc elytrazone setup <pos1/pos2> <coordinates>
```

Nachdem du diesen Befehl ausgeführt hast, ist die Elytra-Zone sofort nutzbar. Oder du definierst die Koordinaten auch manuell in deiner Konfigurationsdatei:

```
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

> Denk dran, dass du den Server neu starten musst, damit alle Konfigurationsänderungen wirksam werden.

---

# Konfigurationsoptionen

Die Konfiguration für den Abschnitt `spawn-elytra` lässt dir zu, genau einzustellen, wie das System funktionieren soll:

`enabled`: Schaltet das System an oder aus.

`boost-strength`: Passt den vertikalen Schub an, den die Spieler bekommen, wenn sie anfangen zu fliegen (Standardwert: 5).

`allow-fireworks`: Regelt, ob die Spieler die Raketen nutzen können, während sie mit den Spawn-Elytras fliegen.

`disable-on-join`: Bestimmt, ob der Flug sofort deaktiviert wird, wenn ein Spieler dem Server beitritt ([Siehe](../players/spawn-elytra#steckenbleiben))

```
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

# Tipps & Best Practices

Beachte, dass die Grenzen für die Spieler unsichtbar sind. Sei deshalb großzügig und lass viel Pufferraum rund um den Bereich, damit die Spieler nicht verwirrt sind. Und mach dir keine Sorgen, ob die Größe des Bereiches die Performance beeinflusst.

Nutze im Kreativmodus `/buildmc elytrazone setup` für ein einfacheres Platzieren.
