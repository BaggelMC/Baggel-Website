---
title: Claims
navLabel: Claims
navOrder: 3
---

![Claim Showcase](/assets/images/claims/claim-showcase.png)

# Einleitung

Das **Claim-System** dient dazu, deine Bauwerke zu schützen und Griefing zu verhindern. Bei früheren BuildMC Servern war Griefing oft ein Problem. Um faire Spielbedingungen zu gewährleisten und Kreativität zu bewahren, hat BuildMC ein Claim-System eingeführt. Damit können **Spieler** und **Teams** Bereiche von Chunks beanspruchen, auf die andere keinen Zugriff oder keine Bearbeitung vornehmen können.

# Einen Claim erstellen

Um einen Claim zu erstellen, musst du zuerst den Bereich definieren, den du beanspruchen möchtest. Dafür haben wir ein Tool für dich! Nutze den Befehl `/claim claimtool`, um das **Claim-Tool** zu bekommen.

![Claim Tool Demo](/assets/images/claims/claimtool-demo-2.png)

Mit dem Claim Tool wählst du einfach aus, welche Chunks der Welt du beanspruchen möchtest.

Wenn das Tool in der Hand ist:

- Klicke mit der linken Maustaste, um den **ersten Eckchunk** deiner Auswahl zu markieren.
- Klicke mit der rechten Maustaste, um den **zweiten Eckchunk** zu markieren.

> Standardmäßig ist die Größe der Auswahl auf 10x10 Chunks begrenzt.

Sobald beide Eckchunks markiert sind, erscheint im Chat eine Meldung, dass der Bereich bereit ist, beansprucht zu werden!

Jetzt kannst du den Befehl `/claim create <type> <name>` verwenden, um deinen Claim zu erstellen.
Vergiss nicht, `<type>` durch den gewünschten Claim-Typ zu ersetzen (Siehe: [Claim Typen](./claims/claim-types)) und `<name>` durch den Namen deines Claims.

Nach der Erstellung ist dein Claim sofort durch die Standard-Sicherungen geschützt.

---

# Dein Claim verwalten

Die Standardeinstellungen deines Claims reichen vielleicht nicht aus. Du brauchst vielleicht mehr oder weniger Schutz. Um deinen Claim zu verwalten, empfiehlt es sich generell, die [Claim Management UI](#claim-management-ui) zu nutzen. Aber man kann wirklich alles auch über Befehle steuern.

## Schutzmechanismen (Protections)
Schutzmechanismen definieren, welche Teile deines Claims gesichert sind. Wenn ein Schutz aktiv ist, bedeutet das, dass Spieler, die den Claim nicht besitzen und nicht auf der Whitelist stehen (Siehe: [Whitelist](./claims/whitelist)), nicht diese spezifische Aktion in deinem Claim durchführen können.

Du kannst Schutzmechanismen über Befehle anpassen:
```/claim protections <type> <name> <protection> <true/false>```

---

# Claim Management UI

Das Claim-System verfügt über eine einfach zu bedienende grafische Oberfläche, um die Einstellungen deiner Claims zu bearbeiten. Du kannst sie mit den Befehlen `/claim` oder `/claim edit` öffnen.

Sobald du die Oberfläche öffnest, siehst du alle Claims, auf die du zugreifen kannst.

![Claim Select UI](/assets/images/claims/claim-select-ui.png)

Von hier aus wählst du den Claim aus, den du ändern möchtest, indem du darauf klickst.
Hier siehst du Informationen zu deinem Claim und drei Einstellungsbereiche.

> Das Klicken auf den `Back`-Button unten rechts bringt dich immer zurück zur vorherigen Seite.

![Claim Edit UI](/assets/images/claims/claim-edit-ui.png)
![Claim Edit UI Info](/assets/images/claims/claim-edit-ui-info.png)

## Schutzmechanismen

Auf das Schild-Symbol klickst du, um zum Protections Menu zu gelangen.

![Claim Protections UI](/assets/images/claims/claim-protections.png)

Jeder Schutzmechanismus hat ein entsprechendes Item. Wenn du mit der Maus darüber fährst, siehst du seinen Namen und eine kleine Beschreibung, was er bewirkt.
Unter jedem Item siehst du ein rotes oder grünes Glas. Das zeigt an, ob der Schutz momentan aktiv ist oder nicht. **Rot bedeutet, dass die Aktion blockiert wird** und Spieler diese nicht durchführen dürfen. **Grün bedeutet, dass die Aktion erlaubt ist** und jeder sie in deinem Claim durchführen kann. Auf das Glas zu klicken, lässt dich den aktiven Zustand für diesen Schutz umschalten. Die Änderungen werden sofort übernommen.

## Whitelist

Auf das Spieler-Kopf-Symbol klickst du, um zum Whitelist Menu zu gelangen. (Siehe: [Whitelist](./claims/whitelist))

![Claim Whitelist UI](/assets/images/claims/claim-whitelist.png)

Hier siehst du alle Spieler, die aktuell auf dem Claim eingelistet sind. Unter jedem Spieler-Kopf ist eine rotes Glasscheibe. Darauf zu klicken, ermöglicht dir, diesen Spieler von der Whitelist zu entfernen. In der Mitte der Oberfläche befindet sich eine grüne Glasscheibe. Darauf zu klicken, fügt einen neuen Spieler zur Whitelist hinzu. Es öffnet sich ein Schild. Du musst den Namen des Spielers, den du hinzufügen möchtest, in die **erste Zeile** des Schildes eingeben.

![Claim Whitelist Sign UI](/assets/images/claims/claim-whitelist-sign.png)

Der Spieler wird dann zur Whitelist hinzugefügt.

_Hinweis: Das Öffnen der Sign UI spawnt ein temporäres Schild unter dir. Dieses Schild existiert nur für dich und keinen anderen Spieler. Es verschwindet, wenn du die UI schließt. Dies kann in manchen Randfällen zu Synchronisationsproblemen zwischen Server und Client führen. Sollte das passieren, löst ein erneutes Einloggen das Problem normalerweise._

---

# Weitere Befehle

## Besitzer suchen (Owner Lookup)
Nutze `/claim who`, um zu überprüfen, wer einen bestimmten Chunk besitzt.