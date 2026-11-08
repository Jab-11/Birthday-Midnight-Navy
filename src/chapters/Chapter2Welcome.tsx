import { Button } from "@/components/Button";
import { Starfield } from "@/components/Starfield";
import copy from "@/content/copy.json";
import { useExperience } from "@/experience/ExperienceContext";
import c from "./common.module.css";
import styles from "./Chapter2.module.css";

const t = copy.chapter2;

export function Chapter2Welcome() {
  const { goNext } = useExperience();

  // Music starts when the candle is blown in Chapter 3, not here.
  const begin = () => {
    goNext();
  };

  return (
    <section className={`${c.stage} ${styles.dawn}`} aria-labelledby="ch2-title">
      <Starfield count={55} seed={22} className={styles.stars} />
      <div className={styles.glow} aria-hidden="true" />
      <Clouds />

      <div className={`${c.inner} ${styles.content}`}>
        <p className={c.eyebrow}>{t.eyebrow}</p>
        <h1 id="ch2-title" className={styles.title}>
          <span className={styles.lineOne}>{t.lineOne}</span>
          <span className={styles.name}>{t.name}</span>
        </h1>
        <p className={styles.lineTwo}>{t.lineTwo}</p>
        <div className={styles.flourish} aria-hidden="true">
          <svg viewBox="0 0 160 20">
            <path
              d="M2 10 C30 2 50 18 80 10 S130 2 158 10"
              fill="none"
              stroke="var(--gold)"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <path
              d="M80 4 l2 4.5 4.5 1.5 -4.5 1.5 -2 4.5 -2 -4.5 -4.5 -1.5 4.5 -1.5z"
              fill="var(--gold-bright)"
            />
          </svg>
        </div>
      </div>

      <div className={c.footer}>
        <Button onClick={begin} className={styles.begin}>
          {t.begin}
        </Button>
      </div>
    </section>
  );
}

function Clouds() {
  return (
    <svg
      className={styles.clouds}
      viewBox="0 0 400 140"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M0 80 C20 60 50 62 64 74 C76 52 116 50 128 72 C146 60 172 64 180 80 C200 66 236 70 240 88 C262 72 300 74 310 92 C330 80 370 82 400 96 V140 H0Z"
        fill="color-mix(in oklab, var(--champagne) 40%, var(--navy-mist))"
        opacity="0.55"
      />
      <path
        d="M0 104 C28 88 60 90 74 102 C92 84 132 86 146 104 C168 92 200 94 214 108 C238 94 280 96 292 110 C318 98 360 100 400 114 V140 H0Z"
        fill="color-mix(in oklab, var(--ivory) 30%, var(--navy-mist))"
        opacity="0.7"
      />
    </svg>
  );
}
