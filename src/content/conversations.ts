/**
 * Content for the team playground: conversations and one-liners.
 * Put this file next to team.ts (src/content/conversations.ts).
 *
 * HOW A CONVERSATION PLAYS
 * Two characters meet, face each other and take turns. The speaker gets a speech bubble
 * above their head for a duration based on the text length (about 2–6 s). The talk ends
 * after the last line (usually with a goodbye wave) or when somebody gets grabbed,
 * clicked, or otherwise interrupted.
 *
 * WRITING TIPS
 * - 2–8 lines per conversation is the sweet spot.
 * - Keep each line short (under ~80 characters): it has to fit in a small bubble.
 * - {a} is replaced by the name of participant 0, {b} by the name of participant 1.
 *   Participant 0 is whoever has `who: 0` lines. Who gets which role is random,
 *   unless the conversation has a `cast`.
 */

/** A small gesture played while a line is spoken. */
export type Emote = "wave" | "sneak" | "jump" | "punch";

export interface ConversationLine {
  /** Which participant speaks: 0 or 1. */
  who: 0 | 1;
  /** What they say. May contain {a} and {b}. */
  text: string;
  /** Optional gesture while saying it. "sneak" = quick crouch-bob, "jump" = hop. */
  emote?: Emote;
}

export interface Conversation {
  /** Unique, used to avoid repeating the same chat twice in a row. */
  id: string;
  /**
   * Optional: pin who plays which role. [participant 0, participant 1], using the ids
   * from team.ts. Use `null` for "anyone" in a slot.
   *
   *   cast: ["alex", "sam"]  -> only alex (as 0) and sam (as 1), never swapped
   *   cast: ["alex", null]   -> alex is always 0, participant 1 is anyone else
   *   cast: [null, "alex"]   -> alex is always 1, participant 0 is anyone else
   *
   * Omit `cast` (or use [null, null]) for a general conversation with random roles.
   * Weighting: 1 pinned slot is picked 2x as often as a general one, 2 pinned slots 3x.
   */
  cast?: [string | null, string | null];
  lines: ConversationLine[];
}

export const conversations: Conversation[] = [
  {
    id: "weekend",
    lines: [
      { who: 0, text: "Hey {b}! Wie war dein Wochenende?", emote: "wave" },
      {
        who: 1,
        text: "Ziemlich gut, ich hab endlich mein Haus fertig gebaut.",
      },
      { who: 0, text: "Mit Fenstern?" },
      { who: 1, text: "Ne, mit Linux.", emote: "sneak" },
    ],
  },
  {
    id: "coffee",
    lines: [
      { who: 0, text: "Kaffee?" },
      {
        who: 1,
        text: "Unbedingt. Aber nicht den aus der Maschine.",
        emote: "sneak",
      },
      { who: 0, text: "Der aus der Maschine ist der einzige, den es gibt." },
      { who: 1, text: "Dann eben doch den." },
    ],
  },
  {
    id: "where-going",
    lines: [
      { who: 0, text: "Wo gehst du hin?", emote: "wave" },
      { who: 1, text: "Weiß ich noch nicht." },
      { who: 0, text: "Das ist ein guter Plan." },
    ],
  },
  {
    id: "busy",
    lines: [
      { who: 0, text: "Hast du kurz Zeit?" },
      { who: 1, text: "Nein." },
      { who: 0, text: "Okay, ich frag später." },
    ],
  },
  {
    id: "standing",
    lines: [
      { who: 0, text: "Was machst du hier?" },
      { who: 1, text: "Stehen." },
      { who: 0, text: "Verstehe." },
      { who: 1, text: "Und du?" },
      { who: 0, text: "Auch stehen." },
      { who: 1, text: "Unsere Leben sind ja sooo spannend." },
    ],
  },
  {
    id: "coffee-again",
    lines: [
      { who: 0, text: "Schon Kaffee gehabt?" },
      { who: 1, text: "Ja." },
      { who: 0, text: "Und? Hilft's?" },
      { who: 1, text: "Ich bin jetzt müde und nervös." },
    ],
  },
  {
    id: "weather",
    lines: [
      { who: 0, text: "Schönes Wetter heute." },
      { who: 1, text: "..." },
      { who: 0, text: "Was?" },
      { who: 1, text: "Hier gibt es kein Wetter..." },
      { who: 0, text: "Immerhin kein Regen." },
    ],
  },
  {
    id: "lost",
    lines: [
      { who: 0, text: "Ich glaube, ich hab mich verlaufen." },
      { who: 1, text: "Bro es gibt hier nur vier Richtungen..." },
      { who: 0, text: "Fünf, wenn man schräg zählt!" },
      { who: 1, text: "Bitte geh nicht schräg bro..." },
    ],
  },
  {
    id: "nothing",
    lines: [
      { who: 0, text: "Was gibt's Neues?" },
      { who: 1, text: "Nicht viel. Bei dir?" },
      { who: 0, text: "Auch nicht." },
      { who: 1, text: "Na dann." },
      { who: 0, text: "Na dann." },
    ],
  },
  {
    id: "the-plan",
    lines: [
      { who: 0, text: "Hast du schon einen Plan?" },
      { who: 1, text: "Na klar." },
      { who: 0, text: "Und?" },
      { who: 1, text: "Der Plan ist es mir noch einen Plan zu überlegen." },
      { who: 0, text: "Na dann." },
    ],
  },
  {
    id: "remember",
    lines: [
      { who: 0, text: "Wolltest du mir nicht vorhin noch was sagen?" },
      { who: 1, text: "Ja, stimmt." },
      { who: 0, text: "Und?" },
      { who: 1, text: "Habs vergessen..." },
      { who: 0, text: "Bruh...", emote: "punch" },
    ],
  },
  {
    id: "compliment",
    lines: [
      { who: 0, text: "Cooler skin übrigens!" },
      { who: 1, text: "Danke! Deiner auch." },
      { who: 0, text: "Echt? Ich hab meinen schon seit Jahren." },
      { who: 1, text: "Sieht man..." },
    ],
  },
  {
    id: "long-time",
    lines: [
      { who: 0, text: "Lange nicht gesehen!" },
      { who: 1, text: "Wir haben uns vor zwei Minuten gesehen..." },
      { who: 0, text: "Krass, kam mir aber länger vor." },
    ],
  },
  {
    id: "awkward-wave",
    lines: [
      { who: 0, text: "Hey!", emote: "wave" },
      { who: 1, text: "Hey!", emote: "wave" },
      { who: 0, text: "Na, wie läuft's?" },
      { who: 1, text: "Geradeaus meistens." },
    ],
  },
  {
    id: "professional",
    lines: [
      { who: 0, text: "Hey! Wie läuft die Arbeit?" },
      { who: 1, text: "Sehr Professionell." },
      { who: 0, text: "Klingt gut." },
      { who: 1, text: "Ich hab seit zehn Minuten nichts gemacht..." },
    ],
  },
  {
    id: "update",
    lines: [
      { who: 0, text: "Gibt's ein Update?" },
      { who: 1, text: "Ja." },
      { who: 0, text: "Was ist neu?" },
      { who: 1, text: "Die Versionsnummer!" },
    ],
  },
  {
    id: "night",
    lines: [
      { who: 0, text: "Wird's hier eigentlich auch mal Nacht?" },
      { who: 1, text: "Keine Ahnung..." },
      { who: 0, text: "Bisschen unheimlich..." },
      { who: 1, text: "Immerhin spawnen keine Mobs." },
    ],
  },
  {
    id: "smalltalk-monday",
    lines: [
      { who: 0, text: "Na, wie läuft's?", emote: "wave" },
      { who: 1, text: "Frag mich nach dem zweiten Kaffee." },
      { who: 0, text: "Und danach?" },
      { who: 1, text: "Nach dem dritten." },
    ],
  },
  {
    id: "smalltalk-busy",
    lines: [
      { who: 0, text: "Hast du kurz Zeit?" },
      { who: 1, text: "Wie kurz ist kurz?" },
      { who: 0, text: "Fünf Minuten?" },
      { who: 1, text: "Dann nein." },
    ],
  },
  {
    id: "smalltalk-plans",
    lines: [
      { who: 0, text: "Was machst du später?" },
      { who: 1, text: "Mal schauen." },
      { who: 0, text: "Der Klassiker." },
      { who: 0, text: "Mensch bist du durchgeplant..." },
      { who: 1, text: "Ich plane flexibel." },
    ],
  },
  {
    id: "smalltalk-weather",
    lines: [
      { who: 0, text: "Ganz schön grau heute." },
      { who: 1, text: "Passt zu meinem Energielevel." },
    ],
  },
  {
    id: "smalltalk-lunch",
    lines: [
      { who: 0, text: "Was gibt's heute zu essen?" },
      { who: 1, text: "Gute Frage." },
    ],
  },
  {
    id: "dev-documentation",
    lines: [
      { who: 0, text: "Hast du dine Arbeit dokumentiert?" },
      { who: 1, text: "Natürlich." },
      { who: 0, text: "Wo?" },
      { who: 1, text: "In meinem Kopf." },
    ],
  },
  {
    id: "mc-mining",
    lines: [
      { who: 0, text: "Was suchst du eigentlich?" },
      { who: 1, text: "Diamanten." },
      { who: 0, text: "Seit drei Stunden?" },
      { who: 1, text: "Ich hab mich festgelegt." },
    ],
  },
  {
    id: "mc-inventory",
    lines: [
      { who: 0, text: "Kannst du das kurz halten?" },
      { who: 1, text: "Mein Inventar ist voll." },
      { who: 0, text: "Ich meinte die Diskussion." },
      { who: 1, text: "Ach so." },
      { who: 1, text: "Nö." },
    ],
  },
  {
    id: "social-name",
    lines: [
      { who: 0, text: "Hey, wie hieß das nochmal?" },
      { who: 1, text: "Was genau?" },
      { who: 0, text: "Dein Name." },
      { who: 1, text: "Wir kennen uns seit zwei Jahren." },
    ],
  },
  {
    id: "social-wave",
    lines: [
      { who: 0, text: "Hey!", emote: "wave" },
      { who: 1, text: "Winkst du mir?" },
      { who: 0, text: "Nee, jemandem hinter dir." },
      { who: 1, text: "Ach so. Schade..." },
    ],
  },
  {
    id: "social-silence",
    lines: [
      { who: 0, text: "..." },
      { who: 1, text: "..." },
      { who: 0, text: "Na ja." },
      { who: 1, text: "Joa." },
    ],
  },
  {
    id: "social-gossip",
    lines: [
      { who: 0, text: "Ich hab da ein Gerücht gehört." },
      { who: 1, text: "Was denn?" },
      { who: 0, text: "Hab's vergessen." },
      { who: 1, text: "Stark." },
    ],
  },
  {
    id: "silly-staring",
    lines: [
      { who: 0, text: "Warum starrst du mich an?" },
      { who: 1, text: "Du starrst doch auch." },
      { who: 0, text: "Ich war zuerst hier." },
      { who: 1, text: "Beeindruckende Argumentation." },
    ],
  },
  {
    id: "silly-important",
    lines: [
      { who: 0, text: "Ich muss dir etwas Wichtiges sagen." },
      { who: 1, text: "Ich höre." },
      { who: 0, text: "Ich hab Hunger." },
      { who: 1, text: "Das ist wirklich wichtig." },
    ],
  },
  {
    id: "silly-logic",
    lines: [
      { who: 0, text: "Du bist heute ungewöhnlich ruhig." },
      { who: 1, text: "Ich spare meine Energie." },
      { who: 0, text: "Für was?" },
      { who: 1, text: "Das finde ich noch raus." },
    ],
  },
  {
    id: "mathias-cancer",
    cast: ["mathias2246", null],
    lines: [
      { who: 0, text: "Hurensohn." },
      { who: 1, text: "Häh, bro, digga." },
      { who: 1, text: "Was für Hurensohn? Oha! Wie frech bro!" },
      { who: 1, text: "So gemein digga." },
      { who: 1, text: "Häh, meine Mutter hat Krebs bro." },
      { who: 0, text: "Meine Mutter nicht." },
      { who: 0, text: "Boom." },
    ],
  },
  {
    id: "basti-love",
    cast: ["basti4457", "dermino"],
    lines: [
      { who: 0, text: "Ich liebe dich." },
      { who: 1, text: "Häh, warum gehst du mir dann Fremd an Combat?" },
    ],
  },
  {
    id: "squirrel",
    cast: [null, "shxdowcrafter"],
    lines: [
      { who: 0, text: "Wie geht's deinem Eichhörnchen?" },
      { who: 1, text: "Ach lass mich einfach...", emote: "punch" },
    ],
  },
  {
    id: "pizza",
    cast: [null, "perry"],
    lines: [
      { who: 0, text: "Wie lief dein Tag so?" },
      { who: 1, text: "Meine Aufbackpizza ist verbrannt..." },
    ],
  },
  {
    id: "claude",
    cast: [null, "perry"],
    lines: [
      { who: 0, text: "Wie geht's Claudia?" },
      { who: 1, text: "Claudia ist hart am Arbeiten für mich." },
    ],
  },
  {
    id: "claude-2",
    cast: [null, "perry"],
    lines: [
      { who: 0, text: "Wie funktioniert dein Gamemode noch mal?" },
      { who: 1, text: "Frag Claudia." },
    ],
  },

  // Both roles fixed (only these two, alex always speaks first as 0):
  // {
  //   id: "alex-sam-pizza",
  //   cast: ["alex", "sam"],
  //   lines: [
  //     { who: 0, text: "{b}, du schuldest mir noch eine Pizza." },
  //     { who: 1, text: "Das war eine Wette, {a}, keine Schuld!" },
  //   ],
  // },
  //
  // Only role 0 fixed (alex talks to anyone):
  // {
  //   id: "alex-greets-everyone",
  //   cast: ["alex", null],
  //   lines: [
  //     { who: 0, text: "Hey {b}, hast du schon meinen neuen Build gesehen?" },
  //     { who: 1, text: "Nein, aber ich ahne Schlimmes." },
  //   ],
  // },
];

/** One-liners shown in a bubble for quick reactions. Keep them very short. */
export const reactions = {
  /** Said by a character who wriggles free and runs away when grabbed. */
  flee: [
    "Nö!",
    "Lass mich!",
    "Tschüss!",
    "Nicht heute!",
    "Keine Chance.",
    "Du kriegst mich niemals!",
    "Hey!",
    "Nicht anfassen!",
    "Lass das!",
  ],
  /** Said by (some of) the bystanders when someone is picked up. */
  watch: [
    "Oha!",
    "Was wird das?",
    "Nicht werfen!",
    "Lass los!",
    "Hä?",
    "Was soll das denn?",
    "Wie unhöflich...",
    "Bin ich froh auf dem Boden zu sein...",
    "Einfach aufgehoben...",
    "Hey!",
    "Flyhacks?",
  ],
};

/**
 * Everything a character can be playing during a conversation. "punch" can be put on a
 * conversation line; "hit" never is. It is handed to the other character by the Sim at the
 * moment the fist lands.
 */
export type PlayedEmote = Emote | "punch" | "hit" | BumpEmote;

/** Reactions to a bump. Never put on a conversation line; the Sim picks them. */
export type BumpEmote = "stumble" | "startle" | "angry" | "sorry" | "laugh";

/** What people say when they bump into each other (or get bumped). */
export const BUMP_LINES: Record<BumpEmote, readonly string[]> = {
  stumble: ["Uff!", "Autsch!", "Hoppla!", "Hey!", "Whoa!"],
  startle: ["Huch!", "Ah!", "Oha!", "Was war das?!"],
  angry: [
    "Hey! Augen auf!",
    "Pass doch auf!",
    "Geht's noch?!",
    "Hey, was soll das?",
  ],
  sorry: [
    "Oh, sorry!",
    "Entschuldigung!",
    "Huch, nicht gesehen!",
    "Tut mir leid!",
  ],
  laugh: ["Haha!", "Ups, haha!", "Alles gut, haha!"],
};
export const BUMP_FORGIVE = [
  "Schon gut!",
  "Kein Ding!",
  "Alles gut.",
  "Passiert.",
] as const;
export const BUMP_GRUMBLE = [
  "Hmpf.",
  "Pass nächstes Mal auf!",
  "Na toll.",
] as const;
