document.addEventListener("DOMContentLoaded", () => {
    const imgs = document.querySelectorAll<HTMLImageElement>(".progressive-img");

    const upgradeImage = (img: HTMLImageElement) => {
      const images: string[] = JSON.parse(img.dataset.images || "[]");
      if (!images.length) return;

      let current = 0;

      const loadNext = () => {
        current++;
        if (current < images.length) {
          const nextImg = new Image();
          nextImg.src = images[current];
          nextImg.onload = () => {
            const overlay = document.createElement("img");
            overlay.src = nextImg.src;
            overlay.style.position = "absolute";
            overlay.style.top = "0";
            overlay.style.left = "0";
            overlay.style.width = "100%";
            overlay.style.height = "100%";
            overlay.style.objectFit = "cover";
            overlay.style.opacity = "0";
            overlay.style.transition = "opacity 0.5s ease";
            overlay.classList.add("progressive-overlay");

            const parent = img.parentElement!;
            parent.style.position = "relative";
            parent.style.height = `${img.offsetHeight}px`;
            parent.appendChild(overlay);

            overlay.getBoundingClientRect();

            requestAnimationFrame(() => {
              overlay.style.opacity = "1";
            });

            overlay.addEventListener("transitionend", () => {
              img.style.opacity = "0";
              img.src = nextImg.src;

              requestAnimationFrame(() => {
                img.style.opacity = "1";
                parent.removeChild(overlay);
                loadNext();
              });
            });
          };
        }
      };

      setTimeout(loadNext, 500);
    };

    const observer = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            upgradeImage(img);
            observer.unobserve(img);
          }
        });
      },
      { threshold: 0.1 }
    );

    imgs.forEach(img => observer.observe(img));
  });