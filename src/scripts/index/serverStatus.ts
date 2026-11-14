import { getServerStatus } from "../serverStatus";

const statusEl = document.getElementById("server-status");
const playersEl = document.getElementById("server-players");

if (statusEl && playersEl) {
  getServerStatus().then((s) => {
    if (!s) {
      statusEl.textContent = "Fehler";
      statusEl.className = "text-error";
      playersEl.textContent = "-";
    } else if (s.online) {
      statusEl.textContent = "Online";
      statusEl.className = "text-success";
      playersEl.textContent = `${s.players} / ${s.maxPlayers}`;
    } else {
      statusEl.textContent = "Offline";
      statusEl.className = "text-error";
      playersEl.textContent = "-";
    }
  });
}
