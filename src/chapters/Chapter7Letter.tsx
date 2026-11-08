import { useEffect, useRef, useState } from "react";

import { NextButton } from "@/components/Button";
import { Copy } from "@/components/Copy";
import copy from "@/content/copy.json";
import { useExperience } from "@/experience/ExperienceContext";
import c from "./common.module.css";
import styles from "./Chapter7.module.css";

const t = copy.chapter7;

export function Chapter7Letter() {
  const { goNext, reducedMotion } = useExperience();
  const [phase, setPhase] = useState<"closed" | "opening" | "open">("closed");
  const letterRef = useRef<HTMLElement>(null);

  const open = () => {
    if (phase !== "closed") return;
    if (reducedMotion) return setPhase("open");
    setPhase("opening");
  };

  useEffect(() => {
    if (phase !== "opening") return;
    const id = window.setTimeout(() => setPhase("open"), 1900);
    return () => window.clearTimeout(id);
  }, [phase]);

  useEffect(() => {
    if (phase === "open") letterRef.current?.focus({ preventScroll: true });
  }, [phase]);

  return (
    <section className={`${c.stage} ${styles.study}`} aria-labelledby="ch7-title">
      <div className={styles.lamp} aria-hidden="true" />
      <div className={`${c.inner} ${styles.inner}`}>
        <p className={c.eyebrow}>{t.eyebrow}</p>
        <h1 id="ch7-title" className="visually-hidden">
          {t.eyebrow}
        </h1>

        {phase !== "open" ? (
          <div className={styles.desk}>
            <DeskDecor />
            <button
              type="button"
              className={`${styles.envelope} ${phase === "opening" ? styles.opening : ""}`}
              onClick={open}
              aria-label={t.invite}
              disabled={phase !== "closed"}
            >
              <span className={styles.envBack} />
              <span className={styles.paperPeek} />
              <span className={styles.envFront} />
              <span className={styles.flap} />
              <span className={styles.seal} aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M12 3l2.2 6.3L21 12l-6.8 2.7L12 21l-2.2-6.3L3 12l6.8-2.7z" />
                </svg>
              </span>
            </button>
            <p className={`${styles.invite} ${phase === "opening" ? styles.inviteGone : ""}`}>
              {t.invite}
            </p>
          </div>
        ) : (
          <article
            ref={letterRef}
            tabIndex={-1}
            className={`${styles.letter} ${c.fadeIn}`}
            aria-label="Letter"
          >
            <p className={styles.salutation}>
              <Copy value={t.salutation} />
            </p>
            {t.body.map((para, i) => (
              <p key={i} className={styles.para}>
                <Copy value={para} />
              </p>
            ))}
            <p className={styles.signoff}>
              <Copy value={t.signoff} />
            </p>
            <svg className={styles.sprig} viewBox="0 0 80 40" aria-hidden="true">
              <path
                d="M4 34 C24 26 44 22 76 6"
                fill="none"
                stroke="var(--gold-deep)"
                strokeWidth="1.2"
              />
              {[14, 28, 42, 56].map((x, i) => (
                <ellipse
                  key={x}
                  cx={x}
                  cy={32 - i * 6.5}
                  rx="6"
                  ry="2.6"
                  fill="var(--dusty-blue)"
                  opacity="0.7"
                  transform={`rotate(${-30 + (i % 2) * 50} ${x} ${32 - i * 6.5})`}
                />
              ))}
            </svg>
          </article>
        )}
      </div>

      <div className={c.footer}>{phase === "open" && <NextButton onClick={goNext} />}</div>
    </section>
  );
}

function DeskDecor() {
  return (
    <svg
      className={styles.decor}
      viewBox="0 0 400 260"
      preserveAspectRatio="xMidYMax meet"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="deskTop" x1="0" y1="0" x2="0" y2="1">
          <stop
            offset="0"
            stopColor="color-mix(in oklab, var(--champagne) 55%, var(--cocoa-light))"
          />
          <stop offset="1" stopColor="color-mix(in oklab, var(--cocoa) 70%, var(--navy))" />
        </linearGradient>
      </defs>
      {/* desk surface */}
      <path d="M-20 150 H420 V260 H-20Z" fill="url(#deskTop)" />
      <path d="M-20 150 H420" stroke="var(--gold)" strokeOpacity="0.5" />
      {/* vase with dried flowers */}
      <g transform="translate(36 52)">
        <path
          d="M18 60 c-12 8 -14 30 -6 40 h28 c8 -10 6 -32 -6 -40 v-10 h-16z"
          fill="var(--dusty-blue)"
          opacity="0.9"
        />
        <path
          d="M24 50 C20 30 10 18 4 4 M28 50 C30 26 36 12 44 0 M26 50 C26 30 24 16 26 2"
          stroke="var(--gold-deep)"
          strokeWidth="1.4"
          fill="none"
        />
        {[
          [4, 4],
          [44, 0],
          [26, 2],
          [12, 18],
          [36, 14],
        ].map(([x, y], i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={i < 3 ? 4.5 : 3}
            fill={i % 2 ? "var(--champagne)" : "var(--gold)"}
          />
        ))}
      </g>
      {/* ink bottle and quill */}
      <g transform="translate(316 104)">
        <rect x="0" y="18" width="34" height="30" rx="6" fill="var(--navy-deep)" />
        <rect x="9" y="10" width="16" height="10" rx="2" fill="var(--navy-soft)" />
        <path
          d="M18 14 C30 -20 52 -36 64 -44 C54 -24 38 -6 20 16z"
          fill="var(--ivory)"
          opacity="0.9"
        />
        <path
          d="M18 14 C34 -10 50 -28 64 -44"
          stroke="var(--champagne)"
          strokeWidth="1"
          fill="none"
        />
      </g>
      {/* a stack of stationery */}
      <g transform="translate(250 158) rotate(-6)">
        <rect width="60" height="10" rx="1.5" fill="var(--ivory)" opacity="0.85" />
        <rect y="-5" x="4" width="56" height="8" rx="1.5" fill="var(--champagne)" />
      </g>
    </svg>
  );
}
