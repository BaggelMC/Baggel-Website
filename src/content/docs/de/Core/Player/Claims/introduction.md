---
title: Einleitung
sidebar:
  order: 2
---

![Claim Showcase](@assets/docs/images/claims/claim-showcase.png)

Das **Claim System** dient dazu, deine Bauten zu schützen und Griefing (absichtliches Zerstören) zu verhindern. Auf früheren BuildMC Servern war Griefing leider ein wiederkehrendes Problem. Um einen fairen Spielspaß zu gewährleisten und die Kreativität zu erhalten, hat BuildMC daher ein leistungsstarkes Claim-System eingeführt. Dieses System erlaubt es **Spielern** und **Teams**, Bereiche von Chunks zu beanspruchen (zu *claimen*), auf die andere keinen Zugriff haben oder sie verändern können.

## Einen Claim erstellen
Um einen Claim zu erstellen, musst du zuerst den Bereich definieren, der beansprucht werden soll. Dafür gibt es ein Tool! Nutze den Befehl `/claim claimtool`, um das **Claim Tool** zu erhalten.

![Claim Tool Demo](@assets/docs/images/claims/claimtool-demo-2.png)

Mit dem Claim Tool kannst du auswählen, welche Chunks der Welt du beanspruchen möchtest.

Wenn das Claim Tool in deiner Hand ist:

- Klicke links auf den **ersten Eckchunk** deiner Auswahl.
- Klicke rechts auf den **zweiten Eckchunk**.

> Standardmäßig ist die Größe der Auswahl auf 10x10 Chunks beschränkt.

Sobald beide Eckchunks ausgewählt sind, erscheint im Chat eine Meldung, die dir mitteilt, dass der Bereich bereit zum Claimen ist!

Jetzt kannst du den Befehl `/claim create` verwenden, um deinen Claim zu erstellen.

Das Ausführen des Befehls wird die **Claim creation UI** öffnen.

![Claim Create UI](@assets/docs/images/claims/claim-create-ui.png)

Hier kannst du deinen claim typ auswählen (See: [Claim Types](/de/core/player/claims/claim-types)) und deinen Claim benennen.

> Der Name deines Claims kann keine Leerzeichen oder Buchstaben enthalten, die nicht im Minecraft Chat eingegeben werden können.

Nach der Erstellung ist dein Claim direkt von den Standard-Protections geschützt.

Alternativ kannst du die Parameter auch direkt in den Befehl als Argumente eingeben:
```
/claim create <claim_type> <name>
```

---

### Dein Claim verwalten
Die Standardeinstellungen eines Claims sind vielleicht nicht genug für dich. Vielleicht brauchst du mehr oder weniger Schutz. Um deinen Claim zu verwalten, wird allgemein empfohlen, das [Claim Management UI](#claim-management-ui) zu nutzen. Aber theoretisch kannst du alles auch über Befehle steuern.

### Schutzmaßnahmen
Protections legen fest, welche Teile deines Claims gesichert sind. Wenn ein Schutz aktiv ist, bedeutet das: Spieler, die den Claim nicht besitzen und nicht auf der Whitelist stehen (Siehe: [Whitelist](/core/player/claims/whitelist)), werden daran gehindert, diese bestimmte Aktion in deinem Claim durchzuführen.

Du kannst Protections über folgenden Befehl ändern:

```
/claim protections <type> <name> <protection> <true/false>
```

---

## Claim Management UI
Das Claims-System bietet eine einfache und grafische Benutzeroberfläche, um die Einstellungen deiner Claims zu bearbeiten. Du kannst diese mit den Befehlen `/claim` oder `/claim edit` öffnen.

Sobald du das UI geöffnet hast, siehst du alle Claims, auf die du Zugriff hast.

![Claim Select UI](@assets/docs/images/claims/claim-select-ui.png)

Von hier aus kannst du den Claim auswählen, den du ändern möchtest, indem du darauf klickst.
Hier siehst du Informationen zu deinem Claim und drei Einstellungen.

> Das Klicken auf die `Back`-Button unten rechts bringt dich immer zur vorherigen Seite zurück.

![Claim Edit UI](@assets/docs/images/claims/claim-edit-ui.png)
![Claim Edit UI Info](@assets/docs/images/claims/claim-edit-ui-info.png)

### Schutzmaßnahmen
Klicke auf den Schild-Button, um zum Menü der Protections zu gelangen.

![Claim Protections UI](@assets/docs/images/claims/claim-protections.png)

Jede Protection hat ein entsprechendes Item. Beim Überfahren mit der Maus wird ihr Name und eine kleine Beschreibung angezeigt, was sie bewirkt.
Unter jedem Item gibt es ein rotes oder grünes Glas. Das zeigt an, ob die aktuelle Protection aktiv ist oder nicht. **Rot bedeutet, dass die Aktion blockiert wird** und Spieler sie nicht ausführen dürfen. **Grün bedeutet, dass die Aktion erlaubt ist** und jeder sie auf deinem Claim durchführen kann. Durch Klicken auf das Glas kannst du den aktiven Zustand für diesen Schutz umschalten. Die Änderungen werden sofort angewendet.

### Whitelist
Klicke auf den Spielerkopf-Button, um zum Menü der Whitelist zu gelangen. (Siehe: [Whitelist](/core/player/claims/whitelist))

![Claim Whitelist UI](@assets/docs/images/claims/claim-whitelist.png)

Hier siehst du alle Spieler, die aktuell auf dem Claim auf der Whitelist stehen. Unter jedem Spielerkopf befindet sich ein rotes Glas. Ein Klick darauf ermöglicht es dir, diesen Spieler von der Liste zu entfernen. In der Mitte des UIs befindet sich ein grünes Glas. Ein Klick darauf lässt dich einen neuen Spieler zur Whitelist hinzufügen.

![Claim Whitelist Add UI](@assets/docs/images/claims/whitelist-add-ui.png)

Du wirst gefragt, den Spielernamen in das Eingabefeld einzugeben.

---

## Andere Befehle
### Besitzer-Abfrage
Nutze `/claim who`, um herauszufinden, wer einen bestimmten Chunk besitzt.
