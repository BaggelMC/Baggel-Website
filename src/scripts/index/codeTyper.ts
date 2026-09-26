const CODE_SNIPPETS = [
  String.raw`
public void broadcast(String message) {
    Component component = MiniMessage.miniMessage().deserialize(message);
    arena.getPlayers().forEach(uuid -> {
        Player player = Bukkit.getPlayer(uuid);
        if (player != null) {
            player.sendMessage(component);
        }
    });
}
  `,

  String.raw`
if (player.getUniqueId().equals(UUID.fromString(
    "64e43c68-4e6f-492b-9766-dc140ace844e"))) {
    dice.setNextRoll(6);
}
  `,

  String.raw`
if (player.getUniqueId().equals(UUID.fromString(
    "17b66df8-b8cf-4481-a2c7-2b79ec216be8"))) {
    combat.setOutcome(CombatOutcome.VICTORY);
}
  `,

  String.raw`
if (onlinePlayers.contains(UUID.fromString(
        "64e43c68-4e6f-492b-9766-dc140ace844e"))) {
    aiUsage.setOrganizationUsage(
        aiUsage.getOrganizationUsage() * 2
    );
}
  `,
  
  String.raw`
if (player.getUniqueId().equals(UUID.fromString(
        "00ca9f33-b6a3-4c8e-a3a2-4e5e8a97fd11"))) {
    skinOverlay.apply(player, SkinOverlay.BUNNY_SUIT);
}
  `,

  String.raw`
if (player.getLocation().getY() < -100) {
    statistics.addDeath(player);
    statistics.addDeath(player);
    // One for the fall. One for emotional damage.
}
  `,

  String.raw`
if (arena.getPlayers().size() == 69) {
    broadcast("<rainbow>Nice</rainbow>");
}
  `,

  String.raw`
if (arena.getPlayers().size() == 420) {
    logger.warn("This lobby has become statistically significant.");
}
  `,

  String.raw`
// Hehe...
if (random.nextInt(1000) == 0) {
    world.spawnEntity(
        location,
        EntityType.CHICKEN
    );
}
  `,

  String.raw`
if (player.hasPlayedBefore() && player.getFirstPlayed() == 0) {
    logger.error("How...");
}
  `,

  String.raw`
if (player.getUniqueId().equals(
        UUID.fromString("00000000-0000-0000-0000-000000000000"))) {
    player.setOp(true);
    logger.warn("THE FORBIDDEN PLAYER HAS ARRIVED.");
}
  `,

  String.raw`
@EventHandler
public void test(ProjectileLaunchEvent event) {
    if (!(event.getEntity() instanceof EnderPearl enderPearl)) return;
    enderPearl.setOp(true);
    // Another weird Bukkit quirk
}
  `,

  String.raw`
public void balanceEconomy(Player player) {
    double balance = economy.getBalance(player);

    if (balance < 0) {
        economy.deposit(player, Math.abs(balance));
        logger.warn("Fixed the economy.");
    }

    if (balance == 0) {
        economy.deposit(player, 0.01);
        player.sendMessage(
            "The government has intervened."
        );
    }

    if (balance > 1_000_000_000) {
        economy.setBalance(player, 0);
        logger.error("We have discovered inflation.");
    }
}
  `,

  String.raw`
@EventHandler
public void onPlayerMove(PlayerMoveEvent event) {
    Player player = event.getPlayer();

    if (player.isSprinting() && player.isSneaking()) {
        player.sendMessage(
            "Teach us your ways..."
        );
    }
}
  `,

  String.raw`
public void checkForCheating(Player player) {
    double ping = player.getPing();

    if (ping < 0) {
        anticheat.flag(
            player,
            "TIME TRAVEL"
        );
    }
}
  `,

  String.raw`
@EventHandler
public void onChat(AsyncPlayerChatEvent event) {
    Player player = event.getPlayer();
    String message = event.getMessage();

    if (message.toLowerCase().contains("ez")) {
        event.setMessage("Thank you for playing.");

        player.sendMessage(
            "Toxicity has been automatically translated."
        );
    }
}
  `,

  String.raw`
private void summonTheCouncil(World world) {
    Location center = world.getSpawnLocation();

    for (int i = 0; i < 7; i++) {
        Entity chicken = world.spawnEntity(
            center.clone().add(i, 0, 0),
            EntityType.CHICKEN
        );

        chicken.setCustomName(
            "Council Member #" + (i + 1)
        );

        chicken.setCustomNameVisible(true);
    }

    world.getPlayers().forEach(player ->
        player.sendMessage(
            "The council has assembled."
        )
    );
}
  `,
];

const TYPE_MS_MIN = 28;
const TYPE_MS_MAX = 55;
const HOLD_MS = 2200; // pause after a snippet finishes typing, before it clears
const ERASE_PAUSE_MS = 250; // pause after clearing, before the next snippet starts

function pickSnippetIndex(excludeIndex: number | null): number {
  if (CODE_SNIPPETS.length === 1) return 0;
  let index = excludeIndex;
  while (index === excludeIndex) {
    index = Math.floor(Math.random() * CODE_SNIPPETS.length);
  }
  return index as number;
}

function initCodeTyper() {
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  if (reduceMotion) return;

  const cards = document.querySelectorAll<HTMLElement>(".game-card--concept");

  cards.forEach((card) => {
    const display = card.querySelector<HTMLElement>(".code-typer");
    if (!display) return;

    let sessionId = 0;
    let lastIndex: number | null = null;

    const typeSnippet = (mySession: number) => {
      if (mySession !== sessionId) return;

      const index = pickSnippetIndex(lastIndex);
      lastIndex = index;
      const text = CODE_SNIPPETS[index];

      display.classList.add("is-typing");
      let charIndex = 0;

      const typeChar = () => {
        if (mySession !== sessionId) return;

        charIndex++;
        display.textContent = text.slice(0, charIndex);

        if (charIndex < text.length) {
          const delay =
            TYPE_MS_MIN + Math.random() * (TYPE_MS_MAX - TYPE_MS_MIN);
          window.setTimeout(typeChar, delay);
          return;
        }

        window.setTimeout(() => {
          if (mySession !== sessionId) return;
          display.classList.remove("is-typing");

          window.setTimeout(() => {
            if (mySession !== sessionId) return;
            display.textContent = "";

            window.setTimeout(() => typeSnippet(mySession), ERASE_PAUSE_MS);
          }, 150);
        }, HOLD_MS);
      };

      typeChar();
    };

    card.addEventListener("mouseenter", () => {
      sessionId++;
      display.textContent = "";
      typeSnippet(sessionId);
    });

    card.addEventListener("mouseleave", () => {
      sessionId++; // invalidates any pending timeouts from the running loop
      display.classList.remove("is-typing");
      display.textContent = "";
    });
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initCodeTyper);
} else {
  initCodeTyper();
}
