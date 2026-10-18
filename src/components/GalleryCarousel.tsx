import { useEffect, useRef, useState } from "react";
import type { GallerySection } from "@scripts/gallery";

const SWIPE_THRESHOLD = 50; // px a drag must travel to change slide
const DRAG_START = 6; // px of movement before a press counts as a drag
const THUMB_W = 80; // px
const THUMB_GAP = 8; // px
const THUMB_PAD = 6; // px, room for the ring + focus outline
const SETTLE_FALLBACK_MS = 1200; // safety net if transitionend never fires

export default function GalleryCarousel({
  section,
}: {
  section: GallerySection;
}) {
  const images = section.images;
  const n = images.length;
  const looping = n > 1;

  const slides = looping ? [images[n - 1], ...images, images[0]] : images;

  const [pos, setPos] = useState(looping ? 1 : 0); // index within `slides`
  const [animate, setAnimate] = useState(true);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [thumbsWidth, setThumbsWidth] = useState<number | null>(null);

  const posRef = useRef(pos);
  const busy = useRef(false);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const pressed = useRef(false);
  const dragStarted = useRef(false);
  const startX = useRef(0);
  const dragXRef = useRef(0);
  const thumbsRef = useRef<HTMLDivElement>(null);

  const current = looping ? (pos - 1 + n) % n : 0; // index within `images`

  const updatePos = (p: number) => {
    posRef.current = p;
    setPos(p);
  };

  const prefersReducedMotion = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Called when a slide animation ends: if we landed on a clone, jump to the
  // real slide without animating, then allow the next move
  const settle = () => {
    clearTimeout(settleTimer.current);
    const p = posRef.current;
    if (p === 0) {
      setAnimate(false);
      updatePos(n);
    } else if (p === n + 1) {
      setAnimate(false);
      updatePos(1);
    }
    busy.current = false;
  };

  const lock = () => {
    busy.current = true;
    clearTimeout(settleTimer.current);
    settleTimer.current = setTimeout(settle, SETTLE_FALLBACK_MS);
  };

  const move = (delta: number) => {
    if (!looping || busy.current) return;

    if (prefersReducedMotion()) {
      // No transition will run, so wrap directly
      setAnimate(false);
      updatePos((((posRef.current - 1 + delta) % n) + n) % n + 1);
      return;
    }

    lock();
    setAnimate(true);
    updatePos(posRef.current + delta);
  };

  const next = () => move(1);
  const prev = () => move(-1);

  const goTo = (i: number) => {
    if (!looping || busy.current || i === current) return;
    if (prefersReducedMotion()) {
      setAnimate(false);
      updatePos(i + 1);
      return;
    }
    lock();
    setAnimate(true);
    updatePos(i + 1);
  };

  const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget || e.propertyName !== "transform") return;
    settle();
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!looping || busy.current) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if ((e.target as HTMLElement).closest("button")) return;

    pressed.current = true;
    dragStarted.current = false;
    startX.current = e.clientX;
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!pressed.current) return;
    const dx = e.clientX - startX.current;

    if (!dragStarted.current) {
      if (Math.abs(dx) < DRAG_START) return;
      dragStarted.current = true;
      setDragging(true);
      // Only capture once we know it's a drag
      e.currentTarget.setPointerCapture(e.pointerId);
    }

    dragXRef.current = dx;
    setDragX(dx);
  };

  const endDrag = () => {
    if (!pressed.current) return;
    pressed.current = false;
    if (!dragStarted.current) return;
    dragStarted.current = false;

    const dx = dragXRef.current;
    dragXRef.current = 0;
    setDragging(false);
    setDragX(0);

    if (dx <= -SWIPE_THRESHOLD) next();
    else if (dx >= SWIPE_THRESHOLD) prev();
    else setAnimate(true); // snap back
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      next();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      prev();
    }
  };

  // only show thumbnails if they fit in a single row 
  useEffect(() => {
    const el = thumbsRef.current;
    if (!el) return;
    setThumbsWidth(el.clientWidth);
    const ro = new ResizeObserver(([entry]) =>
      setThumbsWidth(entry.contentRect.width),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, [looping]);

  useEffect(() => () => clearTimeout(settleTimer.current), []);

  if (n === 0) return null;

  const thumbsNeeded = n * THUMB_W + (n - 1) * THUMB_GAP + THUMB_PAD * 2;
  const showThumbs = thumbsWidth !== null && thumbsNeeded <= thumbsWidth;

  const arrowClass = `
    absolute top-1/2 -translate-y-1/2
    text-accent rounded backdrop-blur-sm p-1.5 sm:p-2 transition
    border border-[color-mix(in_srgb,var(--color-accent)_40%,transparent)]
    hover:border-[color-mix(in_srgb,var(--color-accent)_65%,transparent)]
    bg-[color-mix(in_srgb,var(--color-accent)_18%,rgb(0_0_0/35%))]
    hover:bg-[color-mix(in_srgb,var(--color-accent)_30%,rgb(0_0_0/35%))]
    focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent
  `;

  return (
    <section
      className="mb-20 relative"
      aria-roledescription="carousel"
      aria-label={section.name}
    >
      <h2 className="text-xl font-minecraft text-accent mb-8 text-center capitalize">
        {section.name}
      </h2>

      <div
        className="relative overflow-hidden rounded-2xl select-none focus-visible:outline-2 focus-visible:outline-accent"
        style={{ aspectRatio: "16 / 9", touchAction: "pan-y" }}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {/* Slides */}
        <div
          className={`flex h-full ${
            animate && !dragging
              ? "transition-transform duration-(--transition-duration-fast) ease-(--transition-timing-soft) motion-reduce:transition-none"
              : ""
          }`}
          style={{
            transform: `translateX(calc(${-100 * pos}% + ${dragX}px))`,
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          {slides.map((img, idx) => {
            const isClone = looping && (idx === 0 || idx === slides.length - 1);
            const near = Math.abs(idx - pos) <= 1;
            return (
              <div
                className="min-w-full h-full"
                key={idx}
                aria-hidden={isClone || idx !== pos ? true : undefined}
              >
                <img
                  src={img.src}
                  alt={isClone ? "" : section.name}
                  loading={near ? "eager" : "lazy"}
                  draggable={false}
                  className="object-cover w-full h-full pointer-events-none"
                />
              </div>
            );
          })}
        </div>

        {looping && (
          <>
            <button
              type="button"
              onClick={prev}
              className={`${arrowClass} left-2 sm:left-4`}
              aria-label="Previous image"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5 sm:w-6 sm:h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M15 5l-7 7 7 7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={next}
              className={`${arrowClass} right-2 sm:right-4`}
              aria-label="Next image"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5 sm:w-6 sm:h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Same look as TextPill.astro (Astro components can't render inside a React island) */}
            <span
              className="absolute top-2 right-2 sm:top-4 sm:right-4 font-minecraft text-[10px] tracking-normal px-2 py-1 rounded backdrop-blur-sm pointer-events-none"
              style={{
                color: "var(--color-accent)",
                background:
                  "color-mix(in srgb, var(--color-accent) 18%, rgb(0 0 0 / 35%))",
                border:
                  "1px solid color-mix(in srgb, var(--color-accent) 40%, transparent)",
              }}
              aria-live="polite"
            >
              {current + 1} / {n}
            </span>
          </>
        )}
      </div>

      {/* Thumbnails: the wrapper is always rendered so it can be measured */}
      {looping && (
        <div ref={thumbsRef} className="mt-3">
          {showThumbs && (
            <div
              className="flex justify-center"
              style={{ gap: THUMB_GAP, padding: THUMB_PAD }}
            >
              {images.map((img, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => goTo(i)}
                  aria-label={`Show image ${i + 1} of ${n}`}
                  aria-current={i === current}
                  className={`shrink-0 overflow-hidden rounded-lg transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                    i === current
                      ? "ring-2 ring-accent opacity-100"
                      : "opacity-50 hover:opacity-100"
                  }`}
                  style={{ width: THUMB_W, aspectRatio: "16 / 9" }}
                >
                  <img
                    src={img.thumb}
                    alt=""
                    loading="lazy"
                    draggable={false}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
