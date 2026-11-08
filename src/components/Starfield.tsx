import { useMemo } from "react";

import styles from "./Starfield.module.css";

/** Deterministic PRNG so server and client agree and nothing random runs at module scope. */
export function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function Starfield({
  count = 70,
  seed = 7,
  className,
}: {
  count?: number;
  seed?: number;
  className?: string | undefined;
}) {
  const stars = useMemo(() => {
    const rnd = seeded(seed);
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: rnd() * 100,
      y: rnd() * 100,
      size: rnd() < 0.12 ? 2.4 + rnd() * 1.2 : 0.8 + rnd() * 1.3,
      delay: rnd() * 6,
      duration: 2.8 + rnd() * 4,
      gold: rnd() < 0.18,
    }));
  }, [count, seed]);

  return (
    <div className={`${styles.field} ${className ?? ""}`} aria-hidden="true">
      {stars.map((s) => (
        <span
          key={s.id}
          className={`${styles.star} ${s.size > 2.3 ? styles.bright : ""} ${s.gold ? styles.gold : ""}`}
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
