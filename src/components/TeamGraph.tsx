import React, { useEffect, useRef, useState, useCallback } from "react";

export interface TeamMemberData {
  id: string;
  name: string;
  role?: string;
  bio?: string;
  image: string;
  teams: string[];
}

export interface TeamData {
  id: string;
  label: string;
  color: string;
}

export interface GraphData {
  orgName: string;
  orgLogo: string;
  teams: TeamData[];
  members: TeamMemberData[];
}

const ORG_RADIUS = 52;
const TEAM_RADIUS = 36;
const MEMBER_RADIUS = 28;
const DAMPING = 0.82;
const SPRING_STRENGTH = 0.018;
const REPULSION = 18000;
const MIN_ZOOM = 0.3;
const MAX_ZOOM = 2.5;
const TARGET_LINK_LEN_ORG_TEAM = 300;
const TARGET_LINK_LEN_TEAM_MEMBER = 150;
const WORLD_HALF = 1800;
const MIN_GAP = 50;
const DRAG_THRESHOLD = 6;

type NodeKind = "org" | "team" | "member";

interface PhysicsNode {
  id: string;
  kind: NodeKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  data: TeamData | TeamMemberData | null;
  visible: boolean;
  opacity: number;
}

interface Edge {
  source: string;
  target: string;
  targetLength: number;
}

function uid() {
  return Math.random().toString(36).slice(2);
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

interface TeamGraphProps {
  data?: GraphData;
  logoSrc?: string;
}

export default function TeamGraph({ data, logoSrc }: TeamGraphProps) {
  if (data == undefined) {
    console.error("No Team data.");
    return;
  }

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const cameraRef = useRef({ x: 0, y: 0, zoom: 1 });

  const nodesRef = useRef<Map<string, PhysicsNode>>(new Map());
  const edgesRef = useRef<Edge[]>([]);
  const hiddenTeamsRef = useRef<Set<string>>(new Set());

  const imgCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const orgLogoRef = useRef<HTMLImageElement | null>(null);

  const dragRef = useRef<{
    nodeId: string | null;
    panActive: boolean;
    lastX: number;
    lastY: number;
    startX: number;
    startY: number;
    moved: boolean;
    downNodeId: string | null;
  }>({
    nodeId: null,
    panActive: false,
    lastX: 0,
    lastY: 0,
    startX: 0,
    startY: 0,
    moved: false,
    downNodeId: null,
  });
  const pinchRef = useRef<{ active: boolean; lastDist: number }>({
    active: false,
    lastDist: 0,
  });
  const rafRef = useRef<number>(0);

  const [selectedMember, setSelectedMember] = useState<TeamMemberData | null>(
    null,
  );
  const popupRef = useRef<HTMLDivElement>(null);
  const selectedMemberIdRef = useRef<string | null>(null);

  const loadImage = useCallback((src: string): Promise<HTMLImageElement> => {
    if (imgCacheRef.current.has(src))
      return Promise.resolve(imgCacheRef.current.get(src)!);
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        imgCacheRef.current.set(src, img);
        resolve(img);
      };
      img.onerror = () => resolve(img);
      img.src = src;
    });
  }, []);

  const buildGraph = useCallback(() => {
    const nodes = new Map<string, PhysicsNode>();
    const edges: Edge[] = [];

    nodes.set("org", {
      id: "org",
      kind: "org",
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      radius: ORG_RADIUS,
      data: null,
      visible: true,
      opacity: 1,
    });

    data.teams.forEach((team, i) => {
      const angle = (i / data.teams.length) * Math.PI * 2;
      nodes.set(team.id, {
        id: team.id,
        kind: "team",
        x: Math.cos(angle) * 220,
        y: Math.sin(angle) * 220,
        vx: 0,
        vy: 0,
        radius: TEAM_RADIUS,
        data: team,
        visible: true,
        opacity: 1,
      });
      edges.push({
        source: "org",
        target: team.id,
        targetLength: TARGET_LINK_LEN_ORG_TEAM,
      });
    });

    data.members.forEach((member, i) => {
      const angle = (i / data.members.length) * Math.PI * 2;
      nodes.set(member.id, {
        id: member.id,
        kind: "member",
        x: Math.cos(angle) * 400,
        y: Math.sin(angle) * 400,
        vx: 0,
        vy: 0,
        radius: MEMBER_RADIUS,
        data: member,
        visible: true,
        opacity: 1,
      });
      member.teams.forEach((teamId) => {
        edges.push({
          source: teamId,
          target: member.id,
          targetLength: TARGET_LINK_LEN_TEAM_MEMBER,
        });
      });

      if (member.image) loadImage(member.image);
    });

    nodesRef.current = nodes;
    edgesRef.current = edges;
  }, [data, loadImage]);

  const recomputeVisibility = useCallback(() => {
    const hidden = hiddenTeamsRef.current;
    const nodes = nodesRef.current;

    data.members.forEach((member) => {
      const hasVisibleTeam = member.teams.some((tid) => !hidden.has(tid));
      const node = nodes.get(member.id);
      if (node) node.visible = hasVisibleTeam;
    });
  }, [data]);

  const tick = useCallback(() => {
    const nodes = nodesRef.current;
    const edges = edgesRef.current;

    const nodeArr = Array.from(nodes.values());

    edges.forEach(({ source, target, targetLength }) => {
      const a = nodes.get(source);
      const b = nodes.get(target);
      if (!a || !b || !a.visible || !b.visible) return;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      if (dist > targetLength) {
        const force = (dist - targetLength) * SPRING_STRENGTH;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        if (a.kind !== "org") {
          a.vx += fx;
          a.vy += fy;
        }
        if (b.kind !== "org") {
          b.vx -= fx;
          b.vy -= fy;
        }
      }
    });

    for (let i = 0; i < nodeArr.length; i++) {
      for (let j = i + 1; j < nodeArr.length; j++) {
        const a = nodeArr[i];
        const b = nodeArr[j];
        if (!a.visible || !b.visible) continue;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
        const minDist = a.radius + b.radius + MIN_GAP;

        if (dist < minDist) {
          const overlap = minDist - dist;
          const nx = dx / dist;
          const ny = dy / dist;
          const half = overlap * 0.5;
          if (a.kind !== "org") {
            a.x -= nx * half;
            a.y -= ny * half;
            a.vx -= nx * half * 0.5;
            a.vy -= ny * half * 0.5;
          }
          if (b.kind !== "org") {
            b.x += nx * half;
            b.y += ny * half;
            b.vx += nx * half * 0.5;
            b.vy += ny * half * 0.5;
          }
        } else {
          const distSq = dist * dist;
          const force = REPULSION / distSq;
          const nx = dx / dist;
          const ny = dy / dist;
          if (a.kind !== "org") {
            a.vx -= nx * force;
            a.vy -= ny * force;
          }
          if (b.kind !== "org") {
            b.vx += nx * force;
            b.vy += ny * force;
          }
        }
      }
    }

    nodeArr.forEach((node) => {
      if (node.kind === "org" || dragRef.current.nodeId === node.id) return;
      node.vx *= DAMPING;
      node.vy *= DAMPING;
      node.x += node.vx;
      node.y += node.vy;

      node.x = clamp(
        node.x,
        -WORLD_HALF + node.radius,
        WORLD_HALF - node.radius,
      );
      node.y = clamp(
        node.y,
        -WORLD_HALF + node.radius,
        WORLD_HALF - node.radius,
      );
    });

    nodeArr.forEach((node) => {
      const target = node.visible ? 1 : 0;
      node.opacity += (target - node.opacity) * 0.08;
    });
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const { x: cx, y: cy, zoom } = cameraRef.current;
    const W = canvas.width;
    const H = canvas.height;

    ctx.clearRect(0, 0, W, H);
    ctx.save();
    ctx.translate(W / 2 + cx, H / 2 + cy);
    ctx.scale(zoom, zoom);

    const nodes = nodesRef.current;
    const edges = edgesRef.current;

    edges.forEach(({ source, target }) => {
      const a = nodes.get(source);
      const b = nodes.get(target);
      if (!a || !b) return;
      const opacity = Math.min(a.opacity, b.opacity);
      if (opacity < 0.01) return;

      const teamNode = a.kind === "team" ? a : b.kind === "team" ? b : null;
      const teamData = teamNode?.data as TeamData | null;
      const color = teamData?.color ?? "#ffffff";

      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = hexToRgba(color, 0.25 * opacity);
      ctx.lineWidth = 1.5 / zoom;
      ctx.stroke();
    });

    Array.from(nodes.values()).forEach((node) => {
      if (node.opacity < 0.01) return;
      ctx.globalAlpha = node.opacity;

      if (node.kind === "org") {
        drawOrgNode(ctx, node, orgLogoRef.current);
      } else if (node.kind === "team") {
        drawTeamNode(
          ctx,
          node as PhysicsNode & { data: TeamData },
          hiddenTeamsRef.current.has(node.id),
        );
      } else {
        const img =
          imgCacheRef.current.get((node.data as TeamMemberData).image) ?? null;
        drawMemberNode(ctx, node, img);
      }

      ctx.globalAlpha = 1;
    });

    ctx.restore();

    if (selectedMemberIdRef.current) {
      const node = nodes.get(selectedMemberIdRef.current);
      if (node) {
        const POPUP_W = 340;
        const POPUP_H = 320;
        const MARGIN = 12;
        const sx = W / 2 + cx + node.x * zoom;
        const sy = H / 2 + cy + node.y * zoom;

        const offsetY = -(node.radius * zoom + POPUP_H / 2 + 16);
        let px = sx - POPUP_W / 2;
        let py = sy + offsetY;

        px = clamp(px, MARGIN, W - POPUP_W - MARGIN);
        py = clamp(py, MARGIN, H - POPUP_H - MARGIN);
        if (popupRef.current) {
          popupRef.current.style.left = `${px}px`;
          popupRef.current.style.top = `${py}px`;
        }
      }
    }
  }, []);

  function drawOrgNode(
    ctx: CanvasRenderingContext2D,
    node: PhysicsNode,
    logo: HTMLImageElement | null,
  ) {
    const r = node.radius;

    const glow = ctx.createRadialGradient(
      node.x,
      node.y,
      r * 0.4,
      node.x,
      node.y,
      r * 1.8,
    );
    glow.addColorStop(0, "rgb(214, 144, 79, 0.18)");
    glow.addColorStop(1, "rgb(214, 144, 79, 0)");
    ctx.beginPath();
    ctx.arc(node.x, node.y, r * 1.8, 0, Math.PI * 2);
    ctx.fillStyle = glow;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
    ctx.fillStyle = "#3E3933";
    ctx.fill();
    ctx.strokeStyle = "#d6904f";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    if (logo && logo.complete && logo.naturalWidth > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(node.x, node.y, r - 4, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(
        logo,
        node.x - r + 4,
        node.y - r + 4,
        (r - 4) * 2,
        (r - 4) * 2,
      );
      ctx.restore();
    } else {
      ctx.fillStyle = "#d6904f";
      ctx.font = `bold ${r * 0.32}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Baggel", node.x, node.y);
    }
  }

  function drawTeamNode(
    ctx: CanvasRenderingContext2D,
    node: PhysicsNode & { data: TeamData },
    hidden: boolean,
  ) {
    const r = node.radius;
    const color = (node.data as TeamData).color;
    const label = (node.data as TeamData).label;

    const w = r * 4.8;
    const h = r * 1.5;
    const rx = h / 2;
    const x = node.x - w / 2;
    const y = node.y - h / 2;

    ctx.beginPath();
    roundRect(ctx, x, y, w, h, rx);
    ctx.fillStyle = hidden ? "#1e1e2e" : hexToRgba(color, 0.15);
    ctx.fill();
    ctx.strokeStyle = hidden ? "rgba(255,255,255,0.2)" : color;
    ctx.lineWidth = hidden ? 1.5 : 2;
    ctx.stroke();

    ctx.fillStyle = hidden ? "rgba(255,255,255,0.35)" : color;
    ctx.font = `${hidden ? "normal" : "bold"} ${r * 0.42}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, node.x, node.y);
  }

  function drawMemberNode(
    ctx: CanvasRenderingContext2D,
    node: PhysicsNode,
    img: HTMLImageElement | null,
  ) {
    const r = node.radius;
    const member = node.data as TeamMemberData;

    ctx.shadowColor = "rgba(0,0,0,0.4)";
    ctx.shadowBlur = 10;

    ctx.beginPath();
    ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
    ctx.fillStyle = "#2a2a3e";
    ctx.fill();

    ctx.shadowBlur = 0;

    if (img && img.complete && img.naturalWidth > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(node.x, node.y, r - 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(
        img,
        node.x - r + 2,
        node.y - r + 2,
        (r - 2) * 2,
        (r - 2) * 2,
      );
      ctx.restore();
    } else {
      ctx.fillStyle = "#aaaacc";
      ctx.font = `bold ${r * 0.5}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const initials = member.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2);
      ctx.fillText(initials, node.x, node.y);
    }

    ctx.beginPath();
    ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.font = `${r * 0.38}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(member.name.split(" ")[0], node.x, node.y + r + 4);
  }

  const loop = useCallback(() => {
    tick();
    draw();
    rafRef.current = requestAnimationFrame(loop);
  }, [tick, draw]);

  const canvasToWorld = useCallback((cx: number, cy: number) => {
    const canvas = canvasRef.current!;
    const cam = cameraRef.current;
    return {
      x: (cx - canvas.width / 2 - cam.x) / cam.zoom,
      y: (cy - canvas.height / 2 - cam.y) / cam.zoom,
    };
  }, []);

  const hitTest = useCallback((wx: number, wy: number): PhysicsNode | null => {
    let best: PhysicsNode | null = null;
    let bestDist = Infinity;
    nodesRef.current.forEach((node) => {
      if (!node.visible || node.opacity < 0.3) return;
      const dx = node.x - wx;
      const dy = node.y - wy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < node.radius + 8 && dist < bestDist) {
        best = node;
        bestDist = dist;
      }
    });
    return best;
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      const rect = canvasRef.current!.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const world = canvasToWorld(px, py);
      const hit = hitTest(world.x, world.y);

      dragRef.current.startX = e.clientX;
      dragRef.current.startY = e.clientY;
      dragRef.current.lastX = e.clientX;
      dragRef.current.lastY = e.clientY;
      dragRef.current.moved = false;
      dragRef.current.downNodeId = hit?.id ?? null;

      if (hit && hit.kind !== "org") {
        dragRef.current.nodeId = hit.id;
      } else {
        dragRef.current.panActive = true;
      }
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    [canvasToWorld, hitTest],
  );

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const dx = e.clientX - dragRef.current.lastX;
    const dy = e.clientY - dragRef.current.lastY;
    dragRef.current.lastX = e.clientX;
    dragRef.current.lastY = e.clientY;

    if (!dragRef.current.moved) {
      const totalDx = e.clientX - dragRef.current.startX;
      const totalDy = e.clientY - dragRef.current.startY;
      if (Math.sqrt(totalDx * totalDx + totalDy * totalDy) > DRAG_THRESHOLD) {
        dragRef.current.moved = true;
      }
    }

    if (!dragRef.current.moved) return;

    if (dragRef.current.nodeId) {
      const node = nodesRef.current.get(dragRef.current.nodeId);
      if (node) {
        const zoom = cameraRef.current.zoom;
        const newX = node.x + dx / zoom;
        const newY = node.y + dy / zoom;
        node.x = clamp(
          newX,
          -WORLD_HALF + node.radius,
          WORLD_HALF - node.radius,
        );
        node.y = clamp(
          newY,
          -WORLD_HALF + node.radius,
          WORLD_HALF - node.radius,
        );
        node.vx = 0;
        node.vy = 0;
      }
    } else if (dragRef.current.panActive) {
      const cam = cameraRef.current;
      const canvas = canvasRef.current!;
      const maxPan = WORLD_HALF * cam.zoom;
      cam.x = clamp(cam.x + dx, -maxPan, maxPan);
      cam.y = clamp(cam.y + dy, -maxPan, maxPan);
    }
  }, []);

  const handlePointerUp = useCallback(() => {
    const { moved, downNodeId } = dragRef.current;
    dragRef.current.nodeId = null;
    dragRef.current.panActive = false;
    dragRef.current.downNodeId = null;

    if (!moved && downNodeId) {
      const node = nodesRef.current.get(downNodeId);
      if (node) handleNodeClick(node);
    }
  }, []);

  function handleNodeClick(node: PhysicsNode) {
    if (node.kind === "team") {
      const teamId = node.id;
      const hidden = hiddenTeamsRef.current;
      if (hidden.has(teamId)) {
        hidden.delete(teamId);
      } else {
        hidden.add(teamId);
      }
      recomputeVisibility();
    } else if (node.kind === "member") {
      const memberData = node.data as TeamMemberData;
      setSelectedMember((prev) => {
        if (prev?.id === memberData.id) {
          selectedMemberIdRef.current = null;
          return null;
        }
        selectedMemberIdRef.current = memberData.id;
        return memberData;
      });
    }
  }

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.91;
    cameraRef.current.zoom = clamp(
      cameraRef.current.zoom * factor,
      MIN_ZOOM,
      MAX_ZOOM,
    );
  }, []);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchRef.current = {
        active: true,
        lastDist: Math.sqrt(dx * dx + dy * dy),
      };
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (pinchRef.current.active && e.touches.length === 2) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const factor = dist / pinchRef.current.lastDist;
      cameraRef.current.zoom = clamp(
        cameraRef.current.zoom * factor,
        MIN_ZOOM,
        MAX_ZOOM,
      );
      pinchRef.current.lastDist = dist;
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    pinchRef.current.active = false;
  }, []);

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
  }, []);

  useEffect(() => {
    buildGraph();
    recomputeVisibility();
    resize();

    const logoSrcFinal = logoSrc ?? data.orgLogo;
    if (logoSrcFinal) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        orgLogoRef.current = img;
      };
      img.src = logoSrcFinal;
    }

    const canvas = canvasRef.current!;
    canvas.addEventListener("wheel", handleWheel, { passive: false });
    canvas.addEventListener("touchstart", handleTouchStart, { passive: true });
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("touchend", handleTouchEnd);

    const ro = new ResizeObserver(resize);
    ro.observe(containerRef.current!);

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      canvas.removeEventListener("wheel", handleWheel);
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
      ro.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={"border border-primary"}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: "600px",
        background: "#0b0a09",
        borderRadius: "16px",
        overflow: "hidden",
        fontFamily: "sans-serif",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{ display: "block", cursor: "grab", touchAction: "none" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      />

      <div
        style={{
          position: "absolute",
          bottom: 14,
          left: "50%",
          transform: "translateX(-50%)",
          color: "rgba(255,255,255,0.3)",
          fontSize: "11px",
          pointerEvents: "none",
          whiteSpace: "nowrap",
        }}
      >
        Verschiebe Nodes - Scrolle zum Zoomen - Team anklicken um an- und
        auszuschalten - Mitglied anklicken für Infos
      </div>

      {selectedMember && (
        <MemberPopup
          member={selectedMember}
          cachedImage={imgCacheRef.current.get(selectedMember.image) ?? null}
          //@ts-ignore (can't be bothered, shouldn't be null)
          divRef={popupRef}
          onClose={() => {
            setSelectedMember(null);
            selectedMemberIdRef.current = null;
          }}
        />
      )}
    </div>
  );
}

function MemberPopup({
  member,
  cachedImage,
  divRef,
  onClose,
}: {
  member: TeamMemberData;
  cachedImage: HTMLImageElement | null;
  divRef: React.RefObject<HTMLDivElement>;
  onClose: () => void;
}) {
  const avatarCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = avatarCanvasRef.current;
    if (!canvas || !cachedImage) return;
    const SIZE = 56;
    const DPR = window.devicePixelRatio || 1;
    canvas.width = SIZE * DPR;
    canvas.height = SIZE * DPR;
    canvas.style.width = `${SIZE}px`;
    canvas.style.height = `${SIZE}px`;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(DPR, DPR);

    ctx.beginPath();
    ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(cachedImage, 0, 0, SIZE, SIZE);
  }, [cachedImage]);

  return (
    <div
      ref={divRef}
      style={{
        position: "absolute",
        width: 340,
        background: "rgba(0, 0, 0, 0.20)",
        border: "1px solid rgba(255,255,255,0.12)",
        backdropFilter: "blur(32px)",
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
      `}</style>

      <button
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
        aria-label="Close"
      >
        ×
      </button>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          marginBottom: "16px",
        }}
      >
        {member.image && (
          <canvas
            ref={avatarCanvasRef}
            aria-label={member.name}
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              border: "2px solid rgba(255,255,255,0.15)",
              flexShrink: 0,
            }}
          />
        )}
        <div>
          <div style={{ fontWeight: 700, fontSize: "16px" }}>{member.name}</div>
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

      {member.bio && (
        <div
          style={{
            fontSize: "14px",
            lineHeight: "1.6",
            color: "rgba(255,255,255,0.7)",
            maxHeight: "320px",
            overflowY: "auto",
          }}
          dangerouslySetInnerHTML={{ __html: member.bio }}
        />
      )}
    </div>
  );
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
