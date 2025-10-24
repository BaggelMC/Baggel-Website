import { useState } from "react";
import type { GallerySection } from "../scripts/gallery";

export default function GalleryCarousel({ section }: { section: GallerySection }) {
  const images = Object.values(section.images);
  const [current, setCurrent] = useState(0);

  const next = () => setCurrent((c) => (c + 1) % images.length);
  const prev = () => setCurrent((c) => (c - 1 + images.length) % images.length);

  return (
    <section className="mb-20 relative">
      <h2 className="text-xl font-minecraft text-accent mb-8 text-center capitalize">
        {section.name}
      </h2>

      <div className="relative overflow-hidden rounded-2xl" style={{ aspectRatio: "16 / 9" }}>
        {/* Slides */}
        <div
          className="flex transition-transform duration-(--transition-duration-fast) ease-(--transition-timing-soft)"
          style={{ transform: `translateX(-${100 * current}%)` }}
        >
          {images.map((img, idx) => (
            <div className="min-w-full" key={idx}>
              <img
                src={img.src}
                alt={section.name}
                loading="lazy"
                className="object-cover w-full h-full"
                style={{ aspectRatio: "16 / 9" }}
              />
            </div>
          ))}
        </div>

        {/* Arrows */}
        <button
          onClick={prev}
          className="
            absolute top-1/2 -translate-y-1/2 left-2 sm:left-4
            bg-background-10 hover:bg-background-50 text-text
            rounded-full p-2 sm:p-3 transition
            text-sm sm:text-base
          "
          aria-label="Previous image"
        >
          ◀
        </button>
        <button
          onClick={next}
          className="
            absolute top-1/2 -translate-y-1/2 right-2 sm:right-4
            bg-background-10 hover:bg-background-50 text-text
            rounded-full p-2 sm:p-3 transition
            text-sm sm:text-base
          "
          aria-label="Next image"
        >
          ▶
        </button>

        {/* Dots */}
        <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2">
          {images.map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? "bg-accent w-2.5 h-2.5 sm:w-3 sm:h-3"
                  : "bg-background-50 w-2 h-2 sm:w-2.5 sm:h-2.5"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
