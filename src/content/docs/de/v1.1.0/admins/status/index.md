---
title: Status
navLabel: Status
navOrder: 11
---

![Status Showcase](/assets/images/status/showcase.png)

Das **Status System** lässt Spielern kurze, farbige Tags vor ihren Namen anzeigen. Diese Seite erklärt, wie du als Administrator die Status einrichtest und verwaltest. Wenn du wissen willst, wie man einen Status benutzt, schau dir einfach die [Player Status Dokumentation](../players/status) an.

---

Ein Status in der Datei `status.yml` definiert. Ein einfacher Status-Eintrag sieht so aus:

```
example:
  display-name: "<b><gradient:#5e4fa2:#f79459>[Example Status]</gradient></b><reset> "
```

Der Key (`example` in diesem Fall) ist die ID des Status. Das ist der Name, den die Spieler im Chat benutzen müssen (z. B. `/status set example`). IDs können Kleinbuchstaben, Großbuchstaben und Zahlen enthalten, aber **dürfen keinen Leerzeichen** oder Zeichen enthalten, die man im Minecraft-Chat nicht tippen kann, aus offensichtlichen Gründen.

Der `display-name` ist der eigentliche Text, der angezeigt wird. Es ist ein String-Format, das [MiniMessage](https://docs.papermc.io/adventure/minimessage/format/) benutzt.

Wir empfehlen dir, unseren eigenen [MiniMessage Editor](/tools/minimessage/) zu nutzen, um einen Status zu designen.

Alternativ kannst du auch den [Official MiniMessage Viewer](https://webui.advntr.dev) oder den [RGBirdflop Editor](https://www.birdflop.com/resources/rgb/) nutzen _(wenn du das Feld `Color Format` auf `MiniMessage` stellst)_.

## Was du beim Formatieren beachten solltest:

Der Spielername wird direkt an das Ende des `display-name` angehängt. Das bedeutet, dass Formatierungen, die im `display-name` sind, auch auf den Namen des Spielers „übergehen“ können. Das ist absicht, weil man es auch für coole Effekte nutzen kann:

![No Reset Example](/assets/images/status/no-reset-example-2.png)

Allerdings erwarten die meisten Spieler, dass ihr Name die Standardformatierung behält. Kurzum: Wenn du einen Status hinzufügst, sollten Admins immer ein `<reset>` Tag und ein abschließendes Leerzeichen am Ende des `display-name` einbauen. Das stellt sicher, dass der Status so aussieht, wie die Spieler es erwarten:

![Proper Reset Example](/assets/images/status/reset-example.png)

---

# Zugriff einschränken

Du kannst limitieren, wer bestimmte Status nutzen darf, indem du entweder einen **Berechtigungs-Key** (permissions key) oder einen **Team-Key** (teams key) hinzufügst. Beides akzeptiert eine Liste von Werten, sodass du bei Bedarf mehrere Einträge angeben kannst.

## Beispiel: Status basierend auf Berechtigungen:

Bei diesem Beispiel können nur Spieler mit der Berechtigung `buildmc.admin` diesen Status nutzen.

```
admin:
  display-name: "<bold><red>[</red></bold><gradient:#ff0020:#dd0010>Admin</gradient><bold><red>]</red></bold><reset> "
  permissions:
    - buildmc.admin
```

## Beispiel: Status basierend auf Teams:

Hier können nur Spieler, die zum Team `red` gehören, diesen Status verwenden.

```
red-team:
  display-name: "<color:#ff0505>[Red]</color><reset> "
  teams:
    - red
```

Wenn ein Spieler versucht, einen Status zu setzen, prüft das System automatisch, ob er die nötige Berechtigung hat oder zu einem der erlaubten Teams gehört.

---

# Neuladen

Nachdem du einen Status im Konfigurationsfile geändert oder hinzugefügt hast, kannst du `/buildmc status reload` verwenden, um die Änderungen sofort zu übernehmen, ohne dass du den Server neustarten musst.

Ein gut eingerichtetes Status-System macht das Ganze optisch ansprechend, ordentlich und fair für alle Spieler.
