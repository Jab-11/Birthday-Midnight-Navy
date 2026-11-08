import { useRef, useState } from "react";

import { Button } from "@/components/Button";
import { Copy } from "@/components/Copy";
import { Starfield } from "@/components/Starfield";
import copy from "@/content/copy.json";
import { FINALE_VIDEO } from "@/content/media";
import { useExperience } from "@/experience/ExperienceContext";
import c from "./common.module.css";
import styles from "./Chapter8.module.css";

const t = copy.chapter8;

export function Chapter8Finale() {
  const { restart } = useExperience();

  const videoRef = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  const [playing, setPlaying] = useState(false);

  const src = failed ? null : FINALE_VIDEO;

  const playVideo = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.ended) {
      video.currentTime = 0;
    }

    void video.play().catch(() => setPlaying(false));
  };

  return (
    <section className={`${c.stage} ${styles.night}`} aria-labelledby="ch8-title">
      <Starfield count={80} seed={81} className={styles.stars} />
      <div className={styles.glow} aria-hidden="true" />

      <div className={`${c.inner} ${styles.inner}`}>
        <p className={c.eyebrow}>{t.eyebrow}</p>

        <h1 id="ch8-title" className="visually-hidden">
          {t.eyebrow}
        </h1>

        <p className={styles.message}>
          <Copy value={t.finalMessage} />
        </p>

        {src ? (
          <div className={styles.videoFrame}>
            <video
              ref={videoRef}
              className={styles.gif}
              src={src}
              playsInline
              preload="metadata"
              aria-label={t.gifAlt}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onEnded={() => setPlaying(false)}
              onError={() => setFailed(true)}
            />

            {!playing && (
              <button
                type="button"
                className={styles.customPlay}
                onClick={playVideo}
                aria-label={
                  videoRef.current?.ended ? "Replay birthday video" : "Play birthday video"
                }
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8 5v14l11-7z" fill="currentColor" />
                </svg>
              </button>
            )}
          </div>
        ) : (
          <div className={styles.frame} role="img" aria-label={t.gifAlt}>
            <Copy value={t.gifAlt} />
          </div>
        )}
      </div>

      <div className={c.footer}>
        <Button onClick={restart}>{t.restart}</Button>
      </div>
    </section>
  );
}
