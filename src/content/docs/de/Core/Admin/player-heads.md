---
title: Spielerköpfe
---

![Player Head](@assets/docs/images/player-heads/showcase.png)

Wenn ein Spieler von einem anderen besiegt wird, lässt das Opfer seinen Spielerkopf fallen. Der Kopf zeigt den Skin des Spielers zum Zeitpunkt seines Todes, trägt den Benutzernamen als Name des Gegenstands und beinhaltet die Todesnachricht in der Lore.

Beachte, dass die Lore verloren geht, wenn der Kopf platziert und danach wieder als Block zerstört wird. Diese Funktion funktioniert nicht, wenn `keepInventory` aktiviert ist.

Du kannst diese Funktion in der Konfigurationsdatei deaktivieren:

```yaml
player-head:
  # Wenn auf true gesetzt, lassen Spieler bei ihrem Tod ihren Kopf fallen.
  on-death: true # Standard: true
```

Das war's! Ein simples, aber spaßiges Feature, das PvP-Gefechte mit einem sammelbaren Andenken belohnt.