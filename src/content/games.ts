export interface Game {
  name: string;
  description: string;
  /** File name (without extension) in src/assets/images/gamemodes/ */
  image: string;
  imageAlt: string;
}

export interface ConceptGame {
  name: string;
  description: string;
  /** File name (without extension) in src/assets/images/gamemodes/icons/ */
  icon: string;
}

export const finishedGames: Game[] = [
  {
    name: "CrystalFight",
    description:
      "Katapultiere dich mit End-Kristallen und Respawn-Ankern über die Karte! Zerstöre das Bett deines Gegners und schalte ihn aus, bevor er dir zuvorkommt. Präzises Timing und mutige Sprünge entscheiden über Sieg oder Fall.",
    image: "Crystalfight",
    imageAlt:
      "Ein Spieler wird durch die Explosion eines End-Kristalls über eine Arena mit Betten katapultiert.",
  },
  {
    name: "Knockback FFA",
    description:
      "Keine Teams, keine Gnade! Jeder Spieler für sich selbst! Springe in chaotische Free-for-All-Kämpfe, bei denen schnelles Denken und Geschick entscheiden, wer das Schlachtfeld dominiert.",
    image: "FFA",
    imageAlt:
      "Zwei Spieler kämpfen in einer Ebenenlandschaft mit Lederrüstungen und Knockback Sticks.",
  },
  {
    name: "Pillars of Fortune",
    description:
      "Du spawnst auf einem Bedrock-Turm mitten im Nichts. Alle paar Sekunden gibt dir das Schicksal einen zufälligen Gegenstand, darunter eigens gebraute Custom-Potions. Improvisiere und mach das Beste aus dem, was das Glück dir gibt. Wer zuletzt übrig bleibt, gewinnt.",
    image: "Pillars",
    imageAlt:
      "Ein Spieler steht auf einer schmalen Bedrock-Säule, die im Nichts schwebt, umgeben von treibenden Items.",
  },
  {
    name: "Ludo",
    description:
      "Das klassische Brettspiel, neu erfunden in Minecraft! Nutze Items, um deine Gegner zu sabotieren, und tritt in Duellen an, um zu entscheiden, wessen Spielfigur bleiben darf und wer zurück nach Hause muss.",
    image: "Ludo",
    imageAlt:
      "Ein farbenfrohes Ludo-Spielbrett aus Blöcken mit bunten Spielfiguren in Minecraft.",
  },
  {
    name: "Duels",
    description:
      "Kit-PvP in Reinform, ein echter Klassiker. Wähle dein Kit, schärfe deine Reflexe und kämpfe im 1v1 um den Sieg in unseren Arenen! Nur die Besten werden bestehen.",
    image: "PvP",
    imageAlt:
      "Zwei Spieler in Rüstungen kämpfen mit Schwertern und Schilden in einer Arena.",
  },
  {
    name: "Golf",
    description:
      "Golf, wie du es kennst, jetzt in Minecraft! Schlage den Ball mit Bedacht über liebevoll gestaltete Bahnen und versuche, mit möglichst wenigen Schlägen ins Loch zu treffen.",
    image: "Golf",
    imageAlt:
      "Ein Spieler steht auf einer grünen Golfbahn aus Blöcken und zielt auf das Loch.",
  },
  {
    name: "Minigolf",
    description:
      "Minigolf für zwischendurch! Meistere kreative, kniffelige Bahnen voller Hindernisse und Tricks und beweise, wer den ruhigsten Schwung hat.",
    image: "Minigolf",
    imageAlt:
      "Eine bunte Minigolfbahn mit Hindernissen und Kurven, gebaut aus Minecraft-Blöcken.",
  },
  {
    name: "Replica",
    description:
      "Pass genau auf! Ein Bild erscheint und es liegt an dir, es so schnell wie möglich originalgetreu nachzubauen. Geschwindigkeit und Präzision entscheiden, wer als Meisterbauer herrscht.",
    image: "Replica",
    imageAlt:
      "Zwei nebeneinander stehende Bauwerke, eines als Vorlage und eines als Nachbau eines Spielers.",
  },
  {
    name: "Elytra Race",
    description:
      "Teste deine Flugkünste im Rennen gegen andere! Rase mit deiner Elytra durch anspruchsvolle Streckenabschnitte und Ringe und sichere dir als Erster die Ziellinie.",
    image: "Elytra",
    imageAlt:
      "Mehrere Spieler fliegen mit Elytren durch eine Rennstrecke aus schwebenden Ringen.",
  },
];

export const unfinishedGames: ConceptGame[] = [
  {
    name: "BedWars",
    description:
      "Verteidige dein Bett und zerstöre die deiner Gegner! Sammle Ressourcen von deinem Generator, rüste dein Team aus und kämpfe um das letzte stehende Bett.",
    icon: "bedwars",
  },
  {
    name: "SkyWars",
    description:
      "Kämpfe auf schwebenden Inseln ums Überleben! Plündere Truhen nach Ausrüstung, überbrücke die Leere und sei der letzte Spieler, der noch in der Luft steht.",
    icon: "skywars",
  },
  {
    name: "Chess",
    description:
      "Das klassische Strategiespiel im Minecraft-Stil. Bewege deine Armee über das Brett, plane jeden Angriff und setze deinen Gegner schachmatt!",
    icon: "chess",
  },
  {
    name: "Hide and Seek",
    description:
      "Verstecke dich gut oder finde alle anderen! Ein Spieler sucht, während sich der Rest als Blöcke getarnt irgendwo auf der Karte versteckt. Wer zuletzt entdeckt wird, gewinnt.",
    icon: "hideandseek",
  },
  {
    name: "Lasertag",
    description:
      "Schnapp dir deinen Blaster und ballere dich zum Sieg! Schnelle Reflexe, gute Deckung und Teamarbeit entscheiden, wer das Feld am Ende dominiert.",
    icon: "lasertag",
  },
  {
    name: "TNT Tag",
    description:
      "Wer zuletzt die tickende TNT in der Hand hält, verliert! Gib sie rechtzeitig an einen anderen Spieler weiter, bevor sie hochgeht. Geschwindigkeit und Strategie entscheiden über Sieg oder Niederlage.",
    icon: "tnttag",
  },
];
