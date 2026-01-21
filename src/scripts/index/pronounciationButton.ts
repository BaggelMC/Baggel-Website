const chance = 0.1;
const rotationSpeed = 360;
const volume = 0.25;
const minClicksForSecret = 3;

document.addEventListener("DOMContentLoaded", () => {
  const playButton = document.getElementById("playAudioButton");
  const normalAudio = document.getElementById("pronunciationAudio") as HTMLAudioElement | null;

  if (!playButton || !normalAudio) return;

  normalAudio.volume = volume;

  let secretAudio: HTMLAudioElement | null = null;
  let secretReady = false;
  let loadingSecret = false;

  let partyModeActive = false;

  let animationFrameId: number | null = null;
  let hue = 0;
  let activeAudio: HTMLAudioElement | null = null;
  let clickCount = 0;
  let lastFrameTime: number | null = null;

  const colorVars = [
    "--color-text",
    "--color-text-50",
    "--color-text-100",
    "--color-background",
    "--color-background-gradient",
    "--color-background-10",
    "--color-background-50",
    "--color-background-100",
    "--color-primary",
    "--color-secondary",
    "--color-accent",
    "--color-success",
    "--color-success-gradient",
    "--color-error",
    "--color-error-gradient",
  ];

  const originalColors = colorVars.map(v =>
    getComputedStyle(document.documentElement).getPropertyValue(v).trim() || "#000000"
  );

  const hexToHSL = (hex: string) => {
    hex = hex.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;

    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h *= 60;
    }

    return { h, s, l };
  };

  type HSL = {
      h: number;
      s: number;
      l: number;
    };

    const hslToHex = ({ h, s, l }: HSL): string => {
      const c = (1 - Math.abs(2 * l - 1)) * s;
      const x = c * (1 - Math.abs((h / 60) % 2 - 1));
      const m = l - c / 2;

      let r = 0, g = 0, b = 0;

      if (h < 60) [r, g, b] = [c, x, 0];
      else if (h < 120) [r, g, b] = [x, c, 0];
      else if (h < 180) [r, g, b] = [0, c, x];
      else if (h < 240) [r, g, b] = [0, x, c];
      else if (h < 300) [r, g, b] = [x, 0, c];
      else [r, g, b] = [c, 0, x];

      const toHex = (v: number): string =>
        Math.round((v + m) * 255).toString(16).padStart(2, "0");

      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    };


  const updateColors = (time: number) => {
    if (!partyModeActive) return;

    if (lastFrameTime === null) lastFrameTime = time;
    const delta = (time - lastFrameTime) / 1000;
    lastFrameTime = time;

    hue = (hue + rotationSpeed * delta) % 360;

    colorVars.forEach((v, i) => {
      const hsl = hexToHSL(originalColors[i]);
      hsl.h = (hsl.h + hue) % 360;
      document.documentElement.style.setProperty(v, hslToHex(hsl));
    });
    animationFrameId = requestAnimationFrame(updateColors);
  };

  const startPartyMode = () => {
    if (partyModeActive) return;

    partyModeActive = true;
    hue = 0;
    lastFrameTime = null;
    animationFrameId = requestAnimationFrame(updateColors);
  };

  const stopPartyMode = () => {
    partyModeActive = false;


    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null;
    };
    
    lastFrameTime = null;

    colorVars.forEach((v, i) =>
      document.documentElement.style.setProperty(v, originalColors[i])
    );
  };

  const loadSecretAudio = () => {
    if (secretAudio || loadingSecret) return;

    loadingSecret = true;
    secretAudio = new Audio("/assets/audio/baggel_remix.mp3");
    secretAudio.volume = volume;
    secretAudio.preload = "auto";

    secretAudio.addEventListener("canplaythrough", () => {
      secretReady = true;
      loadingSecret = false;
    });

    secretAudio.addEventListener("ended", stopPartyMode);
  };

  normalAudio.addEventListener("ended", stopPartyMode);

  playButton.addEventListener("click", () => {
    clickCount++;

    if (clickCount === minClicksForSecret) {
      loadSecretAudio();
    }

    const canTriggerSecret = clickCount >= minClicksForSecret && secretReady;
    const isSecret = canTriggerSecret && Math.random() < chance;

    if (activeAudio) {
      activeAudio.pause();
      activeAudio.currentTime = 0;
    }

    activeAudio = isSecret && secretAudio ? secretAudio : normalAudio;

    activeAudio.currentTime = 0;
    activeAudio.play().catch(() => {});

    if (isSecret) startPartyMode();
    else stopPartyMode();
  });
});