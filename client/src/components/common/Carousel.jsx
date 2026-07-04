import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Reusable photo carousel with swipe, auto-play, and dot indicators.
// Usage: <Carousel images={['url1', 'url2']} autoPlay />
const Carousel = ({
  images = [],
  autoPlay = false,
  interval = 4000,
  className = "",
}) => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const touchStartX = useRef(null);

  const go = useCallback(
    (index, dir) => {
      setDirection(dir);
      setCurrent((index + images.length) % images.length);
    },
    [images.length],
  );

  const next = useCallback(() => go(current + 1, 1), [current, go]);
  const prev = useCallback(() => go(current - 1, -1), [current, go]);

  // Auto-play
  useEffect(() => {
    if (!autoPlay || images.length <= 1) return;
    const id = setInterval(next, interval);
    return () => clearInterval(id);
  }, [autoPlay, interval, next, images.length]);

  // Touch / swipe support
  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) diff > 0 ? next() : prev();
    touchStartX.current = null;
  };

  if (!images.length) {
    return (
      <div
        className={`bg-amber-100 flex items-center justify-center text-5xl ${className}`}
      >
        🐾
      </div>
    );
  }

  const variants = {
    enter: (d) => ({ x: d > 0 ? "100%" : "-100%", opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d) => ({ x: d > 0 ? "-100%" : "100%", opacity: 0 }),
  };

  return (
    <div
      className={`relative overflow-hidden select-none ${className}`}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.img
          key={current}
          src={images[current]}
          alt={`Photo ${current + 1}`}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: "tween", duration: 0.35, ease: "easeInOut" }}
          className="w-full h-full object-cover absolute inset-0"
          draggable={false}
        />
      </AnimatePresence>

      {/* Invisible layer so the image fills the container height */}
      <img
        src={images[0]}
        alt=""
        className="w-full h-full object-cover invisible"
        draggable={false}
      />

      {/* Arrows — only shown when >1 image */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors z-10 text-sm"
            aria-label="Previous photo"
          >
            ‹
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors z-10 text-sm"
            aria-label="Next photo"
          >
            ›
          </button>
        </>
      )}

      {/* Dot indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-10">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                go(i, i > current ? 1 : -1);
              }}
              className={`rounded-full transition-all ${
                i === current ? "bg-white w-4 h-1.5" : "bg-white/50 w-1.5 h-1.5"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Carousel;
