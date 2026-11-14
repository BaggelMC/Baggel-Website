import { LINKS } from "../config";

export interface ServerStatus {
  online: boolean;
  players: number;
  maxPlayers: number;
}

const CACHE_KEY = "server-status";
const CACHE_MS = 60_000;

let pending: Promise<ServerStatus | null> | undefined;

/**
 * Fetches the server status once per page (header and homepage share the request)
 * and caches it for a minute across page loads. Resolves to null on failure.
 */
export function getServerStatus(): Promise<ServerStatus | null> {
  pending ??= load();
  return pending;
}

async function load(): Promise<ServerStatus | null> {
  try {
    const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY) ?? "null");
    if (cached && Date.now() - cached.t < CACHE_MS) return cached.status;
  } catch {}

  try {
    const res = await fetch(`https://api.mcsrvstat.us/3/${LINKS.server_address}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    const status: ServerStatus = {
      online: !!data.online,
      players: data.players?.online ?? 0,
      maxPlayers: data.players?.max ?? 0,
    };
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), status }));
    } catch {}
    return status;
  } catch (err) {
    console.error("Error fetching server info:", err);
    return null;
  }
}
