const MAX_TILT_DEG = 8;
const STIFFNESS = 0.12; // how strongly a value accelerates toward its target each frame
const FRICTION = 0.42; // fraction of velocity kept each frame (lower = more drag)
const REST_EPSILON = 0.01; // velocity/offset threshold below which we stop animating

interface Spring {
  value: number;
  velocity: number;
  target: number;
}

function makeSpring(initial: number): Spring {
  return { value: initial, velocity: 0, target: initial };
}

function stepSpring(spring: Spring): void {
  spring.velocity += (spring.target - spring.value) * STIFFNESS;
  spring.velocity *= FRICTION;
  spring.value += spring.velocity;
}

function springAtRest(spring: Spring): boolean {
  return (
    Math.abs(spring.velocity) < REST_EPSILON &&
    Math.abs(spring.target - spring.value) < REST_EPSILON
  );
}

interface TiltState {
  rotX: Spring;
  rotY: Spring;
  glowX: Spring; // percentage, 0-100
  glowY: Spring; // percentage, 0-100
  frameId: number | null;
}

function initCardTilt() {
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  const cards = document.querySelectorAll<HTMLElement>(".tilt-card");

  cards.forEach((card) => {
    if (reduceMotion) {
      card.addEventListener("mousemove", (event) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty(
          "--glow-x",
          `${((event.clientX - rect.left) / rect.width) * 100}%`,
        );
        card.style.setProperty(
          "--glow-y",
          `${((event.clientY - rect.top) / rect.height) * 100}%`,
        );
      });
      return;
    }

    const state: TiltState = {
      rotX: makeSpring(0),
      rotY: makeSpring(0),
      glowX: makeSpring(50),
      glowY: makeSpring(50),
      frameId: null,
    };

    card.style.transformStyle = "preserve-3d";

    const apply = () => {
      card.style.transform = `perspective(900px) rotateX(${state.rotX.value}deg) rotateY(${state.rotY.value}deg)`;
      card.style.setProperty("--glow-x", `${state.glowX.value}%`);
      card.style.setProperty("--glow-y", `${state.glowY.value}%`);
    };

    const step = () => {
      stepSpring(state.rotX);
      stepSpring(state.rotY);
      stepSpring(state.glowX);
      stepSpring(state.glowY);
      apply();

      const atRest =
        springAtRest(state.rotX) &&
        springAtRest(state.rotY) &&
        springAtRest(state.glowX) &&
        springAtRest(state.glowY);

      if (atRest) {
        state.rotX.value = state.rotX.target;
        state.rotY.value = state.rotY.target;
        state.glowX.value = state.glowX.target;
        state.glowY.value = state.glowY.target;
        state.rotX.velocity = state.rotY.velocity = 0;
        state.glowX.velocity = state.glowY.velocity = 0;
        apply();
        state.frameId = null;
        return;
      }

      state.frameId = requestAnimationFrame(step);
    };

    const ensureLoopRunning = () => {
      if (state.frameId === null) {
        state.frameId = requestAnimationFrame(step);
      }
    };

    card.addEventListener("mousemove", (event) => {
      const rect = card.getBoundingClientRect();
      const xRatio = (event.clientX - rect.left) / rect.width;
      const yRatio = (event.clientY - rect.top) / rect.height;

      state.rotY.target = (xRatio - 0.5) * MAX_TILT_DEG * 2;
      state.rotX.target = (0.5 - yRatio) * MAX_TILT_DEG * 2;
      state.glowX.target = xRatio * 100;
      state.glowY.target = yRatio * 100;

      ensureLoopRunning();
    });

    card.addEventListener("mouseleave", () => {
      state.rotX.target = 0;
      state.rotY.target = 0;
      state.glowX.target = 50;
      state.glowY.target = 50;
      ensureLoopRunning();
    });
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initCardTilt);
} else {
  initCardTilt();
}
