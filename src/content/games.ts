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
    name: "Kart",
    description:
      "Tritt in rasanten Rennen gegen andere Spieler an! Drifte durch Kurven, setze Items ein, weiche Hindernissen aus und kämpfe dich auf den ersten Platz. Nur die Schnellsten schaffen es aufs Podium!",
    image: "Kart",
    imageAlt:
      "Drei Spieler driften mit Karts in einem Rennen.",
  },
  {
    name: "CrystalFight",
    description:
      "Katapultiere dich mit End-Kristallen und Respawn-Ankern über die Karte! Zerstöre das Bett deines Gegners und schalte ihn aus, bevor er dir zuvorkommt. Präzises Timing und mutige Sprünge entscheiden über Sieg oder Fall.",
    image: "Crystalfight",
    imageAlt:
      "Ein Spieler wird durch die Explosion eines End-Kristalls über eine Arena mit Betten katapultiert.",
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
      "Ein farbenfrohes Ludo-Spielbrett aus Blöcken mit bunten Spielfiguren.",
  },
  {
    name: "Duels",
    description:
      "Kit-PvP in Reinform, ein echter Klassiker. Wähle dein Kit, schärfe deine Reflexe und kämpfe im 1v1 um den Sieg in unseren Arenen! Nur die Besten werden bestehen.",
    image: "PvP",
    imageAlt:
      "Zwei Spieler in Rüstungen kämpfen mit Schwertern und Schilden in einer Arena.",
  },
];

export const unfinishedGames: ConceptGame[] = [
  {
    name: "Elytra Race",
    description:
      "Hast du die Flügel schon gemeistert? Messe deine Flugkünste in einem rasantem Wettrennen!",
    icon: "elytra",
  },
  {
    name: "Chess",
    description:
      "Das klassische Strategiespiel im Minecraft-Stil. Bewege deine Armee über das Brett, plane jeden Angriff und setze deinen Gegner schachmatt!",
    icon: "chess",
  },
  {
    name: "Golf",
    description:
      "Ab auf den Platz! Meistere anspruchsvolle Löcher und tritt an, um mit möglichst wenigen Schlägen ins Ziel zu kommen!",
    icon: "golf",
  },
  {
    name: "Minigolf",
    description:
      "Spiele dich durch kreative Bahnen voller Hindernisse und kniffliger Herausforderungen. Wie viele Schläge wirst du brauchen?",
    icon: "minigolf",
  },
];
