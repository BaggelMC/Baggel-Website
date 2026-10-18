---
title: Status
---

![Status Showcase](@assets/docs/images/status/showcase.png)

Das **Status System** ermöglicht es Spielern, kurze, farbige Tags vor ihrem Namen anzuzeigen. Auf dieser Seite erfahren Sie, wie Sie als Administrator die Status konfigurieren und verwalten können. Erfahren Sie mehr über die Nutzung von Status in unserer [Player Status Documentation](/core/player/status).

---

Statuses werden in der `status.yml` definiert. Ein grundlegender Status-Eintrag sieht folgendermaßen aus:

```yaml
example:
  display-name: "<b><gradient:#5e4fa2:#f79459>[Example Status]</gradient></b><reset> "
```

Der Schlüssel (`example` in diesem Fall) ist die ID des Status. Dies ist der Wert, mit dem Spieler den Status in ihrem Befehl referenzieren (z. B. `/status set example`). IDs können Klein- und Großbuchstaben sowie Zahlen enthalten, **dürfen aber keine Leerzeichen** oder Zeichen beinhalten, die nicht im Minecraft Chat getippt werden können – das ist aus offensichtlichen Gründen zu erwarten.

Der `display-name` ist der eigentliche Tag-Inhalt. Er ist ein formatiertes String und nutzt das [MiniMessage](https://docs.papermc.io/adventure/minimessage/format/) Format.

Wir empfehlen, unseren eigenen [MiniMessage Editor](https://baggel.de/tools/minimessage/) zu verwenden, um Ihren Status zu gestalten.

Alternativ können Sie auch den [Official MiniMessage Viewer](https://webui.advntr.dev) oder den [RGBirdflop Editor](https://www.birdflop.com/resources/rgb/) nutzen *(falls Sie das Feld `Color Format` auf `MiniMessage` setzen)*.

### Hinweise zur Formatierung:

Der Spielername wird direkt an Ende des `display-name` angehängt. Das bedeutet, dass Formatierungen aus dem `display-name` auch in den Namen des Spielers übertragen werden können. Dies ist beabsichtigt und kann genutzt werden, um coole Effekte zu kreieren:

![No Reset Example](@assets/docs/images/status/no-reset-example-2.png)

Dennoch erwarten die meisten Spieler eine Standardformatierung ihres Namen. Das heißt, wenn Administratoren einen Tag hinzufügen, sollten sie immer ein `<reset>` Tag und ein abschließendes Leerzeichen (` `) am Ende des `display-name` einfügen, damit es für die Spieler wie beabsichtigt aussieht:

![Proper Reset Example](@assets/docs/images/status/reset-example.png)

---

## Zugriffsbeschränkung

Sie können begrenzen, wer bestimmte Status verwenden darf, indem Sie entweder einen **permissions key** oder einen **teams key** hinzufügen. Beide akzeptieren eine Liste von Werten, sodass Sie bei Bedarf mehrere Einträge angeben können.

### Beispiel: Berechtigungsbasierter Status

In diesem Beispiel dürfen diesen Status nur Spieler mit der Berechtigung `buildmc.admin` verwenden.

```yaml
admin:
  display-name: "<bold><red>[</red></bold><gradient:#ff0020:#dd0010>Admin</gradient><bold><red>]</red></bold><reset> "
  permissions:
    - buildmc.admin
```

### Beispiel: Team-basierter Status

In diesem Beispiel dürfen diesen Status nur Spieler verwenden, die Mitglied des Teams `red` sind.

```yaml
red-team:
  display-name: "<color:#ff0505>[Red]</color><reset> "
  teams:
    - red
```

Wenn ein Spieler versucht, einen Status zu setzen, überprüft das System automatisch, ob er die erforderliche Berechtigung besitzt oder einem der erlaubten Teams angehört.

---

## Neuladen

Nachdem Sie Status im Konfigurationsfile geändert oder hinzugefügt haben, können Sie den Befehl `/buildmc status reload` verwenden, damit die Änderungen wirken – ohne dass der Server neu gestartet werden muss.

Eine gut konfigurierte Status-Einrichtung hält alles optisch ansprechend, organisiert und fair für alle Spieler.
