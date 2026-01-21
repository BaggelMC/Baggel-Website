document.addEventListener("DOMContentLoaded", async () => {
const SERVER_ADDRESS = "baggel.de";
const API_URL = `https://api.mcsrvstat.us/3/${SERVER_ADDRESS}`;
const statusEl = document.getElementById("server-status");
const playersEl = document.getElementById("server-players");
const motdEl = document.getElementById("server-motd");
const iconContainer = document.getElementById("serverIconContainer");
const iconImg = document.getElementById("server-icon");
const clickAudio = document.getElementById("clickAudio");
if (!statusEl || !playersEl || !motdEl) {
  console.warn("Server status elements not found in DOM.");
  return;
}
statusEl.textContent = "Lädt...";
statusEl.className = "text-neutral-400";
try {
  const res = await fetch(API_URL);
  if (!res.ok) {
    throw new Error(`HTTP error ${res.status}`);
  }
  const data = await res.json();
  // Status
  if (data.online) {
    statusEl.textContent = "Online";
    statusEl.className = "text-success";
    playersEl.textContent = `${data.players?.online ?? 0} / ${data.players?.max ?? 0}`;
  } else {
    statusEl.textContent = "Offline";
    statusEl.className = "text-error";
    playersEl.textContent = "-";
  }
  // MOTD
  if (data.motd?.html && Array.isArray(data.motd.html)) {
    motdEl.innerHTML = data.motd.html.join("<br>");
  } else {
    motdEl.textContent = "Kein MOTD verfügbar.";
  }
  // Icon
  if (data.icon && iconContainer && iconImg) {
    iconContainer.classList.remove("hidden");
    iconImg.setAttribute("src", data.icon);
    if (clickAudio instanceof HTMLAudioElement) {
      iconContainer.addEventListener("click", () => {
        clickAudio.volume = 0.3;
        clickAudio.play().catch(() => {});
      });
    }
  } else if (iconContainer) {
    iconContainer.classList.add("hidden");
  }
} catch (err) {
  console.error("Error fetching server info:", err);
  statusEl.textContent = "Fehler";
  statusEl.className = "text-error";
  playersEl.textContent = "-";
  motdEl.textContent = "Server-Informationen konnten nicht geladen werden.";
}
});