import React, { useState, useRef, useEffect } from "react";

export default function BunnySuitConverter() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [skinFile, setSkinFile] = useState<File | null>(null);
  const [overlay, setOverlay] = useState<string>("overlays/1.png");
  const [baseImg, setBaseImg] = useState<HTMLImageElement | null>(null);
  const [overlayImg, setOverlayImg] = useState<HTMLImageElement | null>(null);
  const [maskImg, setMaskImg] = useState<HTMLImageElement | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.onload = () => setOverlayImg(img);
    img.src = overlay;
  }, [overlay]);

  useEffect(() => {
    const maskPath = overlay.replace(/\.png$/, "_mask.png");
    const img = new Image();
    img.onload = () => setMaskImg(img);
    img.onerror = () => setMaskImg(null);
    img.src = maskPath;
  }, [overlay]);

  useEffect(() => {
    if (!baseImg || !overlayImg) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setLoading(true);

    requestAnimationFrame(() => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(baseImg, 0, 0);

      if (maskImg) {
        const maskCanvas = document.createElement("canvas");
        maskCanvas.width = canvas.width;
        maskCanvas.height = canvas.height;
        const maskCtx = maskCanvas.getContext("2d")!;
        maskCtx.drawImage(maskImg, 0, 0);

        const maskData = maskCtx.getImageData(0, 0, canvas.width, canvas.height);
        const skinData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < maskData.data.length; i += 4) {
          const r = maskData.data[i];
          const g = maskData.data[i + 1];
          const b = maskData.data[i + 2];
          const alpha = maskData.data[i + 3];
          if (alpha > 0 && (r > 0 || g > 0 || b > 0)) {
            skinData.data[i + 3] = 0;
          }
        }
        ctx.putImageData(skinData, 0, 0);
      }

      ctx.drawImage(overlayImg, 0, 0);
      setLoading(false);
    });
  }, [baseImg, overlayImg, maskImg]);

  function handleSkinUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    setSkinFile(file);
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => setBaseImg(img);
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  function download() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = "bunnysuit_skin.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
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
      {/* Skin Upload */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-2)" }}>
        <label style={{ fontWeight: 600 }}>Upload skin</label>
        <input
          type="file"
          accept="image/png"
          id="skin-upload"
          onChange={handleSkinUpload}
          style={{ display: "none" }}
        />
        <button
          onClick={() => document.getElementById("skin-upload")?.click()}
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
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-accent)")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--color-primary)")}
        >
          {skinFile ? skinFile.name : "Choose skin"}
        </button>
      </div>

      {/* Overlay Selector */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-2)" }}>
        <label style={{ fontWeight: 600 }}>Choose Overlay</label>
        <select
          style={{
            padding: "var(--space-2)",
            borderRadius: "0.25rem",
            backgroundColor: "var(--color-background)",
            border: "1px solid var(--color-background-100)",
            color: "var(--color-text)",
            cursor: "pointer",
          }}
          value={overlay}
          onChange={(e) => setOverlay(e.target.value)}
        >
          <option value="overlays/1.png">Bunny Suit Classic</option>
          <option value="overlays/2.png">Bunny Suit White</option>
          <option value="overlays/3.png">Bunny Suit Black</option>
          <option value="overlays/4.png">Bunny Suit Purple</option>
        </select>
      </div>

      {/* Preview */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-2)" }}>
        <p style={{ fontWeight: 600 }}>Preview</p>
        <div
          style={{
            position: "relative",
            width: "256px",
            height: "256px",
            border: "1px solid var(--color-background-100)",
            borderRadius: "0.5rem",
            backgroundColor: "var(--color-background)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {loading && (
            <div
              style={{
                position: "absolute",
                width: "48px",
                height: "48px",
                border: "4px solid #928A85",
                borderTop: "4px solid transparent",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            />
          )}
          <canvas
            ref={canvasRef}
            width={64}
            height={64}
            style={{
              width: "100%",
              height: "100%",
              imageRendering: "pixelated",
            }}
          />
        </div>
      </div>

      {/* Download Button */}
      <button
        onClick={download}
        disabled={!baseImg}
        style={{
          padding: "var(--space-2) var(--space-4)",
          borderRadius: "0.375rem",
          backgroundColor: "var(--color-accent)",
          color: "var(--color-background)",
          fontWeight: 600,
          cursor: baseImg ? "pointer" : "not-allowed",
          opacity: baseImg ? 1 : 0.5,
          border: "none",
          transition: "opacity 0.3s ease",
        }}
      >
        Download
      </button>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg);}
          100% { transform: rotate(360deg);}
        }
      `}</style>
    </div>
  );
}
