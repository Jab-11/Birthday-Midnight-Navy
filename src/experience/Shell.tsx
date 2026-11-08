import { Chapter1Countdown } from "@/chapters/Chapter1Countdown";
import { Chapter2Welcome } from "@/chapters/Chapter2Welcome";
import { Chapter3Cake } from "@/chapters/Chapter3Cake";
import { Chapter4Cards } from "@/chapters/Chapter4Cards";
import { Chapter5Memories } from "@/chapters/Chapter5Memories";
import { Chapter6Wishes } from "@/chapters/Chapter6Wishes";
import { Chapter7Letter } from "@/chapters/Chapter7Letter";
import { Chapter8Finale } from "@/chapters/Chapter8Finale";
import type { ChapterNumber } from "@/lib/rules";
import { useExperience } from "./ExperienceContext";
import { MusicControl } from "./MusicControl";
import styles from "./Shell.module.css";

const CHAPTERS: Record<ChapterNumber, () => React.JSX.Element> = {
  1: Chapter1Countdown,
  2: Chapter2Welcome,
  3: Chapter3Cake,
  4: Chapter4Cards,
  5: Chapter5Memories,
  6: Chapter6Wishes,
  7: Chapter7Letter,
  8: Chapter8Finale,
};

/** Light chapters get ink-coloured controls; the rest are night scenes. */
const LIGHT: ReadonlySet<ChapterNumber> = new Set<ChapterNumber>([3, 4]);

export function Shell() {
  const { chapter, goBack, runId } = useExperience();
  const Scene = CHAPTERS[chapter];

  return (
    <div className={styles.shell} data-tone={LIGHT.has(chapter) ? "light" : "dark"}>
      <header className={styles.bar}>
        {chapter > 1 ? (
          <button type="button" className={styles.iconButton} onClick={goBack} aria-label="Back">
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <path
                d="M15 5l-7 7 7 7"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        ) : (
          <span />
        )}
        <MusicControl buttonClassName={styles.iconButton!} pillClassName={styles.pill!} />
      </header>

      <main key={`${runId}-${chapter}`} className={styles.scene}>
        <Scene />
      </main>
    </div>
  );
}
