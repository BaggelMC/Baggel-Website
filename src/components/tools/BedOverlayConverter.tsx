import React, { useState, useRef, useEffect, useCallback } from "react";
import JSZip from "jszip";

const COLORS = [
  "black", "blue", "brown", "cyan", "gray", "green",
  "light_blue", "light_gray", "lime", "magenta", "orange",
  "pink", "purple", "red", "white", "yellow",
] as const;
type BedColor = typeof COLORS[number];

const COLOR_LABELS: Record<BedColor, string> = {
  black: "Black", blue: "Blue", brown: "Brown", cyan: "Cyan",
  gray: "Gray", green: "Green", light_blue: "Light Blue",
  light_gray: "Light Gray", lime: "Lime", magenta: "Magenta",
  orange: "Orange", pink: "Pink", purple: "Purple", red: "Red",
  white: "White", yellow: "Yellow",
};

// Bed texture is 16px wide × 16px tall per piece, 16×32 combined.
const BED_W = 16;
const BED_H = 32; // foot (top half) + head (bottom half)

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Draw two 16×16 textures into a single 16×32 canvas (head on top, foot on bottom).
 * Returns a canvas at native bed resolution.
 */
async function buildBedTexture(color: BedColor): Promise<HTMLCanvasElement> {
  const [foot, head] = await Promise.all([
    loadImage(`bed_textures/${color}_bed_foot_up.png`),
    loadImage(`bed_textures/${color}_bed_head_up.png`),
  ]);

  const c = document.createElement("canvas");
  c.width = BED_W;
  c.height = BED_H;
  const ctx = c.getContext("2d")!;
  ctx.drawImage(head, 0, 0, BED_W, BED_H / 2);       // head on top
  ctx.drawImage(foot, 0, BED_H / 2, BED_W, BED_H / 2); // foot on bottom
  return c;
}

/**
 * Resize an HTMLImageElement to targetW × targetH using nearest-neighbor (pixelated).
 */
function resizeNearest(
  img: HTMLCanvasElement | HTMLImageElement,
  targetW: number,
  targetH: number,
): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = targetW;
  c.height = targetH;
  const ctx = c.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, 0, 0, targetW, targetH);
  return c;
}

/**
 * Composite bed (upscaled) + overlay at the working resolution,
 * then return the merged canvas.
 */
function composite(
  bedCanvas: HTMLCanvasElement,
  overlayCanvas: HTMLCanvasElement,
  w: number,
  h: number,
): HTMLCanvasElement {
  const bedUp = resizeNearest(bedCanvas, w, h);
  const merged = document.createElement("canvas");
  merged.width = w;
  merged.height = h;
  const ctx = merged.getContext("2d")!;
  ctx.drawImage(bedUp, 0, 0);
  ctx.drawImage(overlayCanvas, 0, 0);
  return merged;
}

/**
 * Extract the top or bottom half of a canvas at its current resolution.
 */
function extractHalf(
  src: HTMLCanvasElement,
  half: "top" | "bottom",
): HTMLCanvasElement {
  const halfH = src.height / 2;
  const sy = half === "top" ? 0 : halfH;

  const slice = document.createElement("canvas");
  slice.width = src.width;
  slice.height = halfH;
  const ctx = slice.getContext("2d")!;
  ctx.drawImage(src, 0, -sy);
  return slice;
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("toBlob failed"));
    }, "image/png");
  });
}

export default function BedOverlayConverter() {
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const [bedColor, setBedColor] = useState<BedColor>("red");
  const [overlayFile, setOverlayFile] = useState<File | null>(null);
  const [overlayImg, setOverlayImg] = useState<HTMLImageElement | null>(null);

  // Holds the composited canvas at working resolution, ready for download
  const [mergedCanvas, setMergedCanvas] = useState<HTMLCanvasElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Render preview whenever bedColor or overlayImg changes
  const render = useCallback(async () => {
    setLoading(true);
    setError(null);
    setMergedCanvas(null);

    try {
      const bedCanvas = await buildBedTexture(bedColor);

      let finalCanvas: HTMLCanvasElement;

      if (overlayImg) {
        // Keep overlay height, fit width to 1:2 ratio (width = height / 2)
        const overlayH = overlayImg.naturalHeight;
        const overlayW = Math.round(overlayH / 2);

        // Resize overlay to 1:2 aspect ratio
        const overlayResized = resizeNearest(overlayImg, overlayW, overlayH);

        // Working resolution: overlayW × overlayH
        finalCanvas = composite(bedCanvas, overlayResized, overlayW, overlayH);
      } else {
        // No overlay: just show native 16×32 bed texture upscaled for preview
        finalCanvas = bedCanvas;
      }

      setMergedCanvas(finalCanvas);

      // Draw to preview canvas (pixelated, 128×256 display)
      const pc = previewCanvasRef.current;
      if (pc) {
        pc.width = finalCanvas.width;
        pc.height = finalCanvas.height;
        const ctx = pc.getContext("2d")!;
        ctx.clearRect(0, 0, pc.width, pc.height);
        ctx.drawImage(finalCanvas, 0, 0);
      }
    } catch (e) {
      console.error(e);
      setError("Failed to load bed textures. Make sure the texture files are in bed_textures/.");
    } finally {
      setLoading(false);
    }
  }, [bedColor, overlayImg]);

  useEffect(() => {
    render();
  }, [render]);

  function handleOverlayUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    setOverlayFile(file);
    if (!file) {
      setOverlayImg(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => setOverlayImg(img);
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  async function downloadZip() {
    if (!mergedCanvas) return;
    const headCanvas = extractHalf(mergedCanvas, "top");
    const footCanvas = extractHalf(mergedCanvas, "bottom");

    const [headBlob, footBlob] = await Promise.all([
      canvasToBlob(headCanvas),
      canvasToBlob(footCanvas),
    ]);

    const zip = new JSZip();
    zip.file(`${bedColor}_bed_head_up.png`, headBlob);
    zip.file(`${bedColor}_bed_foot_up.png`, footBlob);

    const zipBlob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement("a");
    link.download = `${bedColor}_bed.zip`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "var(--space-8)",
        padding: "var(--space-8)",
        fontFamily: "var(--font-sans)",
        color: "var(--color-text)",
      }}
    >
      {/* Bed Color Selector */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "var(--space-2)",
        }}
      >
        <label style={{ fontWeight: 600 }}>Bed Color</label>
        <select
          style={{
            padding: "var(--space-2)",
            borderRadius: "0.25rem",
            backgroundColor: "var(--color-background)",
            border: "1px solid var(--color-background-100)",
            color: "var(--color-text)",
            cursor: "pointer",
          }}
          value={bedColor}
          onChange={(e) => setBedColor(e.target.value as BedColor)}
        >
          {COLORS.map((c) => (
            <option key={c} value={c}>
              {COLOR_LABELS[c]}
            </option>
          ))}
        </select>
      </div>

      {/* Overlay Upload */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "var(--space-2)",
        }}
      >
        <label style={{ fontWeight: 600 }}>Upload Overlay (optional)</label>
        <input
          type="file"
          accept="image/png"
          id="overlay-upload"
          onChange={handleOverlayUpload}
          style={{ display: "none" }}
        />
        <button
          onClick={() => document.getElementById("overlay-upload")?.click()}
          style={{
            padding: "var(--space-2) var(--space-4)",
            borderRadius: "0.375rem",
            backgroundColor: "var(--color-primary)",
            color: "var(--color-background)",
            fontWeight: 600,
            cursor: "pointer",
            border: "none",
            transition: "background-color 0.3s ease",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "var(--color-accent)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "var(--color-primary)")
          }
        >
          {overlayFile ? overlayFile.name : "Choose overlay PNG"}
        </button>
        {overlayFile && (
          <button
            onClick={() => {
              setOverlayFile(null);
              setOverlayImg(null);
              const input = document.getElementById("overlay-upload") as HTMLInputElement;
              if (input) input.value = "";
            }}
            style={{
              fontSize: "0.75rem",
              background: "none",
              border: "none",
              color: "var(--color-text)",
              cursor: "pointer",
              opacity: 0.6,
              textDecoration: "underline",
            }}
          >
            Remove overlay
          </button>
        )}
        <p
          style={{
            fontSize: "0.75rem",
            opacity: 0.6,
            margin: 0,
            textAlign: "center",
            maxWidth: "240px",
          }}
        >
          PNG will be cropped to a 1:2 ratio (width = height ÷ 2) and layered over the bed texture.
        </p>
      </div>

      {/* Preview */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "var(--space-2)",
        }}
      >
        <p style={{ fontWeight: 600, margin: 0 }}>Preview</p>
        <div
          style={{
            position: "relative",
            width: "128px",
            height: "256px",
            border: "1px solid var(--color-background-100)",
            borderRadius: "0.5rem",
            backgroundColor: "var(--color-background)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {loading && (
            <div
              style={{
                position: "absolute",
                width: "32px",
                height: "32px",
                border: "3px solid #928A85",
                borderTop: "3px solid transparent",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                zIndex: 1,
              }}
            />
          )}
          {error && (
            <p
              style={{
                fontSize: "0.7rem",
                color: "red",
                textAlign: "center",
                padding: "0.5rem",
              }}
            >
              {error}
            </p>
          )}
          <canvas
            ref={previewCanvasRef}
            width={BED_W}
            height={BED_H}
            style={{
              width: "100%",
              height: "100%",
              imageRendering: "pixelated",
              display: error ? "none" : "block",
            }}
          />
        </div>
        <p
          style={{
            fontSize: "0.7rem",
            opacity: 0.5,
            margin: 0,
          }}
        >
          Top = head · Bottom = foot
        </p>
      </div>

      {/* Download Button */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-2)" }}>
        <button
          onClick={downloadZip}
          disabled={!mergedCanvas || loading}
          style={{
            padding: "var(--space-2) var(--space-4)",
            borderRadius: "0.375rem",
            backgroundColor: "var(--color-accent)",
            color: "var(--color-background)",
            fontWeight: 600,
            cursor: mergedCanvas && !loading ? "pointer" : "not-allowed",
            opacity: mergedCanvas && !loading ? 1 : 0.5,
            border: "none",
            transition: "opacity 0.3s ease",
          }}
        >
          Download ZIP
        </button>
        <p style={{ fontSize: "0.7rem", opacity: 0.5, margin: 0 }}>
          Contains <code>{bedColor}_bed_head_up.png</code> and <code>{bedColor}_bed_foot_up.png</code>
        </p>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}