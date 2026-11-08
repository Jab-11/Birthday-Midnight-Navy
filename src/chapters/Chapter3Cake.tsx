import { useState } from "react";
import { NextButton } from "@/components/Button";
import { Copy } from "@/components/Copy";
import copy from "@/content/copy.json";
import { useExperience } from "@/experience/ExperienceContext";
import c from "./common.module.css";
import styles from "./Chapter3.module.css";

const t = copy.chapter3;
// const CANDLES = [
//   { x: 150, h: 46, stripe: "var(--dusty-blue)" },
//   { x: 200, h: 54, stripe: "var(--gold)" },
//   { x: 250, h: 46, stripe: "var(--dusty-blue)" },
// ];
const BIRTHDAY_AGE = 24;

export function Chapter3Cake() {
  const { goNext, music } = useExperience();
  const [blown, setBlown] = useState(false);

  const handleBlow = () => {
    setBlown(true);

    music.playBirthday();
  };

  return (
    <section className={`${c.stage} ${c.light} ${styles.room}`} aria-labelledby="ch3-title">
      <Bunting />
      <div className={`${c.inner} ${styles.content}`}>
        <p className={c.eyebrow}>{t.eyebrow}</p>
        <h1 id="ch3-title" className="visually-hidden">
          {t.eyebrow}
        </h1>

        <button
          type="button"
          className={styles.cakeButton}
          onClick={handleBlow}
          disabled={blown}
          aria-label={blown ? "Candles blown out" : "Blow out the candles"}
        >
          <Cake blown={blown} />
        </button>

        <p className={styles.status} aria-live="polite">
          {blown ? <Copy value={t.afterBlow} /> : <span className={c.hint}>{t.hint}</span>}
        </p>
      </div>

      <div className={c.footer}>{blown && <NextButton onClick={goNext} variant="ink" />}</div>
    </section>
  );
}

function Cake({ blown }: { blown: boolean }) {
  return (
    <svg
      viewBox="0 0 400 400"
      className={`${styles.cake} ${blown ? styles.blown : ""}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="cakeBody" x1="0" x2="1">
          <stop offset="0" stopColor="var(--cocoa-dark)" />
          <stop offset="0.35" stopColor="var(--cocoa)" />
          <stop offset="0.7" stopColor="var(--cocoa-light)" />
          <stop offset="1" stopColor="var(--cocoa-dark)" />
        </linearGradient>
        <linearGradient id="ganache" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--cocoa-ganache)" />
          <stop offset="1" stopColor="var(--cocoa-dark)" />
        </linearGradient>
        <radialGradient id="flameGrad" cx="50%" cy="70%" r="60%">
          <stop offset="0" stopColor="var(--ivory)" />
          <stop offset="0.45" stopColor="var(--flame)" />
          <stop offset="1" stopColor="var(--gold)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="candleHalo">
          <stop offset="0" stopColor="var(--flame)" stopOpacity="0.55" />
          <stop offset="1" stopColor="var(--flame)" stopOpacity="0" />
        </radialGradient>
        <pattern
          id="waxStripes"
          width="16"
          height="16"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(-35)"
        >
          <rect width="16" height="16" fill="var(--ivory)" />
          <rect width="6" height="16" fill="var(--dusty-blue)" opacity="0.85" />
        </pattern>
        <linearGradient id="waxShine" x1="0" x2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0.18" />
          <stop offset="0.3" stopColor="#fff" stopOpacity="0.45" />
          <stop offset="0.55" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.22" />
        </linearGradient>
      </defs>

      {/* warm halo behind the candles */}
      {/* <ellipse cx="200" cy="120" rx="150" ry="90" fill="url(#candleHalo)" className={styles.halo} /> */}

      {/* cake stand */}
      <ellipse cx="200" cy="352" rx="168" ry="20" fill="var(--paper-shade)" />
      <ellipse
        cx="200"
        cy="346"
        rx="168"
        ry="20"
        fill="var(--ivory)"
        stroke="var(--gold)"
        strokeWidth="2"
      />
      <path d="M180 360 h40 l10 28 h-60z" fill="var(--champagne)" />

      {/* bottom tier */}
      <path d="M62 250 h276 v86 c0 10 -62 18 -138 18 s-138 -8 -138 -18z" fill="url(#cakeBody)" />
      <path d="M62 280 h276" stroke="var(--cocoa-dark)" strokeWidth="3" opacity="0.55" />
      <path d="M62 300 h276" stroke="var(--cocoa-highlight)" strokeWidth="2" opacity="0.5" />
      {/* bottom ganache with drips */}
      <path
        d="M58 250 c0 -12 64 -20 142 -20 s142 8 142 20 v6 c-8 0 -10 18 -18 18 s-8 -14 -18 -14 s-6 26 -16 26 s-8 -22 -18 -22 s-8 12 -18 12 s-8 -16 -18 -16 s-6 30 -18 30 s-8 -26 -18 -26 s-8 10 -18 10 s-8 -14 -18 -14 s-6 22 -16 22 s-8 -18 -18 -18 s-8 12 -18 12 s-8 -18 -18 -18 s-6 14 -14 14 s-8 -18 -14 -18z"
        fill="url(#ganache)"
      />

      {/* top tier */}
      <path d="M102 166 h196 v76 c0 8 -44 14 -98 14 s-98 -6 -98 -14z" fill="url(#cakeBody)" />
      <path d="M102 202 h196" stroke="var(--cocoa-highlight)" strokeWidth="2" opacity="0.5" />
      <path
        d="M98 166 c0 -10 46 -16 102 -16 s102 6 102 16 v4 c-6 0 -8 16 -16 16 s-6 -12 -14 -12 s-6 22 -14 22 s-6 -18 -14 -18 s-6 10 -14 10 s-6 -14 -14 -14 s-6 24 -14 24 s-6 -20 -14 -20 s-6 8 -14 8 s-6 -14 -14 -14 s-4 18 -12 18 s-6 -16 -14 -16z"
        fill="url(#ganache)"
      />
      <ellipse cx="200" cy="160" rx="100" ry="12" fill="var(--cocoa-ganache)" />
      <ellipse cx="186" cy="156" rx="46" ry="3" fill="var(--cocoa-shine)" opacity="0.7" />

      {/* chocolate curls + gold sprinkles */}
      {[118, 140, 262, 284].map((x, i) => (
        <path
          key={x}
          d={`M${x} ${162 - (i % 2) * 4} q8 -10 16 0 q-8 6 -16 0z`}
          fill="var(--cocoa-deepest)"
          stroke="var(--cocoa-shine)"
          strokeWidth="1"
        />
      ))}
      {[
        [90, 296],
        [130, 318],
        [176, 300],
        [228, 322],
        [270, 298],
        [312, 316],
        [150, 214],
        [244, 220],
        [200, 236],
      ].map(([x, y], i) => (
        <rect
          key={i}
          x={x}
          y={y}
          width="7"
          height="2.4"
          rx="1.2"
          fill="var(--gold-bright)"
          transform={`rotate(${(i * 47) % 180} ${x} ${y})`}
        />
      ))}
      {/* a small piped heart, in chocolate */}
      <path
        d="M200 296 c-6 -10 -20 -4 -14 6 l14 12 l14 -12 c6 -10 -8 -16 -14 -6z"
        fill="var(--cocoa-deepest)"
        stroke="var(--cocoa-highlight)"
        strokeWidth="1.2"
      />

      {/* candles */}
      {/* number candles: one per digit */}
      {String(BIRTHDAY_AGE)
        .split("")
        .map((digit, i, arr) => {
          const cx = 200 + (i - (arr.length - 1) / 2) * 62;
          const textProps = {
            x: cx,
            y: 156,
            textAnchor: "middle" as const,
            fontSize: 84,
            fontFamily: "'Arial Black', 'Helvetica Neue', Impact, sans-serif",
            style: { fontVariantNumeric: "lining-nums" } as React.CSSProperties,
          };
          return (
            <g key={i}>
              {/* glow */}
              <ellipse
                cx={cx}
                cy="82"
                rx="44"
                ry="44"
                fill="url(#candleHalo)"
                className={styles.halo}
              />

              {/* thickness / extrusion */}
              <text
                {...textProps}
                x={cx + 3}
                y={159}
                fill="var(--gold-deep)"
                stroke="var(--gold-deep)"
                strokeWidth="3"
                strokeLinejoin="round"
              >
                {digit}
              </text>
              {/* striped wax */}
              <text
                {...textProps}
                fill="url(#waxStripes)"
                stroke="var(--gold)"
                strokeWidth="1.5"
                strokeLinejoin="round"
              >
                {digit}
              </text>
              {/* cylindrical shine */}
              <text {...textProps} fill="url(#waxShine)">
                {digit}
              </text>

              {/* wick */}
              <path
                d="M0 97 v-11"
                transform={`translate(${cx} 0)`}
                stroke="var(--cocoa-dark)"
                strokeWidth="2"
                strokeLinecap="round"
              />

              {/* flame (local coords, shifted to this digit) */}
              <g transform={`translate(${cx - 200} 5)`}>
                <g
                  className={styles.flame}
                  style={{ transformOrigin: "200px 83px", animationDelay: `${i * 0.25}s` }}
                >
                  <ellipse cx="200" cy="68" rx="17" ry="21" fill="url(#candleHalo)" />
                  <path
                    d="M200 52 c10 13 12 23 7 31 c-4 6 -11 6 -15 0 c-5 -8 -2 -18 8 -31z"
                    fill="url(#flameGrad)"
                  />
                </g>
                {/* smoke after blowing */}
                <g className={styles.smoke} style={{ animationDelay: `${i * 0.12}s` }}>
                  <path
                    d="M200 78 c-8 -10 8 -17 0 -27 c-8 -10 8 -17 0 -27"
                    fill="none"
                    stroke="var(--dusty-blue)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </g>
              </g>
            </g>
          );
        })}
      {/* {CANDLES.map((cd, i) => (
        <g key={cd.x}>
          <rect x={cd.x - 6} y={156 - cd.h} width="12" height={cd.h} rx="3" fill="var(--ivory)" />
          {Array.from({ length: 4 }, (_, k) => (
            <path
              key={k}
              d={`M${cd.x - 6} ${156 - cd.h + 8 + k * 11} l12 -6 v4 l-12 6z`}
              fill={cd.stripe}
              opacity="0.85"
            />
          ))}
          <path
            d={`M${cd.x} ${156 - cd.h} v-6`}
            stroke="var(--cocoa-dark)"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <g
            className={styles.flame}
            style={{ animationDelay: `${i * 0.23}s`, transformOrigin: `${cd.x}px ${150 - cd.h}px` }}
          >
            <ellipse cx={cd.x} cy={136 - cd.h} rx="16" ry="20" fill="url(#candleHalo)" />
            <path
              d={`M${cd.x} ${118 - cd.h} c8 10 10 18 6 24 c-3 4 -9 4 -12 0 c-4 -6 -2 -14 6 -24z`}
              fill="url(#flameGrad)"
            />
          </g>
          <g className={styles.smoke} style={{ animationDelay: `${i * 0.12}s` }}>
            <path
              d={`M${cd.x} ${146 - cd.h} c-6 -8 6 -14 0 -22 c-6 -8 6 -14 0 -22`}
              fill="none"
              stroke="var(--dusty-blue)"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </g>
        </g>
      ))} */}
    </svg>
  );
}

function Bunting() {
  const flags = Array.from({ length: 11 }, (_, i) => i);
  return (
    <svg
      className={styles.bunting}
      viewBox="0 0 400 60"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path d="M0 6 Q200 46 400 6" fill="none" stroke="var(--gold-deep)" strokeWidth="1" />
      {flags.map((i) => {
        const x = 18 + i * 34;
        const tt = x / 400;
        const y = 6 + 40 * 2 * tt * (1 - tt);
        return (
          <path
            key={i}
            d={`M${x - 10} ${y} L${x + 10} ${y} L${x} ${y + 20}z`}
            fill={["var(--gold)", "var(--dusty-blue)", "var(--champagne)"][i % 3]}
          />
        );
      })}
    </svg>
  );
}
