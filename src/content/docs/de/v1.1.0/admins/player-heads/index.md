---
title: Player Heads
navLabel: Player Heads
navOrder: 14
---

![Player Head](/assets/images/player-heads/showcase.png)

Wenn ein Spieler von einem anderen Spieler getötet wird, lässt das Opfer seinen Spieler-Kopf fallen. Dieser Kopf verwendet die Skin des Spielers zum Zeitpunkt des Todes, zeigt den Benutzernamen des Spielers als Item-Name an und enthält die Todesnachricht im Lore.

Achtung: Das Lore geht verloren, wenn der Kopf als Block platziert und danach wieder zerstört wird. Und das Ganze funktioniert auch nicht, wenn `keepInventory` aktiv ist.

Du kannst diese Funktion in der Config-Datei deaktivieren:
```
player-head:
  # Wenn true, lassen Spieler bei ihrem Tod ihren Kopf fallen.
  on-death: true # Standard: true
```

Das war's dann schon. Ein einfaches, aber cooles Feature, das PvP-Treffen mit einem coolen Sammlerstück belohnt.