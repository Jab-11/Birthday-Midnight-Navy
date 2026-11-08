import { useEffect, useState } from "react";

import { read, write, type StorageMode } from "@/lib/storage";

import { NextButton } from "@/components/Button";
import { Copy } from "@/components/Copy";
import copy from "@/content/copy.json";
import { useExperience } from "@/experience/ExperienceContext";
import c from "./common.module.css";
import styles from "./Chapter4.module.css";

const t = copy.chapter4;

/** Storage holds strings, so the read-card ids are kept as JSON. Anything malformed means "none read". */
function readSeen(mode: StorageMode): string[] {
  try {
    const parsed: unknown = JSON.parse(read(mode, "chapter4Seen") ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

/** Per-card scrapbook variety: height, tilt, paper and doodle. Heights are fixed so flips never shift the masonry. */
const LOOK = [
  { h: styles.h1, tilt: -1.6, paper: styles.ivory, doodle: "star", tape: styles.tapeLeft },
  { h: styles.h2, tilt: 1.2, paper: styles.blue, doodle: "heart", tape: styles.tapeCenter },
  { h: styles.h3, tilt: -0.8, paper: styles.champagne, doodle: "flower", tape: styles.tapeRight },
  { h: styles.h4, tilt: 1.8, paper: styles.ivory, doodle: "swirl", tape: styles.tapeCenter },
  { h: styles.h5, tilt: -1.2, paper: styles.champagne, doodle: "sun", tape: styles.tapeLeft },
  { h: styles.h6, tilt: 0.9, paper: styles.blue, doodle: "leaf", tape: styles.tapeRight },
] as const;

export function Chapter4Cards() {
  const { goNext, mode } = useExperience();

  // Remember which cards have been read, even after leaving this chapter.
  const [seenIds, setSeenIds] = useState<string[]>(() => readSeen(mode));
  // Flipped state is temporary; cards start face-down when returning.
  const [flipped, setFlipped] = useState<boolean[]>(() => t.cards.map(() => false));

  const seen = t.cards.map((card) => seenIds.includes(card.id));
  const allSeen = t.cards.every((card) => seenIds.includes(card.id));

  // Persist whenever the read-card list changes.
  useEffect(() => {
    write(mode, "chapter4Seen", JSON.stringify(seenIds));
  }, [mode, seenIds]);

  const toggle = (i: number) => {
    const cardId = t.cards[i]!.id;

    setFlipped((f) => f.map((v, j) => (j === i ? !v : v)));

    setSeenIds((ids) => (ids.includes(cardId) ? ids : [...ids, cardId]));
  };

  return (
    <section className={`${c.stage} ${c.light} ${styles.table}`} aria-labelledby="ch4-title">
      <div className={`${c.inner} ${c.wide}`}>
        <h1 id="ch4-title" className={styles.heading}>
          {t.eyebrow}
        </h1>
        <p className={c.hint}>{t.hint}</p>

        <ul className={styles.masonry}>
          {t.cards.map((card, i) => {
            const look = LOOK[i % LOOK.length]!;
            const isFlipped = flipped[i] ?? false;
            return (
              <li
                key={card.id}
                className={`${styles.item} ${look.h}`}
                style={{ "--tilt": `${look.tilt}deg` } as React.CSSProperties}
              >
                <button
                  type="button"
                  className={`${styles.card} ${isFlipped ? styles.flipped : ""}`}
                  onClick={() => toggle(i)}
                  aria-pressed={isFlipped}
                >
                  <span
                    className={`${styles.face} ${styles.front} ${look.paper}`}
                    aria-hidden={isFlipped}
                  >
                    <span className={`${styles.tape} ${look.tape}`} />
                    <Doodle kind={look.doodle} />
                    <span className={styles.title}>{card.title}</span>
                    {seen[i] && (
                      <span className={styles.seen}>
                        <span aria-hidden="true">✓</span> read
                      </span>
                    )}
                  </span>
                  <span className={`${styles.face} ${styles.back}`} aria-hidden={!isFlipped}>
                    <span className={styles.backTitle}>{card.title}</span>
                    <span className={styles.message}>
                      <Copy value={card.message} />
                    </span>
                    <PressedFlower />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className={c.footer}>{allSeen && <NextButton onClick={goNext} variant="ink" />}</div>
    </section>
  );
}

function Doodle({ kind }: { kind: string }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  return (
    <svg className={styles.doodle} viewBox="0 0 48 48" aria-hidden="true">
      {kind === "star" && (
        <path {...common} d="M24 6l5 12 13 1-10 8 3 13-11-7-11 7 3-13-10-8 13-1z" />
      )}
      {kind === "heart" && (
        <path {...common} d="M24 40S8 30 8 18a8 8 0 0116-3 8 8 0 0116 3c0 12-16 22-16 22z" />
      )}
      {kind === "flower" && (
        <g {...common}>
          <circle cx="24" cy="20" r="4" />
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse key={a} cx="24" cy="11" rx="4.5" ry="6" transform={`rotate(${a} 24 20)`} />
          ))}
          <path d="M24 26v16M24 36c-4-4-8-4-10-2" />
        </g>
      )}
      {kind === "swirl" && (
        <path {...common} d="M24 24c0-3 4-3 4 0s-4 6-8 4-4-10 2-12 14 2 14 10-8 14-16 12" />
      )}
      {kind === "sun" && (
        <g {...common}>
          <circle cx="24" cy="24" r="7" />
          {Array.from({ length: 8 }, (_, i) => (
            <path key={i} d="M24 8v5" transform={`rotate(${i * 45} 24 24)`} />
          ))}
        </g>
      )}
      {kind === "leaf" && (
        <path {...common} d="M10 38C10 20 22 10 40 10c0 18-10 28-28 28zM10 38l18-18" />
      )}
    </svg>
  );
}

function PressedFlower() {
  return (
    <svg className={styles.flower} viewBox="0 0 40 60" aria-hidden="true">
      <path d="M20 58V26" stroke="var(--gold-deep)" strokeWidth="1.2" fill="none" />
      <path
        d="M20 44c-6-2-9-6-9-10 5 0 8 4 9 10zM20 38c5-2 8-6 8-10-5 0-8 4-8 10z"
        fill="var(--dusty-blue)"
        opacity="0.7"
      />
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <ellipse
          key={a}
          cx="20"
          cy="12"
          rx="3.6"
          ry="7"
          fill="var(--champagne)"
          opacity="0.85"
          transform={`rotate(${a} 20 18)`}
        />
      ))}
      <circle cx="20" cy="18" r="3" fill="var(--gold)" />
    </svg>
  );
}
