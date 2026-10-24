import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import {
  IdleAnimation,
  PlayerObject,
  RunningAnimation,
  WalkingAnimation,
} from "skinview3d";
import { inferModelType, loadImage, loadSkinToCanvas } from "skinview-utils";
import * as THREE from "three";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Member } from "../content/team";
import {
  conversations,
  reactions,
  type Conversation,
  type ConversationLine,
  type Emote,
  type PlayedEmote,
  type BumpEmote,
  BUMP_LINES,
  BUMP_FORGIVE,
  BUMP_GRUMBLE
} from "../content/conversations";

/* ────────────────────────────────────────────────────────────────────────
 * Tuning. 1 world unit = 1 Minecraft block, so a player is 2 units tall.
 * ──────────────────────────────────────────────────────────────────────── */

const ARENA = { halfW: 8, halfD: 4 } as const; // half-size of the area characters may roam
const EDGE = 0.6; // how close to the edge of the area characters may get
const BODY_R = 0.42; // collision radius between characters
const LIFT = 2.5; // how high a grabbed character hangs (feet height)
const GRAVITY = 26;
const WALK_SPEED = 1.7; // blocks / second
const RUN_SPEED = 4;
const DRAG_THRESHOLD_PX = 6; // movement before a press becomes a drag
const CLICK_MAX_MS = 500; // longer presses without movement are not clicks
const CREEP_SPEED = 1.0; // sneaking
const FLEE_SPEED = 5;
const FLEE_CHANCE = 0.1; // chance that grabbing someone makes them run away instead
const WATCH_RADIUS = 5; // bystanders this close stop and stare when someone is held
const HEAD_HEIGHT = 1.75; // eye level, for looking up/down at things
const MAX_HEAD_YAW = THREE.MathUtils.degToRad(50); // head can turn this far before the body follows
const SNEAK_SHIFT = 4; // model pixels the sneaking body is pushed backward, so two sneakers facing each other don't clip
const SPACING = 2.2; // characters closer than this count as bunched up

// Walking around each other, and the occasional collision anyway.
const AVOID_CLEARANCE = 1.0; // walkers try to pass others at least this far away (contact is 2 * BODY_R = 0.84)
const AVOID_LOOKAHEAD_BASE = 1.4; // how far ahead a walker looks for people in the way ...
const AVOID_LOOKAHEAD_PER_SPEED = 0.55; // ... plus this much per block/s, so runners notice earlier
const AVOID_MAX_STEER = 1.9; // radians a walker may veer off the straight line to its goal
const AVOID_PERSONAL_SPACE = 1.3; // closer than this, a walker actively backs away from someone
const AVOID_LEAD = 0.4; // seconds of the other's movement a walker anticipates
const BUMP_MIN_CLOSING = 1.1; // blocks/s of closing speed needed for a touch to count as a bump
const BUMP_HARD_CLOSING = 3.2; // above this (runners, head-on walkers) it is a hard bump
const BUMP_COOLDOWN = 6; // seconds before the same character can be bumped again
const BUMP_SHOVE_BASE = 1.0; // blocks/s the victim is pushed away ...
const BUMP_SHOVE_GAIN = 0.6; // ... plus this much per block/s of closing speed
const BUMP_LEAN_SCALE = 0.55; // a stumble tips the body back this fraction of a punch's HIT_LEAN
const BOW_LEAN = 0.3; // radians of the apologetic bow

// skinview3d's model is 32 "pixels" tall. The feet offset is measured per rig (see Character).
const MODEL_SCALE = 1 / 16;

const CAMERA_TARGET = new THREE.Vector3(0, 0.6, 0.2);
const CAMERA_ELEVATION = THREE.MathUtils.degToRad(38);

/* ────────────────────────────────────────────────────────────────────────
 * Simulation: plain data + one update function, no React, no three objects.
 * ──────────────────────────────────────────────────────────────────────── */

type Mode =
  | "idle"
  | "walk"
  | "run"
  | "creep" // sneaking along, crouched
  | "flee" // running away after being grabbed
  | "wave"
  | "bob" // sneak-bobbing at someone
  | "talk" // in a conversation
  | "watch" // paused, staring at whoever is being held
  | "bump" // just ran into someone (or was run into) and is reacting
  | "grabbed"
  | "air";

/** Modes in which the character travels, and how fast. */
const MOVE_SPEED: Partial<Record<Mode, number>> = {
  walk: WALK_SPEED,
  run: RUN_SPEED,
  creep: CREEP_SPEED,
  flee: FLEE_SPEED,
};
const isMoving = (m: Mode) => m in MOVE_SPEED;

/**
 * Chance, rolled once per trip, that the walker is not paying attention and will not steer
 * around anyone on the way. This is what still lets people bump into each other.
 */
const CARELESS_CHANCE: Partial<Record<Mode, number>> = {
  walk: 0.07,
  creep: 0.03,
  run: 0.2,
  flee: 0.25,
};

/** How quickly the body turns to match the head while standing (per second). */
const BODY_FOLLOW: Partial<Record<Mode, number>> = {
  idle: 1,
  wave: 5,
  bob: 5,
  talk: 5,
  watch: 5,
  bump: 8,
  grabbed: 6,
  air: 3,
};



// Punch timeline, in seconds since the emote started.
const PUNCH_WINDUP = 0.2; // arm is drawn back; at the end of it the puncher steps in
const PUNCH_IMPACT = 0.32; // the fist lands
const PUNCH_HOLD = 0.5; // arm stays out until here, then drops
const PUNCH_LUNGE = 1.3; // speed (blocks/s) of the step toward the target; decays to ~0.2 blocks
const PUNCH_KNOCKBACK = 3.4; // speed (blocks/s) the victim is shoved away; decays to ~0.5 blocks
const HIT_LEAN = 0.38; // radians the victim's whole body tips back, pivoting at the feet
const HIT_HEAD_SNAP = 0.5; // radians the victim's head is thrown back

const EMOTE_DUR: Record<PlayedEmote, number> = {
  wave: 1.3,
  sneak: 0.9,
  jump: 0.55,
  punch: 0.9,
  hit: 0.9,
  stumble: 0.9,
  startle: 0.7,
  angry: 1.4,
  sorry: 1.2,
  laugh: 1.3,
};


interface Goal {
  x: number;
  z: number;
  friendId?: string;
}

interface Convo {
  id: string;
  lines: ConversationLine[];
  agents: [Agent, Agent];
  line: number; // index of the line being spoken, -1 before the first
  t: number; // seconds until the next line
}

interface Agent {
  id: string;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  heading: number; // BODY direction, radians around Y; 0 faces +Z, which is toward the camera
  gaze: number; // HEAD direction (world yaw), eases toward gazeT
  gazeT: number;
  gazePitch: number; // positive = looking up
  gazePitchT: number;
  lookT: number; // countdown to the next idle glance
  mode: Mode;
  timer: number;
  goal: Goal | null;
  faceId: string | null; // who to look at while waving / watching
  grabX: number; // where the pointer wants the feet while grabbed
  grabZ: number;
  speed: number; // measured ground speed (blocks/s), smoothed. Drives the walk animation.
  stuck: number; // seconds spent trying to walk without getting anywhere
  crouch: number; // 0..1
  phase: number; // desynchronises sneak-bobbing
  say: string | null; // current speech bubble
  sayT: number;
  emote: PlayedEmote | null;
  emoteT: number; // seconds since the emote started
  hop: number; // extra height from a jump emote
  convo: Convo | null;
  watchDelay: number; // reaction time before the stare starts
  wvx: number; // velocity (blocks/s) of this frame's own walking, 0 when not walking. Used to judge bumps.
  wvz: number;
  steer: number; // radians the walker is currently veering off the line to its goal, smoothed
  careless: boolean; // this trip, doesn't look where it is going
  bumpCd: number; // seconds until this one can be bumped again
  reply: string | null; // a line to say a moment from now
  replyT: number;
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const wrapAngle = (v: number) => Math.atan2(Math.sin(v), Math.cos(v));
/** Turn `cur` toward `target` along the shortest way, exponentially. */
const approachAngle = (cur: number, target: number, rate: number, dt: number) =>
  wrapAngle(cur + wrapAngle(target - cur) * (1 - Math.exp(-rate * dt)));
function pick<T>(list: readonly T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

function pickWeighted<T>(entries: readonly (readonly [T, number])[]): T {
  let r = Math.random() * entries.reduce((sum, [, w]) => sum + w, 0);
  for (const [v, w] of entries) {
    r -= w;
    if (r <= 0) return v;
  }
  return entries[entries.length - 1][0];
}

/** Best-candidate sampling: of a few random points, the one farthest from everything in `taken`. */
function spreadSpot(
  taken: readonly { x: number; z: number }[],
  tries = 12,
): { x: number; z: number } {
  let best = { x: 0, z: 0 };
  let bestScore = -Infinity;
  for (let i = 0; i < tries; i++) {
    const x = rand(-ARENA.halfW + EDGE + 0.3, ARENA.halfW - EDGE - 0.3);
    const z = rand(-ARENA.halfD + EDGE + 0.3, ARENA.halfD - EDGE - 0.3);
    let score = Infinity;
    for (const t of taken) score = Math.min(score, Math.hypot(t.x - x, t.z - z));
    if (score > bestScore) {
      bestScore = score;
      best = { x, z };
    }
  }
  return best;
}

class Sim {
  readonly agents: Agent[];
  readonly byId = new Map<string, Agent>();
  selectedId: string | null = null;
  viewerX = 0; // camera position, for "look at the visitor"
  viewerY = 12;
  viewerZ = 20;

  private readonly names: Record<string, string>;
  private convos: Convo[] = [];
  private recent: string[] = []; // last few conversation ids, to avoid repeats
  private focus: Agent | null = null; // whoever is currently held or flying
  private reactCount = 0;
  private time = 0;

  constructor(ids: string[], names: Record<string, string>) {
    this.names = names;
    const placed: { x: number; z: number }[] = [];
    this.agents = ids.map((id) => {
      const heading = rand(-Math.PI, Math.PI);
      const spot = spreadSpot(placed);
      placed.push(spot);
      return {
        id,
        x: spot.x,
        y: 0,
        z: spot.z,
        vx: 0,
        vy: 0,
        vz: 0,
        heading,
        gaze: heading,
        gazeT: heading,
        gazePitch: 0,
        gazePitchT: 0,
        lookT: rand(0.2, 2),
        mode: "idle",
        timer: rand(0.2, 2.5),
        goal: null,
        faceId: null,
        grabX: 0,
        grabZ: 0,
        speed: 0,
        stuck: 0,
        crouch: 0,
        phase: rand(0, 6),
        say: null,
        sayT: 0,
        emote: null,
        emoteT: 0,
        hop: 0,
        convo: null,
        watchDelay: 0,
        wvx: 0,
        wvz: 0,
        steer: 0,
        careless: false,
        bumpCd: 0,
        reply: null,
        replyT: 0,
      } satisfies Agent;
    });
    for (const a of this.agents) this.byId.set(a.id, a);
  }

  update(dt: number) {
    if (dt <= 0) return;
    this.time += dt;
    this.focus =
      this.agents.find((a) => a.mode === "grabbed") ??
      this.agents.find((a) => a.mode === "air") ??
      null;

    for (const c of [...this.convos]) this.stepConvo(c, dt);

    const px = this.agents.map((a) => a.x);
    const pz = this.agents.map((a) => a.z);

    for (const a of this.agents) this.step(a, dt);
    this.collide();
    for (const a of this.agents) this.clampToIsland(a);

    this.agents.forEach((a, i) => {
      // Measure how far everyone really moved. Collisions and walls can cancel a walker's
      // intended motion, so the animation follows this, not the mode.
      const moved = Math.hypot(a.x - px[i], a.z - pz[i]) / dt;
      a.speed += (moved - a.speed) * (1 - Math.exp(-14 * dt));

      const wanted = MOVE_SPEED[a.mode];
      if (wanted !== undefined) {
        a.stuck = moved < wanted * 0.3 ? a.stuck + dt : 0;
        if (a.stuck > 0.6) {
          // Blocked (by a wall, someone held in place, a crowd): give up on this goal.
          a.mode = "idle";
          a.goal = null;
          a.timer = rand(0.5, 1.5);
          a.stuck = 0;
        }
      } else {
        a.stuck = 0;
      }

      if (a.bumpCd > 0) a.bumpCd -= dt;
      this.stepEmote(a, dt);
      this.stepGaze(a, dt);
      this.stepCrouch(a, dt);
      if (a.sayT > 0) {
        a.sayT -= dt;
        if (a.sayT <= 0) a.say = null;
      }
    });
  }

  /* ── pointer-driven API ── */

  /** Start holding a character. Returns false if they wriggle free and run away instead. */
  tryGrab(a: Agent): boolean {
    if (Math.random() < FLEE_CHANCE) {
      this.startFlee(a);
      return false;
    }
    this.releaseConvo(a);
    a.mode = "grabbed";
    a.goal = null;
    a.faceId = null;
    a.emote = null;
    a.hop = 0;
    a.say = null;
    a.sayT = 0;
    a.grabX = a.x;
    a.grabZ = a.z;
    a.vx = a.vz = a.vy = 0;
    this.reactCount = 0;
    return true;
  }

  moveGrab(a: Agent, x: number, z: number) {
    a.grabX = clamp(x, -ARENA.halfW + EDGE, ARENA.halfW - EDGE);
    a.grabZ = clamp(z, -ARENA.halfD + EDGE, ARENA.halfD - EDGE);
  }

  endGrab(a: Agent) {
    a.mode = "air";
    a.vy = 0;
    const speed = Math.hypot(a.vx, a.vz);
    const max = 9; // cap how hard you can throw
    if (speed > max) {
      a.vx *= max / speed;
      a.vz *= max / speed;
    }
  }

  /* ── per-agent behaviour ── */

  private step(a: Agent, dt: number) {
    a.wvx = a.wvz = 0; // set again by stepWalk if this one really walks this frame
    if (a.mode === "grabbed") return this.stepGrabbed(a, dt);
    if (a.mode === "air") return this.stepAir(a, dt);

    // The open info window pins its character in place, facing the visitor.
    if (a.id === this.selectedId) {
      this.releaseConvo(a);
      a.mode = "wave";
      a.goal = null;
      a.faceId = null;
      a.emote = null;
      a.reply = null;
      a.timer = 0.5;
    }

    // Someone nearby is being held: stop and stare.
    const f = this.focus;
    if (
      f &&
      f !== a &&
      a.mode !== "watch" &&
      a.mode !== "flee" &&
      a.id !== this.selectedId &&
      Math.hypot(f.x - a.x, f.z - a.z) < WATCH_RADIUS
    ) {
      this.startWatch(a, f);
    }

    switch (a.mode) {
      case "idle": {
        this.slide(a, dt);
        // Three or more bunched together: don't hang around, move on soon.
        if (a.timer > 0.6 && this.crowdCount(a) >= 2) a.timer = rand(0.2, 0.6);
        const near = this.nearest(a, 2.6);
        a.lookT -= dt;
        if (near) {
          this.lookAtAgent(a, near);
        } else if (a.lookT <= 0) {
          // Glance around. Past ~50° from the body the head drags the body along.
          a.lookT = rand(0.9, 3);
          if (Math.random() < 0.2) {
            this.lookAtViewer(a);
          } else {
            a.gazeT = wrapAngle(a.heading + rand(-1.7, 1.7));
            a.gazePitchT = rand(-0.2, 0.3);
          }
        }
        a.timer -= dt;
        if (a.timer <= 0) this.pickNext(a);
        break;
      }
      case "walk":
      case "run":
      case "creep":
      case "flee":
        this.stepWalk(a, dt);
        break;
      case "wave":
      case "bob": {
        this.slide(a, dt);
        const o = a.faceId ? this.byId.get(a.faceId) : undefined;
        if (o) this.lookAtAgent(a, o);
        else this.lookAtViewer(a);
        a.timer -= dt;
        if (a.timer <= 0) {
          a.mode = "idle";
          a.faceId = null;
          a.timer = rand(1, 3);
        }
        break;
      }
      case "bump": {
        this.slide(a, dt); // the shove from the collision
        const o = a.faceId ? this.byId.get(a.faceId) : undefined;
        if (o) this.lookAtAgent(a, o);
        else this.lookAtViewer(a);
        if (a.reply && (a.replyT -= dt) <= 0) {
          a.say = a.reply;
          a.sayT = 1.7;
          a.reply = null;
        }
        a.timer -= dt;
        if (a.timer <= 0) {
          a.mode = "idle";
          a.faceId = null;
          a.reply = null;
          a.timer = rand(0.6, 1.6);
        }
        break;
      }
      case "talk": {
        this.slide(a, dt);
        const c = a.convo;
        if (!c) {
          a.mode = "idle";
          a.timer = 1;
          break;
        }
        this.lookAtAgent(a, c.agents[0] === a ? c.agents[1] : c.agents[0]);
        break;
      }
      case "watch": {
        this.slide(a, dt);
        let target = a.faceId ? this.byId.get(a.faceId) : undefined;
        const now = this.focus;
        const close = now && Math.hypot(now.x - a.x, now.z - a.z) < WATCH_RADIUS * 1.4;
        if (now && close) {
          target = now; // keep staring while it lasts
          a.faceId = now.id;
          a.timer = 0.9;
        } else {
          a.timer -= dt; // linger a moment after it is over
          if (a.timer <= 0) {
            a.mode = "idle";
            a.faceId = null;
            a.timer = rand(0.8, 2);
            break;
          }
        }
        if (a.watchDelay > 0) a.watchDelay -= dt;
        else if (target) this.lookAtAgent(a, target);
        break;
      }
    }
  }

  private pickNext(a: Agent) {
    const others = this.agents.filter((o) => o !== a && this.canInteract(o));
    const r = Math.random();

    // Standing close to someone (e.g. after a chat): usually head off and spread out.
    if (this.crowdCount(a) >= 1 && Math.random() < 0.6) {
      this.startTravel(a, this.spreadPoint(a), Math.random() < 0.2 ? "run" : "walk");
      return;
    }

    if (r < 0.28) {
      this.startTravel(a, this.spreadPoint(a), "walk");
    } else if (r < 0.62 && others.length > 0) {
      // Visit someone who is on their own, so groups don't pile up around one person.
      const loners = others.filter((o) => this.crowdCount(o) === 0);
      const f = pick(loners.length > 0 ? loners : others);
      const m = Math.random();
      this.startTravel(
        a,
        { x: f.x, z: f.z, friendId: f.id },
        m < 0.25 ? "run" : m < 0.5 ? "creep" : "walk",
      );
    } else if (r < 0.7) {
      this.startTravel(a, this.spreadPoint(a), "run");
    } else if (r < 0.78) {
      a.mode = "wave";
      a.faceId = null;
      a.timer = 1.6;
    } else if (r < 0.83) {
      a.mode = "bob";
      a.faceId = null;
      a.timer = 2.2;
    } else {
      a.timer = rand(1.5, 4);
    }
  }

  /** How many other characters are standing within SPACING of this one. */
  private crowdCount(a: Agent) {
    let n = 0;
    for (const o of this.agents) {
      if (o === a || o.mode === "air" || o.mode === "grabbed") continue;
      if (Math.hypot(o.x - a.x, o.z - a.z) < SPACING) n++;
    }
    return n;
  }

  /** A random spot that is far from everyone's position and from where they are heading. */
  private spreadPoint(a: Agent): Goal {
    const taken: { x: number; z: number }[] = [];
    for (const o of this.agents) {
      if (o === a || o.mode === "air" || o.mode === "grabbed") continue;
      taken.push(o);
      if (o.goal && !o.goal.friendId) taken.push(o.goal);
    }
    return spreadSpot(taken, 10);
  }

  private randomPoint(): Goal {
    return {
      x: rand(-ARENA.halfW + EDGE + 0.3, ARENA.halfW - EDGE - 0.3),
      z: rand(-ARENA.halfD + EDGE + 0.3, ARENA.halfD - EDGE - 0.3),
    };
  }

  private stepWalk(a: Agent, dt: number) {
    const g = a.goal;
    if (!g) {
      a.mode = "idle";
      a.timer = 1;
      return;
    }

    let friend: Agent | undefined;
    if (g.friendId) {
      friend = this.byId.get(g.friendId);
      if (!friend || !this.canInteract(friend)) {
        a.goal = null;
        a.mode = "idle";
        a.timer = rand(0.5, 1.5);
        return;
      }
      g.x = friend.x; // keep following them
      g.z = friend.z;
    }

    const dx = g.x - a.x;
    const dz = g.z - a.z;
    const d = Math.hypot(dx, dz);
    const stopAt = friend ? 1.05 : 0.12;

    if (d <= stopAt) {
      a.goal = null;
      if (friend) {
        this.meet(a, friend);
      } else {
        a.mode = "idle";
        a.timer = rand(1, 3.5);
      }
      return;
    }

    const speed = MOVE_SPEED[a.mode] ?? WALK_SPEED;
    const goalAngle = Math.atan2(dx, dz);
    const angle = goalAngle + this.steerAround(a, goalAngle, d - stopAt, speed, friend?.id, dt);
    const move = Math.min(speed * dt, d - stopAt);
    const sx = Math.sin(angle);
    const sz = Math.cos(angle);
    a.x += sx * move;
    a.z += sz * move;
    a.wvx = (sx * move) / dt;
    a.wvz = (sz * move) / dt;
    // Moving: the view direction is the travel direction, and the body follows it.
    a.gazeT = angle;
    a.gazePitchT = 0;
    this.slide(a, dt); // leftover shove velocity from collisions
  }

  /** Begin walking, running, ... to `goal`, and roll whether this walker will watch where it goes. */
  private startTravel(a: Agent, goal: Goal, mode: Mode) {
    a.goal = goal;
    a.mode = mode;
    a.steer = Number.NaN; // "not computed yet": steerAround starts from the right value instead of easing in
    a.careless = Math.random() < (CARELESS_CHANCE[mode] ?? 0);
  }

  /**
   * How far (radians) to veer off the straight line to the goal so as to pass people with room
   * to spare. Anyone close to that line and ahead of the walker pushes it to the side; the
   * result is smoothed so the path bends instead of jittering. Careless walkers don't steer.
   * Two walkers meeting head-on both break the tie the same way, so they pass each other
   * like people on a pavement instead of mirroring each other into a collision.
   */
  private steerAround(
    a: Agent,
    goalAngle: number,
    remaining: number, // distance left to travel
    speed: number,
    ignoreId: string | undefined, // the friend being walked to
    dt: number,
  ) {
    let target = 0;
    if (!a.careless) {
      const lookahead = AVOID_LOOKAHEAD_BASE + speed * AVOID_LOOKAHEAD_PER_SPEED;
      // Start from the straight line to the goal and add a sideways nudge per person in the way.
      let vx = Math.sin(goalAngle);
      let vz = Math.cos(goalAngle);
      const sideX = Math.cos(goalAngle); // unit vector to the right of the line (positive `lateral`)
      const sideZ = -Math.sin(goalAngle);
      for (const o of this.agents) {
        if (o === a || o.id === ignoreId) continue;
        if (o.mode === "air" || o.mode === "grabbed" || o.y > 1.2) continue; // above head height
        // Where the other will be shortly, so crossing paths are noticed early.
        const rx = o.x + o.wvx * AVOID_LEAD - a.x;
        const rz = o.z + o.wvz * AVOID_LEAD - a.z;
        const dist = Math.hypot(rx, rz);
        if (dist > lookahead || dist < 1e-3) continue;
        const ahead = rx * Math.sin(goalAngle) + rz * Math.cos(goalAngle); // along the line to the goal
        if (ahead < -0.3 || ahead > remaining + 0.6) continue; // behind, or beyond the goal
        const lateral = rx * sideX + rz * sideZ;
        const miss = Math.abs(lateral);
        const urgency = 1 - dist / lookahead;
        if (miss < AVOID_CLEARANCE && ahead > 0) {
          // On a collision course: move over to the side with more room.
          const side = miss < 0.1 ? -1 : -Math.sign(lateral);
          const w = 1.6 * (1 - miss / AVOID_CLEARANCE) * (0.3 + 0.7 * urgency);
          vx += sideX * side * w;
          vz += sideZ * side * w;
        }
        if (dist < AVOID_PERSONAL_SPACE) {
          // Nearly touching: back away from them whatever the angle.
          const w = (2.2 * (AVOID_PERSONAL_SPACE - dist)) / AVOID_PERSONAL_SPACE;
          vx -= (rx / dist) * w;
          vz -= (rz / dist) * w;
        }
      }
      const off = wrapAngle(Math.atan2(vx, vz) - goalAngle);
      // Near the goal, stop dodging so that the last steps are not an endless side-step.
      target = clamp(off, -AVOID_MAX_STEER, AVOID_MAX_STEER) * clamp(remaining / 1.5, 0, 1);
    }
    if (Number.isNaN(a.steer)) a.steer = target;
    else a.steer += (target - a.steer) * (1 - Math.exp(-10 * dt));
    return a.steer;
  }

  private stepGrabbed(a: Agent, dt: number) {
    const k = 1 - Math.exp(-16 * dt);
    const nx = a.x + (a.grabX - a.x) * k;
    const nz = a.z + (a.grabZ - a.z) * k;
    const sm = 1 - Math.exp(-12 * dt); // smoothed velocity, used for throwing and leaning
    a.vx += ((nx - a.x) / dt - a.vx) * sm;
    a.vz += ((nz - a.z) / dt - a.vz) * sm;
    a.x = nx;
    a.z = nz;
    a.y += (LIFT - a.y) * (1 - Math.exp(-14 * dt));
    this.lookAtViewer(a); // stares at the visitor while held
  }

  private stepAir(a: Agent, dt: number) {
    a.vy -= GRAVITY * dt;
    a.y += a.vy * dt;
    a.x += a.vx * dt;
    a.z += a.vz * dt;
    const drag = Math.exp(-0.6 * dt);
    a.vx *= drag;
    a.vz *= drag;

    // bounce off the invisible walls
    const hx = ARENA.halfW - EDGE;
    const hz = ARENA.halfD - EDGE;
    if (Math.abs(a.x) > hx) {
      a.x = Math.sign(a.x) * hx;
      a.vx *= -0.5;
    }
    if (Math.abs(a.z) > hz) {
      a.z = Math.sign(a.z) * hz;
      a.vz *= -0.5;
    }

    if (a.y <= 0) {
      a.y = 0;
      if (a.vy < -4) {
        a.vy = -a.vy * 0.28; // small bounce
      } else {
        a.vy = 0;
        a.vx *= 0.4;
        a.vz *= 0.4;
        a.mode = "idle";
        a.timer = rand(0.8, 1.6);
      }
    }
    this.lookAtViewer(a);
  }

  /* ── head, body, crouch, gestures ── */

  private lookAtPoint(a: Agent, x: number, z: number, y: number) {
    a.gazeT = Math.atan2(x - a.x, z - a.z);
    const flat = Math.max(Math.hypot(x - a.x, z - a.z), 0.01);
    a.gazePitchT = clamp(Math.atan2(y - (a.y + HEAD_HEIGHT), flat), -0.5, 0.75);
  }

  private lookAtAgent(a: Agent, o: Agent) {
    this.lookAtPoint(a, o.x, o.z, o.y + HEAD_HEIGHT);
  }

  private lookAtViewer(a: Agent) {
    this.lookAtPoint(a, this.viewerX, this.viewerZ, this.viewerY);
  }

  /**
   * Minecraft-style head and body. The head swivels freely toward its target; while
   * standing, the body only catches up once the head would twist past MAX_HEAD_YAW, plus a
   * slow drift. While moving the body always follows the view direction.
   */
  private stepGaze(a: Agent, dt: number) {
    a.gaze = approachAngle(a.gaze, a.gazeT, 12, dt);
    a.gazePitch += (a.gazePitchT - a.gazePitch) * (1 - Math.exp(-12 * dt));

    if (isMoving(a.mode)) {
      a.heading = approachAngle(a.heading, a.gaze, 14, dt);
      return;
    }

    const diff = wrapAngle(a.gaze - a.heading);
    if (Math.abs(diff) > MAX_HEAD_YAW) {
      const excess = diff - Math.sign(diff) * MAX_HEAD_YAW;
      a.heading = wrapAngle(a.heading + excess * (1 - Math.exp(-16 * dt)));
    }
    a.heading = approachAngle(a.heading, a.gaze, BODY_FOLLOW[a.mode] ?? 1, dt);
  }

  private stepCrouch(a: Agent, dt: number) {
    let target = 0;
    if (a.mode === "creep") target = 1;
    else if (a.mode === "bob") target = Math.sin(this.time * 9 + a.phase) > 0 ? 1 : 0;
    else if (a.mode === "talk" && a.emote === "sneak") {
      target = Math.floor(a.emoteT / 0.22) % 2 === 0 ? 1 : 0;
    }
    a.crouch += (target - a.crouch) * (1 - Math.exp(-22 * dt));
  }

  private stepEmote(a: Agent, dt: number) {
    if (!a.emote) {
      a.hop = 0;
      return;
    }
    const before = a.emoteT;
    a.emoteT += dt;
    const dur = EMOTE_DUR[a.emote];
    if (a.emoteT >= dur) {
      a.emote = null;
      a.hop = 0;
      return;
    }

    if (a.emote === "punch") {
      const target = this.punchTarget(a);
      if (target) {
        // Wind-up over: step in toward the target.
        if (before < PUNCH_WINDUP && a.emoteT >= PUNCH_WINDUP) {
          this.kick(a, target.x, target.z, PUNCH_LUNGE);
        }
        // The fist lands: shove the target back and start their reaction.
        if (before < PUNCH_IMPACT && a.emoteT >= PUNCH_IMPACT) {
          this.kick(target, a.x, a.z, -PUNCH_KNOCKBACK);
          target.emote = "hit";
          target.emoteT = 0;
        }
      }
    }

    if (a.emote === "jump") a.hop = 0.5 * Math.sin((Math.PI * a.emoteT) / dur);
    else if (a.emote === "hit") a.hop = a.emoteT < 0.25 ? 0.12 * Math.sin((Math.PI * a.emoteT) / 0.25) : 0; // flinch
    else if (a.emote === "startle") a.hop = a.emoteT < 0.4 ? 0.3 * Math.sin((Math.PI * a.emoteT) / 0.4) : 0; // jump of fright
    else if (a.emote === "laugh") a.hop = 0.08 * Math.abs(Math.sin(a.emoteT * 13)); // shaking with laughter
    else a.hop = 0;
  }

  /** The other half of a's conversation, if both are still properly in it. */
  private punchTarget(a: Agent): Agent | null {
    const c = a.convo;
    if (!c || a.mode !== "talk") return null;
    const o = c.agents[0] === a ? c.agents[1] : c.agents[0];
    return o.convo === c && o.mode === "talk" ? o : null;
  }

  /** Kick `a` with horizontal speed toward (x, z); a negative speed kicks it away. */
  private kick(a: Agent, x: number, z: number, speed: number) {
    const dx = x - a.x;
    const dz = z - a.z;
    const d = Math.hypot(dx, dz) || 1;
    a.vx += (dx / d) * speed;
    a.vz += (dz / d) * speed;
  }

  /* ── social behaviour ── */

  private canInteract(o: Agent) {
    return (
      o.id !== this.selectedId &&
      o.mode !== "grabbed" &&
      o.mode !== "air" &&
      o.mode !== "talk" &&
      o.mode !== "watch" &&
      o.mode !== "bump" &&
      o.mode !== "flee"
    );
  }

  /** Two characters have just met: chat, sneak-bob at each other, or wave. */
  private meet(a: Agent, f: Agent) {
    // Only one conversation at a time; everyone else just waves or bobs.
    if (this.convos.length === 0 && Math.random() < 0.2) {
      const def = this.pickConversation(a, f);
      if (def) return this.startConvo(a, f, def);
    }
    const act: Mode = Math.random() < 0.45 ? "bob" : "wave";
    const dur = act === "bob" ? 2.4 : 1.8;
    a.mode = act;
    a.timer = dur;
    a.faceId = f.id;
    a.goal = null;
    f.mode = act;
    f.timer = dur;
    f.faceId = a.id;
    f.goal = null;
    f.emote = null;
  }

  /**
   * Decides who plays participant 0 and who plays participant 1.
   * Returns null if x and y don't satisfy the conversation's `cast`.
   */
  private assignRoles(def: Conversation, x: Agent, y: Agent): [Agent, Agent] | null {
    const [c0, c1] = def.cast ?? [null, null];
    const fits = (a: Agent, b: Agent) =>
      (c0 === null || c0 === a.id) && (c1 === null || c1 === b.id);
    const xy = fits(x, y);
    const yx = fits(y, x);
    if (xy && yx) return Math.random() < 0.5 ? [x, y] : [y, x]; // unconstrained: random
    if (xy) return [x, y];
    if (yx) return [y, x];
    return null;
  }

  private pickConversation(x: Agent, y: Agent): Conversation | null {
    const ok = conversations.filter(
      (c) => c.lines.length > 0 && this.assignRoles(c, x, y) !== null,
    );
    if (ok.length === 0) return null;
    const fresh = ok.filter((c) => !this.recent.includes(c.id));
    const pool = fresh.length > 0 ? fresh : ok;
    const weights = pool.map((c) => 1 + (c.cast?.filter((id) => id !== null).length ?? 0));
    let r = Math.random() * weights.reduce((sum, w) => sum + w, 0);
    for (let i = 0; i < pool.length; i++) {
      r -= weights[i];
      if (r <= 0) return pool[i];
    }
    return pool[pool.length - 1];
  }

  private startConvo(x: Agent, y: Agent, def: Conversation) {
    const [first, second] = this.assignRoles(def, x, y) ?? [x, y];

    const nameA = this.names[first.id] ?? first.id;
    const nameB = this.names[second.id] ?? second.id;
    const lines = def.lines.map((l) => ({
      ...l,
      text: l.text.replace(/\{a\}/g, nameA).replace(/\{b\}/g, nameB),
    }));

    const c: Convo = { id: def.id, lines, agents: [first, second], line: -1, t: 0.5 };
    for (const m of c.agents) {
      m.mode = "talk";
      m.convo = c;
      m.goal = null;
      m.faceId = null;
      m.say = null;
      m.sayT = 0;
      m.emote = null;
    }
    this.convos.push(c);
    this.recent.push(def.id);
    if (this.recent.length > 3) this.recent.shift();
  }

  private stepConvo(c: Convo, dt: number) {
    const [p, q] = c.agents;
    if (p.convo !== c || q.convo !== c || p.mode !== "talk" || q.mode !== "talk") {
      this.endConvo(c, false); // somebody got pulled away
      return;
    }
    c.t -= dt;
    if (c.t > 0) return;
    c.line++;
    if (c.line >= c.lines.length) {
      this.endConvo(c, true);
      return;
    }
    const l = c.lines[c.line];
    const speaker = c.agents[l.who];
    const listener = c.agents[1 - l.who];
    const dur = clamp(1 + l.text.length * 0.05, 1.8, 7);
    speaker.say = l.text;
    speaker.sayT = dur;
    speaker.emote = l.emote ?? null;
    speaker.emoteT = 0;
    listener.say = null;
    listener.sayT = 0;
    c.t = dur + 0.3;
  }

  private endConvo(c: Convo, natural: boolean) {
    this.convos = this.convos.filter((x) => x !== c);
    for (const a of c.agents) {
      const other = c.agents[0] === a ? c.agents[1] : c.agents[0];
      if (a.convo === c) a.convo = null;
      a.say = null;
      a.sayT = 0;
      a.emote = null;
      if (a.mode === "talk") {
        a.mode = "idle";
          a.timer = rand(1, 2.5);
      }
    }
  }

  private releaseConvo(a: Agent) {
    if (a.convo) this.endConvo(a.convo, false);
  }

  private startWatch(a: Agent, f: Agent) {
    this.releaseConvo(a);
    a.mode = "watch";
    a.goal = null;
    a.faceId = f.id;
    a.timer = 0.9;
    a.watchDelay = rand(0.05, 0.4);
    a.emote = null;
    if (this.reactCount < 2 && reactions.watch.length > 0 && Math.random() < 0.4) {
      this.reactCount++;
      a.say = pick(reactions.watch);
      a.sayT = 1.9;
    }
  }

  private startFlee(a: Agent) {
    this.releaseConvo(a);
    // Run to whichever of a few random spots is farthest away.
    let best = this.randomPoint();
    for (let i = 0; i < 4; i++) {
      const p = this.randomPoint();
      if (Math.hypot(p.x - a.x, p.z - a.z) > Math.hypot(best.x - a.x, best.z - a.z)) best = p;
    }
    this.startTravel(a, best, "flee");
    a.faceId = null;
    a.emote = null;
    a.say = reactions.flee.length > 0 ? pick(reactions.flee) : null;
    a.sayT = 1.5;
  }

  /* ── helpers ── */

  /** Apply leftover horizontal velocity with ground friction. */
  private slide(a: Agent, dt: number) {
    a.x += a.vx * dt;
    a.z += a.vz * dt;
    const f = Math.exp(-7 * dt);
    a.vx *= f;
    a.vz *= f;
  }

  private nearest(a: Agent, within: number): Agent | null {
    let best: Agent | null = null;
    let bestD = within;
    for (const o of this.agents) {
      if (o === a || o.mode === "air") continue;
      const d = Math.hypot(o.x - a.x, o.z - a.z);
      if (d < bestD) {
        bestD = d;
        best = o;
      }
    }
    return best;
  }

  /** Circle-vs-circle separation. A held character shoves others but is never shoved. */
  private collide() {
    const min = BODY_R * 2;
    for (let i = 0; i < this.agents.length; i++) {
      for (let j = i + 1; j < this.agents.length; j++) {
        const a = this.agents[i];
        const b = this.agents[j];
        if (a.y > 1.7 || b.y > 1.7) continue; // one is above the other's head
        const wa = a.mode === "grabbed" ? 0 : 1;
        const wb = b.mode === "grabbed" ? 0 : 1;
        if (wa + wb === 0) continue;

        let dx = b.x - a.x;
        let dz = b.z - a.z;
        let d = Math.hypot(dx, dz);
        if (d >= min) continue;
        if (d < 1e-4) {
          dx = rand(-1, 1);
          dz = rand(-1, 1);
          d = Math.hypot(dx, dz) || 1;
        }
        this.maybeBump(a, b, dx / d, dz / d);

        const push = (min - d) / (wa + wb);
        a.x -= (dx / d) * push * wa;
        a.z -= (dz / d) * push * wa;
        b.x += (dx / d) * push * wb;
        b.z += (dz / d) * push * wb;
      }
    }
  }

  /* ── bumping ── */

  private canBump(o: Agent) {
    return (
      o.id !== this.selectedId &&
      o.bumpCd <= 0 &&
      o.y < 0.3 &&
      (o.mode === "idle" ||
        o.mode === "wave" ||
        o.mode === "bob" ||
        o.mode === "walk" ||
        o.mode === "run" ||
        o.mode === "creep" ||
        o.mode === "flee")
    );
  }

  /**
   * Two bodies are overlapping. If one actually walked into the other (not just stood next to
   * it, and not a gentle brush) that is a bump. (nx, nz) is the unit vector from a to b.
   */
  private maybeBump(a: Agent, b: Agent, nx: number, nz: number) {
    if (!this.canBump(a) || !this.canBump(b)) return;
    // Walkers who were watching where they went only get pushed apart, as before. A bump needs
    // someone who wasn't paying attention (see CARELESS_CHANCE), so that is the only knob.
    const oblivious = (o: Agent) => o.careless && isMoving(o.mode);
    if (!oblivious(a) && !oblivious(b)) return;
    const aInto = a.wvx * nx + a.wvz * nz; // a's speed toward b
    const bInto = -(b.wvx * nx + b.wvz * nz); // b's speed toward a
    const closing = aInto + bInto;
    if (closing < BUMP_MIN_CLOSING) return;
    // Whoever is moving into the other harder is the one who bumped.
    if (aInto >= bInto) this.startBump(a, b, nx, nz, closing);
    else this.startBump(b, a, -nx, -nz, closing);
  }

  /** `p` walked into `v`; (dx, dz) points from p to v. */
  private startBump(p: Agent, v: Agent, dx: number, dz: number, closing: number) {
    const hard = closing > BUMP_HARD_CLOSING;

    for (const x of [p, v]) {
      x.mode = "bump";
      x.goal = null;
      x.emote = null;
      x.emoteT = 0;
      x.hop = 0;
      x.say = null;
      x.sayT = 0;
      x.steer = 0;
      x.reply = null;
      x.replyT = 0;
      x.bumpCd = BUMP_COOLDOWN;
    }
    p.faceId = v.id;
    v.faceId = p.id;

    // The victim is shoved away; the one who walked into them bounces back a little.
    const shove = Math.min(BUMP_SHOVE_BASE + closing * BUMP_SHOVE_GAIN, 4);
    v.vx += dx * shove;
    v.vz += dz * shove;
    p.vx -= dx * shove * 0.4;
    p.vz -= dz * shove * 0.4;

    const vEmote: BumpEmote = hard
      ? "stumble"
      : pickWeighted<BumpEmote>([["stumble", 3], ["startle", 2.5], ["angry", 2.5], ["laugh", 1.5]]);
    const pEmote: BumpEmote = hard
      ? pickWeighted<BumpEmote>([["stumble", 5], ["sorry", 4], ["startle", 1]])
      : pickWeighted<BumpEmote>([["sorry", 5.5], ["laugh", 1.5], ["startle", 1.5], ["angry", 1.5]]);
    v.emote = vEmote;
    p.emote = pEmote;

    // The victim reacts at once, the other follows a beat later, and an apology is often answered.
    if (Math.random() < 0.8) {
      v.say = pick(BUMP_LINES[vEmote]);
      v.sayT = 1.7;
    }
    if (pEmote === "sorry" || Math.random() < 0.85) {
      p.reply = pick(BUMP_LINES[pEmote]);
      p.replyT = 0.6;
    }
    let long = false;
    if (pEmote === "sorry" && Math.random() < 0.65) {
      v.reply = pick(vEmote === "angry" ? BUMP_GRUMBLE : BUMP_FORGIVE);
      v.replyT = 2.2;
      long = true;
    }
    p.timer = v.timer = long ? 3.6 : 2.2;
  }

  private clampToIsland(a: Agent) {
    a.x = clamp(a.x, -ARENA.halfW + EDGE, ARENA.halfW - EDGE);
    a.z = clamp(a.z, -ARENA.halfD + EDGE, ARENA.halfD - EDGE);
  }
}

/* ────────────────────────────────────────────────────────────────────────
 * Skins: loaded once, outside the canvas, into plain three textures.
 * ──────────────────────────────────────────────────────────────────────── */

interface SkinData {
  texture: THREE.CanvasTexture;
  model: ReturnType<typeof inferModelType>; // "default" | "slim"
}

function useSkins(members: Member[]) {
  const [skins, setSkins] = useState<Record<string, SkinData> | null>(null);

  useEffect(() => {
    let alive = true;
    Promise.all(
      members.map(async (m) => {
        try {
          const image = await loadImage(m.skin);
          const canvas = document.createElement("canvas");
          loadSkinToCanvas(canvas, image); // also upgrades legacy 64x32 skins
          const texture = new THREE.CanvasTexture(canvas);
          texture.magFilter = THREE.NearestFilter;
          texture.minFilter = THREE.NearestFilter;
          // skinview3d's own viewer turns colour management off; R3F keeps it on,
          // so the texture has to be tagged as sRGB or the skins look washed out.
          texture.colorSpace = THREE.SRGBColorSpace;
          return [m.id, { texture, model: inferModelType(canvas) }] as const;
        } catch (err) {
          console.warn(`TeamPlayground: could not load skin for "${m.id}"`, err);
          return null;
        }
      }),
    ).then((entries) => {
      if (!alive) return;
      setSkins(
        Object.fromEntries(entries.filter((e): e is NonNullable<typeof e> => e !== null)),
      );
    });
    return () => {
      alive = false;
    };
  }, [members]);

  return skins;
}

/* ────────────────────────────────────────────────────────────────────────
 * Procedural textures
 * ──────────────────────────────────────────────────────────────────────── */

function shadowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 64;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
  g.addColorStop(0, "rgba(0,0,0,0.5)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(canvas);
}

/* ────────────────────────────────────────────────────────────────────────
 * 3D scene
 * ──────────────────────────────────────────────────────────────────────── */

const GRID_VERT = /* glsl */ `
  varying vec2 vWorld;
  void main() {
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWorld = w.xz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

const GRID_FRAG = /* glsl */ `
  varying vec2 vWorld;
  uniform vec3 uColor;
  uniform float uFadeStart;
  uniform float uFadeEnd;

  // 1 on a line, 0 between lines, about one pixel wide at any distance.
  float gridLine(vec2 p, float scale, float widthPx) {
    vec2 c = p / scale;
    vec2 fw = fwidth(c);
    vec2 d = abs(fract(c - 0.5) - 0.5) / max(fw, 1e-4);
    float line = 1.0 - clamp(min(d.x, d.y) / widthPx, 0.0, 1.0);
    // Lines thinner than a pixel cell would shimmer far away; let them dissolve instead.
    float cell = max(fw.x, fw.y);
    return line * (1.0 - smoothstep(0.25, 0.5, cell));
  }

  void main() {
    float minor = gridLine(vWorld, 1.0, 1.0) * 0.28;
    float major = gridLine(vWorld, 4.0, 1.4) * 0.55;
    float line = max(minor, major);

    // Fade with distance from the middle of the play area.
    float dist = length(vWorld);
    float fade = 1.0 - smoothstep(uFadeStart, uFadeEnd, dist);

    float a = line * fade;
    if (a < 0.003) discard;
    gl_FragColor = vec4(uColor, a);
    #include <colorspace_fragment>
  }
`;

/** A grid on the ground that dissolves into the background with distance. */
function Floor() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: GRID_VERT,
        fragmentShader: GRID_FRAG,
        uniforms: {
          uColor: { value: new THREE.Color("#8E897E") },
          uFadeStart: { value: 7 },
          uFadeEnd: { value: 26 },
        },
        transparent: true,
        depthWrite: false,
      }),
    [],
  );
  useEffect(() => () => material.dispose(), [material]);

  return (
    <mesh rotation-x={-Math.PI / 2} material={material} raycast={noRaycast} renderOrder={0}>
      <planeGeometry args={[80, 80]} />
    </mesh>
  );
}

/** Keeps the whole play area in view whatever shape the container has. */
function CameraRig() {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  const size = useThree((s) => s.size);

  useLayoutEffect(() => {
    const aspect = size.width / Math.max(size.height, 1);
    const tanHalf = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const dist = Math.max(16, (ARENA.halfW + 1.4) / (tanHalf * aspect));
    camera.position.set(
      CAMERA_TARGET.x,
      CAMERA_TARGET.y + Math.sin(CAMERA_ELEVATION) * dist,
      CAMERA_TARGET.z + Math.cos(CAMERA_ELEVATION) * dist,
    );
    camera.lookAt(CAMERA_TARGET);
    camera.updateProjectionMatrix();
  }, [camera, size]);

  return null;
}

const noRaycast = () => {}; // keeps the blob shadow from being grabbable

/**
 * A fixed DOM container for the name tags and speech bubbles.
 *
 * drei's <Html> mounts into `events.connected || gl.domElement.parentNode`, and that value
 * changes while the canvas is starting up. Html reacts to a changed target by tearing down its
 * React root and building a new one on the same element, in the middle of a commit. React
 * defers the unmount, the race is lost, and one label (always the first) ends up as an empty
 * <div>. Giving every Html the same fixed `portal` means the target never changes.
 */
function useLabelPortal() {
  const gl = useThree((s) => s.gl);
  return useMemo(() => ({ current: gl.domElement.parentElement as HTMLElement }), [gl]);
}

/* Poses that aren't covered by skinview3d's built-in animations. */

function poseWave(p: PlayerObject, t: number) {
  p.skin.rightArm.rotation.x = Math.PI; // straight up
  p.skin.rightArm.rotation.z = -(0.25 + Math.sin(t * 11) * 0.4); // outward, swinging
}

/** Hands up, for jumping. */
function poseCheer(p: PlayerObject, t: number) {
  p.skin.leftArm.rotation.x = Math.PI * 0.8 + Math.sin(t * 14) * 0.15;
  p.skin.rightArm.rotation.x = Math.PI * 0.8 + Math.sin(t * 14 + 1) * 0.15;
  p.skin.leftArm.rotation.z = 0.35;
  p.skin.rightArm.rotation.z = -0.35;
}

/** A small gesturing arm while speaking. */
function poseTalk(p: PlayerObject, t: number) {
  p.skin.rightArm.rotation.x = -(0.55 + Math.sin(t * 6) * 0.3); // forward
  p.skin.rightArm.rotation.z = -0.15;
}

const smooth01 = (x: number) => {
  const k = clamp(x, 0, 1);
  return k * k * (3 - 2 * k);
};

/**
 * Right-hand punch. `t` is seconds since the emote started (see the PUNCH_* timeline):
 * the arm is drawn back, snaps forward to land at PUNCH_IMPACT, holds, then drops.
 */
function posePunch(p: PlayerObject, t: number) {
  let cock = 0; // 0..1: how far the arm is drawn back
  let reach = 0; // 0..1: how far it is thrown forward
  if (t < PUNCH_WINDUP) {
    cock = smooth01(t / PUNCH_WINDUP);
  } else if (t < PUNCH_IMPACT) {
    const k = (t - PUNCH_WINDUP) / (PUNCH_IMPACT - PUNCH_WINDUP);
    reach = 1 - (1 - k) * (1 - k); // ease-out: the jab snaps
    cock = 1 - reach;
  } else if (t < PUNCH_HOLD) {
    reach = 1;
  } else {
    reach = 1 - smooth01((t - PUNCH_HOLD) / (EMOTE_DUR.punch - PUNCH_HOLD));
  }
  const s = p.skin;
  s.rightArm.rotation.x = cock * 0.9 - reach * (Math.PI / 2); // negative = forward; -PI/2 = level
  s.rightArm.rotation.z = reach * 0.35; // angles the fist in toward the middle of the target
  s.leftArm.rotation.x = -0.4 * cock + 0.5 * reach; // guard hand counter-swings
  s.leftLeg.rotation.x = -0.4 * reach; // front foot steps in
  s.rightLeg.rotation.x = 0.3 * reach;
}

/** 0 → 1 within 0.1 s, then eases back to 0: the shape of a recoil. */
function hitEnvelope(t: number) {
  const rise = 0.1;
  return t < rise ? Math.sin(((t / rise) * Math.PI) / 2) : Math.exp(-(t - rise) * 4.5);
}

/** Limbs of someone who just got punched: arms fly out, feet back-pedal. */
function poseHit(p: PlayerObject, t: number) {
  const e = hitEnvelope(t);
  const s = p.skin;
  s.leftArm.rotation.x = -0.3 * e;
  s.rightArm.rotation.x = -0.3 * e;
  s.leftArm.rotation.z = 0.9 * e; // positive = outward on the left arm
  s.rightArm.rotation.z = -0.9 * e;
  s.leftLeg.rotation.x = 0.35 * e;
  s.rightLeg.rotation.x = -0.3 * e;
}

/* Reactions to a bump. For arms, rotation.x < 0 swings forward and -PI is straight up. */

/** Knocked off balance: arms fly out and the feet shuffle, settling as the recoil fades. */
function poseStumble(p: PlayerObject, t: number, clock: number) {
  const e = hitEnvelope(t);
  const s = p.skin;
  s.leftArm.rotation.x = -0.3 * e + Math.sin(clock * 18) * 0.2 * e;
  s.rightArm.rotation.x = -0.3 * e - Math.sin(clock * 18) * 0.2 * e;
  s.leftArm.rotation.z = 0.9 * e;
  s.rightArm.rotation.z = -0.9 * e;
  s.leftLeg.rotation.x = Math.sin(clock * 16) * 0.4 * e;
  s.rightLeg.rotation.x = -Math.sin(clock * 16) * 0.4 * e;
}

/** Hands thrown up in front of the chest. */
function poseStartle(p: PlayerObject) {
  const s = p.skin;
  s.leftArm.rotation.x = -Math.PI * 0.75;
  s.rightArm.rotation.x = -Math.PI * 0.75;
  s.leftArm.rotation.z = 0.45;
  s.rightArm.rotation.z = -0.45;
}

/** Shaking a fist, other hand on the hip. */
function poseAngry(p: PlayerObject, t: number) {
  const s = p.skin;
  s.rightArm.rotation.x = -Math.PI * 0.7 + Math.sin(t * 24) * 0.2;
  s.rightArm.rotation.z = -0.15;
  s.leftArm.rotation.x = -0.15;
  s.leftArm.rotation.z = 0.55;
}

/** Hands held together in front: the bow itself is done on the whole body (see Character). */
function poseSorry(p: PlayerObject) {
  const s = p.skin;
  s.leftArm.rotation.x = -1.1;
  s.rightArm.rotation.x = -1.1;
  s.leftArm.rotation.z = -0.3;
  s.rightArm.rotation.z = 0.3;
}

/** Arms held over the belly; the shaking and the hopping are done elsewhere. */
function poseLaugh(p: PlayerObject, t: number) {
  const s = p.skin;
  s.leftArm.rotation.x = -0.7 + Math.sin(t * 13) * 0.08;
  s.rightArm.rotation.x = -0.7 + Math.sin(t * 13 + 1) * 0.08;
  s.leftArm.rotation.z = -0.15;
  s.rightArm.rotation.z = 0.15;
}

function poseDangle(p: PlayerObject, t: number) {
  p.skin.leftLeg.rotation.x = Math.sin(t * 7) * 0.35;
  p.skin.rightLeg.rotation.x = Math.sin(t * 7 + Math.PI) * 0.35;
  p.skin.leftArm.rotation.z = 0.5 + Math.sin(t * 9) * 0.25; // positive = outward on the left arm
  p.skin.rightArm.rotation.z = -(0.5 + Math.sin(t * 9 + 1) * 0.25);
}

function poseFlail(p: PlayerObject, t: number) {
  p.skin.leftArm.rotation.x = Math.PI * 0.85 + Math.sin(t * 16) * 0.3;
  p.skin.rightArm.rotation.x = Math.PI * 0.85 + Math.sin(t * 16 + 1.5) * 0.3;
  p.skin.leftArm.rotation.z = 0.3;
  p.skin.rightArm.rotation.z = -0.3;
  p.skin.leftLeg.rotation.x = Math.sin(t * 14) * 0.6;
  p.skin.rightLeg.rotation.x = Math.sin(t * 14 + Math.PI) * 0.6;
}

/**
 * Minecraft's sneak: the upper body leans forward around the hips and sinks a little.
 * The parts are siblings in skinview3d's rig, so each one is moved along the arc by hand.
 * Joint pivots (model pixels, y up): hips at -12, body centre -6, shoulders -2, neck 0.
 */
function applyCrouch(p: PlayerObject, c: number) {
  if (c < 0.001) return;
  // Like Minecraft, the whole model shifts back while sneaking (local -Z is backward), which
  // keeps the leaning heads of two sneakers facing each other from clipping together.
  p.position.z -= SNEAK_SHIFT * c;
  const lean = 0.5 * c;
  const drop = 3 * c;
  const cos = Math.cos(lean);
  const sin = Math.sin(lean);
  const place = (part: { position: { y: number; z: number } }, above: number) => {
    part.position.y = -12 + above * cos - drop; // `above` = distance of its pivot over the hips
    part.position.z = above * sin;
  };
  const s = p.skin;
  place(s.body, 6);
  s.body.rotation.x = lean;
  place(s.head, 12);
  place(s.leftArm, 10);
  place(s.rightArm, 10);
  s.leftArm.rotation.x += lean * 0.85;
  s.rightArm.rotation.x += lean * 0.85;
}

interface CharacterProps {
  agent: Agent;
  member: Member;
  skin: SkinData;
  selected: boolean;
  shadowTex: THREE.Texture;
  onGrab: (agent: Agent, e: ThreeEvent<PointerEvent>) => void;
  onHover: (over: boolean) => void;
}

function Character({ agent, member, skin, selected, shadowTex, onGrab, onHover }: CharacterProps) {
  const outer = useRef<THREE.Group>(null);
  const pivot = useRef<THREE.Group>(null);
  const shadow = useRef<THREE.Mesh>(null);
  const clock = useRef(Math.random() * 10);
  const tilt = useRef(0);
  const [bubble, setBubble] = useState<string | null>(null);
  const shownBubble = useRef<string | null>(null);
  const labelPortal = useLabelPortal();

  // Pitch (the hit recoil) has to be relative to the way the character faces, so yaw goes first.
  useLayoutEffect(() => {
    if (pivot.current) pivot.current.rotation.order = "YXZ";
  }, []);

  const rig = useMemo(() => {
    const player = new PlayerObject();
    player.skin.map = skin.texture;
    player.skin.modelType = skin.model;
    player.cape.visible = false;
    player.elytra.visible = false;
    player.ears.visible = false;

    // Measure where the soles really are instead of trusting a constant. The bottom of the
    // skin (outer layers included) is put exactly on the ground.
    player.resetJoints();
    player.updateMatrixWorld(true);
    const feetOffset = -new THREE.Box3().setFromObject(player.skin).min.y;

    return {
      player,
      feetOffset,
      idle: new IdleAnimation(),
      walk: Object.assign(new WalkingAnimation(), { speed: 1, headBobbing: false }),
      run: Object.assign(new RunningAnimation(), { speed: 0.6 }), // slower legs = less foot sliding at RUN_SPEED
    };
  }, [skin]);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const a = agent;
    const { player, idle, walk, run } = rig;
    clock.current += dt;
    const t = clock.current;

    const lift = a.y + a.hop;
    outer.current?.position.set(a.x, lift, a.z);

    const airborne = a.mode === "grabbed" || a.mode === "air";
    const tiltTarget = airborne ? clamp(-a.vx * 0.035, -0.22, 0.22) : 0;
    tilt.current += (tiltTarget - tilt.current) * (1 - Math.exp(-10 * dt));
    // 0..1 recoil strength. A stumble from a bump is a softer version of a punch's hit.
    const recoil = a.emote === "hit" ? 1 : a.emote === "stumble" ? BUMP_LEAN_SCALE : 0;
    const hit = recoil * hitEnvelope(a.emoteT);
    // An apology bows forward and comes back up.
    const bow = a.emote === "sorry" ? Math.sin(Math.PI * smooth01(a.emoteT / EMOTE_DUR.sorry)) : 0;
    // Laughter fades in and out, and shakes the body.
    const giggle =
      a.emote === "laugh"
        ? Math.min(1, a.emoteT * 6) * Math.min(1, (EMOTE_DUR.laugh - a.emoteT) * 4)
        : 0;
    if (pivot.current) {
      pivot.current.rotation.y = a.heading;
      // negative tips backward, positive forward, pivoting at the feet
      pivot.current.rotation.x = -HIT_LEAN * hit + BOW_LEAN * bow;
      pivot.current.rotation.z = tilt.current + Math.sin(t * 26) * 0.04 * giggle;
    }

    // The built-in animations only set the joints they care about, so start clean.
    player.resetJoints();
    player.position.set(0, 0, 0);
    player.rotation.set(0, 0, 0);

    // Legs only move when the character really covers ground, and at a matching pace.
    const moving = a.speed > 0.25;

    switch (a.mode) {
      case "walk":
      case "creep":
        if (moving) {
          walk.speed = clamp(a.speed / WALK_SPEED, 0.4, 1.4);
          walk.update(player, dt);
        } else {
          idle.update(player, dt);
        }
        break;
      case "run":
      case "flee":
        if (moving) {
          run.speed = 0.6 * clamp(a.speed / RUN_SPEED, 0.4, 1.4);
          run.update(player, dt);
          player.position.y = (player.position.y + 1) * 0.5; // the stock bob dips below the floor
        } else {
          idle.update(player, dt);
        }
        break;
      case "wave":
        idle.update(player, dt);
        poseWave(player, t);
        break;
      case "talk":
        idle.update(player, dt);
        if (a.emote === "wave") poseWave(player, t);
        else if (a.emote === "jump") poseCheer(player, t);
        else if (a.emote === "punch") posePunch(player, a.emoteT);
        else if (a.emote === "hit") poseHit(player, a.emoteT);
        else if (a.say) poseTalk(player, t);
        break;
      case "bump":
        idle.update(player, dt);
        if (a.emote === "stumble") poseStumble(player, a.emoteT, t);
        else if (a.emote === "startle") poseStartle(player);
        else if (a.emote === "angry") poseAngry(player, t);
        else if (a.emote === "sorry") poseSorry(player);
        else if (a.emote === "laugh") poseLaugh(player, t);
        break;
      case "grabbed":
        poseDangle(player, t);
        break;
      case "air":
        poseFlail(player, t);
        break;
      default:
        idle.update(player, dt); // idle, bob, watch
    }

    // The head has its own direction, independent of the body (within MAX_HEAD_YAW).
    const limit = MAX_HEAD_YAW * 1.1;
    player.skin.head.rotation.y = clamp(wrapAngle(a.gaze - a.heading), -limit, limit);
    player.skin.head.rotation.x =
      -a.gazePitch -
      HIT_HEAD_SNAP * hit + // negative = looking up
      0.3 * bow - // looks down while bowing
      0.35 * giggle * (0.5 + 0.5 * Math.sin(t * 13)); // throws the head back laughing

    applyCrouch(player, a.crouch);

    if (shadow.current) {
      shadow.current.position.y = -lift + 0.015; // stays on the floor while the body rises
      shadow.current.scale.setScalar(1 / (1 + 0.35 * lift));
    }

    if (a.say !== shownBubble.current) {
      shownBubble.current = a.say;
      setBubble(a.say);
    }
  });

  return (
    <group
      ref={outer}
      onPointerDown={(e) => onGrab(agent, e)}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(true);
      }}
      onPointerOut={() => onHover(false)}
    >
      <mesh ref={shadow} rotation-x={-Math.PI / 2} raycast={noRaycast} renderOrder={1}>
        <planeGeometry args={[1.6, 1.6]} />
        <meshBasicMaterial map={shadowTex} transparent depthWrite={false} />
      </mesh>

      <group ref={pivot}>
        <group scale={MODEL_SCALE}>
          <group position-y={rig.feetOffset}>
            <primitive object={rig.player} />
          </group>
        </group>
      </group>

      <Html
        position={[0, 2.5, 0]}
        center
        zIndexRange={[20, 0]}
        pointerEvents="none"
        portal={labelPortal}
      >
        <div
          className={`font-minecraft whitespace-nowrap select-none rounded-sm px-1.5 py-0.5 text-[0.6rem] ${
            selected ? "text-accent bg-black/65" : "text-white/80 bg-black/35"
          }`}
        >
          {member.name}
        </div>
      </Html>

      {bubble && (
        <Html
          position={[0, 2.85, 0]}
          zIndexRange={[40, 30]}
          pointerEvents="none"
          portal={labelPortal}
        >
          <div
            className="font-minecraft select-none rounded-md bg-background px-2.5 py-1.5 text-center text-xs leading-snug text-white ring-1 ring-white/15 transition duration-150 starting:scale-90 starting:opacity-0"
            style={{ transform: "translate(-50%, -100%)", width: "max-content", maxWidth: 210 }}
          >
            {bubble}
          </div>
        </Html>
      )}
    </group>
  );
}

interface DragState {
  agent: Agent;
  pointerId: number;
  startX: number;
  startY: number;
  startT: number;
  grabbing: boolean;
  offsetX: number; // feet position minus the clicked point, so nothing jumps
  offsetZ: number;
  bodyY: number; // height of the clicked point above the character's feet
}

interface SceneProps {
  members: Member[];
  skins: Record<string, SkinData>;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

function Scene({ members, skins, selectedId, onSelect }: SceneProps) {
  const gl = useThree((s) => s.gl);
  const camera = useThree((s) => s.camera);

  const sim = useMemo(
    () =>
      new Sim(
        members.map((m) => m.id),
        Object.fromEntries(members.map((m) => [m.id, m.name])),
      ),
    [members],
  );
  const shadowTex = useMemo(shadowTexture, []);

  useEffect(() => {
    sim.selectedId = selectedId;
  }, [sim, selectedId]);

  // skinview3d ships its own three.js unless the bundler dedupes it. Two copies make the
  // renderer crash on every frame, so say so clearly instead.
  useEffect(() => {
    if (!(new PlayerObject() instanceof THREE.Object3D)) {
      console.error(
        "TeamPlayground: skinview3d is using a different copy of three.js than the renderer. " +
          'Add `vite: { resolve: { dedupe: ["three"] } }` to astro.config.mjs and clear node_modules/.vite.',
      );
    }
  }, []);

  useFrame((_, dt) => {
    sim.viewerX = camera.position.x;
    sim.viewerY = camera.position.y;
    sim.viewerZ = camera.position.z;
    sim.update(Math.min(dt, 1 / 20));
  });

  /* ── dragging ── */

  const drag = useRef<DragState | null>(null);
  const stopDrag = useRef<(() => void) | null>(null);

  useEffect(() => () => stopDrag.current?.(), []);

  const setCursor = useCallback(
    (c: string) => {
      gl.domElement.style.cursor = c;
    },
    [gl],
  );

  const onHover = useCallback(
    (over: boolean) => {
      if (drag.current?.grabbing) return;
      setCursor(over ? "grab" : "");
    },
    [setCursor],
  );

  const onGrab = useCallback(
    (agent: Agent, e: ThreeEvent<PointerEvent>) => {
      if (drag.current) return;
      e.stopPropagation();
      const ev = e.nativeEvent;

      const d: DragState = {
        agent,
        pointerId: ev.pointerId,
        startX: ev.clientX,
        startY: ev.clientY,
        startT: performance.now(),
        grabbing: false,
        offsetX: agent.x - e.point.x,
        offsetZ: agent.z - e.point.z,
        bodyY: e.point.y - agent.y,
      };
      drag.current = d;

      const ray = new THREE.Raycaster();
      const ndc = new THREE.Vector2();
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const hit = new THREE.Vector3();

      const move = (m: PointerEvent) => {
        if (m.pointerId !== d.pointerId) return;
        if (!d.grabbing) {
          if (Math.hypot(m.clientX - d.startX, m.clientY - d.startY) < DRAG_THRESHOLD_PX) return;
          if (!sim.tryGrab(agent)) {
            // Wriggled free and ran off. Nothing left to drag.
            cleanup();
            setCursor("");
            return;
          }
          d.grabbing = true;
          setCursor("grabbing");
        }
        // Where does the pointer's ray cross the height at which the clicked body point will hang?
        const rect = gl.domElement.getBoundingClientRect();
        ndc.set(
          ((m.clientX - rect.left) / rect.width) * 2 - 1,
          -((m.clientY - rect.top) / rect.height) * 2 + 1,
        );
        ray.setFromCamera(ndc, camera);
        plane.constant = -(LIFT + d.bodyY);
        if (ray.ray.intersectPlane(plane, hit)) {
          sim.moveGrab(agent, hit.x + d.offsetX, hit.z + d.offsetZ);
        }
      };

      const end = (u: PointerEvent) => {
        if (u.pointerId !== d.pointerId) return;
        cleanup();
        if (d.grabbing) {
          sim.endGrab(agent);
          setCursor("");
        } else if (performance.now() - d.startT < CLICK_MAX_MS) {
          onSelect(agent.id);
        }
      };

      const cleanup = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", end);
        window.removeEventListener("pointercancel", end);
        drag.current = null;
        stopDrag.current = null;
      };

      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", end);
      window.addEventListener("pointercancel", end);
      stopDrag.current = cleanup;
    },
    [sim, gl, camera, setCursor, onSelect],
  );

  return (
    <>
      <CameraRig />
      {/* three r155+ lights are not pre-multiplied by PI: ~PI total gives "albedo as authored" */}
      <ambientLight intensity={2} />
      <directionalLight position={[-5, 10, 8]} intensity={1.7} />
      <Floor />
      {members.map((m) => (
        <Character
          key={m.id}
          agent={sim.byId.get(m.id)!}
          member={m}
          skin={skins[m.id]}
          selected={m.id === selectedId}
          shadowTex={shadowTex}
          onGrab={onGrab}
          onHover={onHover}
        />
      ))}
    </>
  );
}

/* ────────────────────────────────────────────────────────────────────────
 * HTML around the canvas
 * ──────────────────────────────────────────────────────────────────────── */

function MemberPopup({ member, onClose }: { member: Member; onClose: () => void }) {
  const avatarRef = useRef<HTMLCanvasElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => closeRef.current?.focus(), [member.id]);

  // The 8x8 face (plus hat layer) cut out of the skin PNG.
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const canvas = avatarRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 8, 8, 8, 8, 0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 40, 8, 8, 8, 0, 0, canvas.width, canvas.height);
    };
    img.src = member.skin;
  }, [member.skin]);

  return (
    <div
      role="dialog"
      aria-labelledby="team-card-title"
      style={{
        position: "absolute",
        top: 16,
        right: 16,
        width: 340,
        maxWidth: "calc(100% - 32px)",
        maxHeight: "calc(100% - 32px)",
        display: "flex",
        flexDirection: "column",
        background: "rgba(0, 0, 0, 0.20)",
        border: "1px solid rgba(255,255,255,0.12)",
        backdropFilter: "blur(32px)",
        WebkitBackdropFilter: "blur(32px)",
        borderRadius: "16px",
        padding: "24px",
        boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
        zIndex: 100,
        color: "#e0e0f0",
        animation: "popIn 0.2s ease",
        pointerEvents: "auto",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
        .team-popup-bio p { margin: 0 0 0.6em; }
        .team-popup-bio p:last-child { margin-bottom: 0; }
        .team-popup-bio a { color: inherit; text-decoration: underline; }
      `}</style>

      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        style={{
          position: "absolute",
          top: 12,
          right: 14,
          background: "none",
          border: "none",
          color: "rgba(255,255,255,0.4)",
          fontSize: "20px",
          cursor: "pointer",
          lineHeight: 1,
        }}
        aria-label="Schließen"
      >
        ×
      </button>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          marginBottom: "16px",
          flexShrink: 0,
        }}
      >
        <canvas
          ref={avatarRef}
          width={64}
          height={64}
          aria-hidden
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            border: "2px solid rgba(255,255,255,0.15)",
            flexShrink: 0,
            imageRendering: "pixelated",
          }}
        />
        <div>
          <div id="team-card-title" style={{ fontWeight: 700, fontSize: "16px" }}>
            {member.name}
          </div>
          {member.role && (
            <div
              style={{
                color: "rgba(255,255,255,0.45)",
                fontSize: "13px",
                marginTop: 2,
              }}
            >
              {member.role}
            </div>
          )}
        </div>
      </div>

      {member.description && (
        <div
          className="team-popup-bio"
          style={{
            fontSize: "14px",
            lineHeight: "1.6",
            color: "rgba(255,255,255,0.7)",
            maxHeight: "320px",
            minHeight: 0,
            overflowY: "auto",
          }}
          // Trusted content from the team collection, rendered as HTML on purpose.
          dangerouslySetInnerHTML={{ __html: member.description }}
        />
      )}
    </div>
  );
}

export default function TeamPlayground({ members }: { members: Member[] }) {
  const [mounted, setMounted] = useState(false); // keeps three.js off the server render
  const [inView, setInView] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const skins = useSkins(members);

  useEffect(() => setMounted(true), []);

  // Stop rendering while scrolled out of view.
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSelectedId(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const ready = useMemo(
    () => (skins ? members.filter((m) => skins[m.id]) : []),
    [members, skins],
  );
  const selected = members.find((m) => m.id === selectedId) ?? null;

  return (
    <section className="mx-auto max-w-6xl px-4">
      <div
        ref={box}
        className="relative h-115 overflow-hidden rounded-xl bg-background-10 md:h-135"
      >
        {mounted && skins && (
          <Canvas
            flat
            dpr={[1, 2]}
            frameloop={inView ? "always" : "never"}
            camera={{ fov: 30, near: 0.1, far: 120 }}
            onPointerMissed={() => setSelectedId(null)}
          >
            <Scene members={ready} skins={skins} selectedId={selectedId} onSelect={setSelectedId} />
          </Canvas>
        )}
        {selected && <MemberPopup member={selected} onClose={() => setSelectedId(null)} />}
      </div>
      <p className="mt-3 text-center text-sm text-text-50">
        Zieh die Teammitglieder herum oder klick sie an, um mehr zu erfahren.
      </p>
    </section>
  );
}