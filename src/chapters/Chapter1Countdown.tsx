import { useEffect, useMemo, useRef, useState } from "react";

import { NextButton, Button } from "@/components/Button";
import { Copy } from "@/components/Copy";
import { Starfield, seeded } from "@/components/Starfield";
import copy from "@/content/copy.json";
import { useExperience } from "@/experience/ExperienceContext";
import { getCountdown } from "@/lib/rules";
import c from "./common.module.css";
import styles from "./Chapter1.module.css";

const t = copy.chapter1;
const FORM_MS = 3200;

/** Ticks on each second boundary; values are always recomputed from the device clock (D-08). */
function useNow() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    let id: number;
    const tick = () => {
      setNow(Date.now());
      id = window.setTimeout(tick, 1000 - (Date.now() % 1000) + 5);
    };
    id = window.setTimeout(tick, 1000 - (Date.now() % 1000) + 5);
    // A phone waking from sleep re-checks immediately.
    const onVisible = () => document.visibilityState === "visible" && setNow(Date.now());
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearTimeout(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);
  return now;
}

export function Chapter1Countdown() {
  const { mode, goNext, reducedMotion } = useExperience();
  const now = useNow();
  const countdown = getCountdown(now);
  const revealed = mode === "dev" || countdown.revealed;

  // Replaying the star formation (dev bypass) remounts the reveal.
  const [revealKey, setRevealKey] = useState(0);
  const [formed, setFormed] = useState(false);
  const wasRevealed = useRef(revealed);

  useEffect(() => {
    if (!revealed) return;
    wasRevealed.current = true;
    setFormed(false);
    const id = window.setTimeout(() => setFormed(true), reducedMotion ? 0 : FORM_MS);
    return () => window.clearTimeout(id);
  }, [revealed, revealKey, reducedMotion]);

  return (
    <section className={`${c.stage} ${styles.sky}`} aria-labelledby="ch1-title">
      <Starfield count={90} seed={11} />
      <Moon />
      <Hills />

      <div className={c.inner}>
        <p className={c.eyebrow}>{t.eyebrow}</p>

        {!revealed && countdown.revealed === false ? (
          <div className={styles.countdownWrap}>
            <h1 id="ch1-title" className={styles.lead}>
              {t.countdownLead}
            </h1>
            <div
              className={styles.countdown}
              role="timer"
              aria-label={`${countdown.days} days, ${countdown.hours} hours, ${countdown.minutes} minutes, ${countdown.seconds} seconds`}
            >
              <Unit value={countdown.days} label="Days" />
              <Unit value={countdown.hours} label="Hours" />
              <Unit value={countdown.minutes} label="Minutes" />
              <Unit value={countdown.seconds} label="Seconds" />
            </div>
          </div>
        ) : (
          <div className={styles.reveal} key={revealKey}>
            <h1 id="ch1-title" className="visually-hidden">
              {t.name}
            </h1>
            <StarName animate={!reducedMotion} />
            {formed && (
              <p className={`${styles.revealText} ${c.fadeIn}`}>
                <Copy value={t.revealText} />
              </p>
            )}
          </div>
        )}
      </div>

      <div className={c.footer}>
        <div className={styles.actions}>
          {mode === "dev" && (
            <Button variant="ghost" onClick={() => setRevealKey((k) => k + 1)}>
              Bypass countdown
            </Button>
          )}
          {revealed && formed && <NextButton onClick={goNext} />}
        </div>
      </div>
    </section>
  );
}

function Unit({ value, label }: { value: number; label: string }) {
  return (
    <div className={styles.unit}>
      <span className={styles.value}>{String(value).padStart(2, "0")}</span>
      <span className={styles.label}>{label}</span>
    </div>
  );
}

/* ---------- ALOO written in stars ---------- */

type Pt = [number, number];

function sample(path: Pt[], step: number): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < path.length - 1; i++) {
    const [x1, y1] = path[i]!;
    const [x2, y2] = path[i + 1]!;
    const len = Math.hypot(x2 - x1, y2 - y1);
    const n = Math.max(1, Math.round(len / step));
    for (let j = 0; j < n; j++) out.push([x1 + ((x2 - x1) * j) / n, y1 + ((y2 - y1) * j) / n]);
  }
  out.push(path[path.length - 1]!);
  return out;
}

function ellipse(cx: number, cy: number, rx: number, ry: number, n: number): Pt[] {
  return Array.from({ length: n + 1 }, (_, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry] as Pt;
  });
}

const LETTER_PATHS: Pt[][] = [
  // A
  [
    [0, 14],
    [5, 0],
    [10, 14],
  ],
  [
    [2.4, 8.6],
    [7.6, 8.6],
  ],
  // L
  [
    [15, 0],
    [15, 14],
    [22.5, 14],
  ],
  // O
  ellipse(32, 7, 5, 7, 40),
  // O
  ellipse(46, 7, 5, 7, 40),
];

function StarName({ animate }: { animate: boolean }) {
  const stars = useMemo(() => {
    const rnd = seeded(1411);
    const pts: Pt[] = [];
    LETTER_PATHS.forEach((p, i) => {
      const s = sample(p, i >= 3 ? 1.75 : 1.6);
      // closed ellipses repeat their first point
      pts.push(...(i >= 3 ? s.slice(0, -1) : s));
    });
    return pts.map(([x, y], i) => ({
      x,
      y,
      dx: (rnd() - 0.5) * 120,
      dy: (rnd() - 0.8) * 60,
      r: rnd() < 0.15 ? 0.62 : 0.38 + rnd() * 0.16,
      delay: (i / pts.length) * 1.4 + rnd() * 0.4,
    }));
  }, []);

  return (
    <svg
      className={`${styles.name} ${animate ? styles.animate : ""}`}
      viewBox="-4 -4 59 22"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="starGlow">
          <stop offset="0" stopColor="var(--ivory)" stopOpacity="0.9" />
          <stop offset="1" stopColor="var(--gold)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g className={styles.lines}>
        {LETTER_PATHS.map((p, i) => (
          <polyline key={i} points={p.map((q) => q.join(",")).join(" ")} pathLength={1} />
        ))}
      </g>
      {stars.map((s, i) => (
        <g
          key={i}
          className={styles.formStar}
          style={
            {
              "--dx": `${s.dx}px`,
              "--dy": `${s.dy}px`,
              animationDelay: `${s.delay}s`,
            } as React.CSSProperties
          }
        >
          <circle cx={s.x} cy={s.y} r={s.r * 3} fill="url(#starGlow)" opacity="0.5" />
          <circle cx={s.x} cy={s.y} r={s.r} className={styles.starCore} />
        </g>
      ))}
    </svg>
  );
}

/* ---------- Illustration ---------- */

function Moon() {
  return (
    <svg className={styles.moon} viewBox="0 0 120 120" aria-hidden="true">
      <defs>
        <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0.45" stopColor="var(--champagne)" stopOpacity="0.35" />
          <stop offset="1" stopColor="var(--champagne)" stopOpacity="0" />
        </radialGradient>
        <mask id="crescent">
          <rect width="120" height="120" fill="white" />
          <circle cx="74" cy="50" r="26" fill="black" />
        </mask>
      </defs>
      <circle cx="60" cy="60" r="58" fill="url(#moonGlow)" />
      <circle cx="60" cy="60" r="28" fill="var(--ivory)" mask="url(#crescent)" />
      <circle cx="47" cy="66" r="2.4" fill="var(--champagne)" opacity="0.6" mask="url(#crescent)" />
      <circle cx="42" cy="54" r="1.4" fill="var(--champagne)" opacity="0.6" mask="url(#crescent)" />
    </svg>
  );
}

function Hills() {
  return (
    <svg
      className={styles.hills}
      viewBox="0 0 400 160"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M0 90 C60 60 110 70 160 88 S260 60 320 76 S380 92 400 84 V160 H0Z"
        fill="var(--navy-soft)"
        opacity="0.55"
      />
      <path d="M0 118 C50 98 120 100 180 116 S300 96 400 112 V160 H0Z" fill="var(--navy-deep)" />
      {/* a tiny storybook house with a lit window */}
      <g transform="translate(296 92)">
        <path d="M0 22 L14 9 L28 22 V40 H0Z" fill="var(--navy-deep)" />
        <rect x="10" y="26" width="7" height="7" rx="1" fill="var(--gold-bright)" opacity="0.9" />
      </g>
    </svg>
  );
}
