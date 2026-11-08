import { useCallback, useEffect, useRef, useState } from "react";

import { NextButton } from "@/components/Button";
import { Copy } from "@/components/Copy";
import copy from "@/content/copy.json";
import { photos, videos, type Photo, type Video } from "@/content/media";
import { useExperience } from "@/experience/ExperienceContext";
import c from "./common.module.css";
import styles from "./Chapter5.module.css";

const t = copy.chapter5;
const FRAMES = [styles.polaroid, styles.film, styles.matte] as const;

const pad = (n: number) => String(n).padStart(2, "0");
const labelFromId = (id: string) => `[${id.replace(/-/g, "_").toUpperCase()}]`;

export function Chapter5Memories() {
  const { goNext } = useExperience();
  const [phase, setPhase] = useState<"photos" | "videos">(photos.length ? "photos" : "videos");
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [played, setPlayed] = useState(false);
  const [gridOpen, setGridOpen] = useState(false);

  const total = photos.length;

  const next = useCallback(() => {
    setDirection(1);
    if (index < total - 1) setIndex((i) => i + 1);
    else setPhase("videos");
  }, [index, total]);

  const prev = useCallback(() => {
    setDirection(-1);
    setIndex((i) => Math.max(0, i - 1));
  }, []);

  // Desktop keyboard arrows; ignored while typing or when a dialog is open.
  useEffect(() => {
    if (phase !== "photos" || gridOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      const el = e.target as HTMLElement | null;
      if (el?.closest("input, textarea, select, dialog, [contenteditable]")) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, gridOpen, next, prev]);

  const skipToVideos = () => {
    setDirection(1);
    setGridOpen(false);
    setPhase("videos");
  };

  return (
    <section className={`${c.stage} ${styles.cinema}`} aria-labelledby="ch5-title">
      <div className={styles.vignette} aria-hidden="true" />
      <div className={`${c.inner} ${c.wide}`}>
        <p className={c.eyebrow}>{t.eyebrow}</p>
        <h1 id="ch5-title" className="visually-hidden">
          {t.eyebrow}
        </h1>

        {phase === "photos" && total > 0 && gridOpen ? (
          <PhotoGrid
            current={index}
            onPick={(i) => {
              setDirection(1);
              setIndex(i);
              setGridOpen(false);
            }}
            onClose={() => setGridOpen(false)}
            onSkipToVideos={videos.length > 0 ? skipToVideos : null}
          />
        ) : phase === "photos" && total > 0 ? (
          <PhotoStage
            photo={photos[index]!}
            index={index}
            total={total}
            direction={direction}
            onNext={next}
            onPrev={prev}
            onOpenGrid={() => setGridOpen(true)}
            onSkipToVideos={skipToVideos}
          />
        ) : (
          <VideoCollage
            onPlayed={() => setPlayed(true)}
            onBackToPhotos={
              total > 0
                ? () => {
                    setDirection(-1);
                    setIndex(total - 1);
                    setPhase("photos");
                  }
                : null
            }
          />
        )}
      </div>

      <div className={c.footer}>
        {phase === "videos" && played && <NextButton onClick={goNext} />}
      </div>
    </section>
  );
}

function PhotoStage({
  photo,
  index,
  total,
  direction,
  onNext,
  onPrev,
  onOpenGrid,
  onSkipToVideos,
}: {
  photo: Photo;
  index: number;
  total: number;
  direction: 1 | -1;
  onNext: () => void;
  onPrev: () => void;
  onOpenGrid: () => void;
  onSkipToVideos: () => void;
}) {
  const start = useRef<{ x: number; y: number; id: number } | null>(null);
  const isLast = index === total - 1;
  // The photo whooshes away first; the grid opens when that animation ends.
  const [leaving, setLeaving] = useState(false);
  const isLandscape = photo.width > photo.height;

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse") return;
    start.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const s = start.current;
    start.current = null;
    if (!s || s.id !== e.pointerId) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy) * 1.3) return;
    if (dx < 0) onNext();
    else if (index > 0) onPrev();
  };

  return (
    <div className={`${styles.photoArea} ${leaving ? styles.leaving : ""}`}>
      <div
        className={styles.swipe}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (start.current = null)}
      >
        <button
          type="button"
          className={`${styles.arrow} ${styles.arrowSide} ${styles.left}`}
          onClick={onPrev}
          disabled={index === 0}
          aria-label="Previous photo"
        >
          <Chevron dir="left" />
        </button>

        <figure
          key={photo.id}
          className={`${styles.figure} ${FRAMES[index % FRAMES.length]} ${direction > 0 ? styles.fromRight : styles.fromLeft} ${isLandscape ? styles.landscape : ""} ${leaving ? styles.whooshOut : ""}`}
          style={
            {
              "--tilt": `${[-1.5, 1, -0.5, 1.6][index % 4]}deg`,
              "--ratio": photo.width / photo.height,
            } as React.CSSProperties
          }
          onAnimationEnd={(e) => {
            if (leaving && e.target === e.currentTarget) onOpenGrid();
          }}
        >
          <PhotoImage photo={photo} eager={index === 0} />
          {(photo.caption || photo.dateLabel) && (
            <figcaption className={styles.caption}>
              {photo.dateLabel && (
                <span className={styles.date}>
                  <Copy value={photo.dateLabel} />
                </span>
              )}
              {photo.caption && <Copy value={photo.caption} />}
            </figcaption>
          )}
        </figure>

        <button
          type="button"
          className={`${styles.arrow} ${styles.arrowSide} ${styles.right}`}
          onClick={onNext}
          aria-label={isLast ? "Continue to the videos" : "Next photo"}
        >
          <Chevron dir="right" />
        </button>
      </div>

      <div className={styles.controls}>
        <button
          type="button"
          className={`${styles.arrow} ${styles.arrowInline}`}
          onClick={onPrev}
          disabled={index === 0}
          aria-label="Previous photo"
        >
          <Chevron dir="left" />
        </button>
        <p className={styles.progress} aria-label={`Photo ${index + 1} of ${total}`}>
          <span>{pad(index + 1)}</span>
          <span className={styles.progressRule} aria-hidden="true" />
          <span>{pad(total)}</span>
        </p>
        <button
          type="button"
          className={`${styles.arrow} ${styles.arrowInline}`}
          onClick={onNext}
          aria-label={isLast ? "Continue to the videos" : "Next photo"}
        >
          <Chevron dir="right" />
        </button>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.textLink}
          onClick={() => setLeaving(true)}
          disabled={leaving}
        >
          <span aria-hidden="true">←</span> All photos
        </button>
        {videos.length > 0 && (
          <button type="button" className={styles.textLink} onClick={onSkipToVideos}>
            Videos <span aria-hidden="true">→</span>
          </button>
        )}
      </div>
    </div>
  );
}

function PhotoGrid({
  current,
  onPick,
  onClose,
  onSkipToVideos,
}: {
  current: number;
  onPick: (i: number) => void;
  onClose: () => void;
  onSkipToVideos: (() => void) | null;
}) {
  const currentRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    currentRef.current?.focus({ preventScroll: true });
    currentRef.current?.scrollIntoView({ block: "center" });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className={styles.gridArea}>
      <div className={styles.gridBar}>
        <button type="button" className={styles.textLink} onClick={onClose}>
          <span aria-hidden="true">←</span> Slideshow
        </button>
        {onSkipToVideos && (
          <button type="button" className={styles.textLink} onClick={onSkipToVideos}>
            Videos <span aria-hidden="true">→</span>
          </button>
        )}
      </div>

      <ul className={styles.masonry}>
        {photos.map((p, i) => (
          <li
            key={p.id}
            className={styles.masonryItem}
            style={{ "--i": Math.min(i, 14) } as React.CSSProperties}
          >
            <button
              type="button"
              ref={i === current ? currentRef : undefined}
              className={`${styles.tile} ${i === current ? styles.tileCurrent : ""}`}
              onClick={() => onPick(i)}
              aria-label={`Open photo ${i + 1} of ${photos.length}: ${p.alt}`}
            >
              {p.src ? (
                <img
                  className={styles.tileImg}
                  src={p.src}
                  alt=""
                  width={p.width}
                  height={p.height}
                  loading="lazy"
                  decoding="async"
                  style={{ aspectRatio: `${p.width} / ${p.height}` }}
                  draggable={false}
                />
              ) : (
                <span
                  className={`${styles.tileImg} ${styles.photoPlaceholder}`}
                  style={{ aspectRatio: `${p.width} / ${p.height}` }}
                  aria-hidden="true"
                />
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PhotoImage({ photo, eager }: { photo: Photo; eager: boolean }) {
  const [failed, setFailed] = useState(false);
  const ratio = `${photo.width} / ${photo.height}`;

  if (!photo.src || failed) {
    return (
      <div
        className={styles.photoPlaceholder}
        style={{ aspectRatio: ratio }}
        role="img"
        aria-label={photo.alt}
      >
        <svg viewBox="0 0 48 48" width="40" height="40" aria-hidden="true">
          <rect
            x="6"
            y="10"
            width="36"
            height="28"
            rx="3"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <circle cx="18" cy="21" r="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8 34l10-9 8 7 6-5 9 7" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <span className="placeholder">{failed ? "Photo unavailable" : labelFromId(photo.id)}</span>
      </div>
    );
  }

  return (
    <img
      className={styles.photo}
      src={photo.src}
      alt={photo.alt}
      width={photo.width * 200}
      height={photo.height * 200}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      style={{ aspectRatio: ratio, objectPosition: photo.focus }}
      onError={() => setFailed(true)}
      draggable={false}
    />
  );
}

function VideoCollage({
  onPlayed,
  onBackToPhotos,
}: {
  onPlayed: () => void;
  onBackToPhotos: (() => void) | null;
}) {
  const { music } = useExperience();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [active, setActive] = useState<Video | null>(null);
  const [failed, setFailed] = useState(false);

  const open = (v: Video, trigger: HTMLButtonElement) => {
    triggerRef.current = trigger;
    setFailed(false);
    setActive(v);
    dialogRef.current?.showModal();
    // Chosen by her tap, so starting playback here is user-initiated.
    requestAnimationFrame(() => void videoRef.current?.play().catch(() => undefined));
  };

  const close = () => dialogRef.current?.close();

  const onDialogClose = () => {
    videoRef.current?.pause();
    music.setDucked(false);
    setActive(null);
    triggerRef.current?.focus();
  };

  return (
    <div className={`${styles.collage} ${c.fadeIn}`}>
      <h2 className={styles.collageTitle}>
        <Copy value={t.videosTitle} />
      </h2>
      {videos.length > 0 && <p className={c.hint}>{t.videosHint}</p>}

      <ul className={styles.posters}>
        {videos.map((v, i) => {
          const ratios = ["3 / 4", "4 / 5", "3 / 5", "1 / 1", "4 / 5", "3 / 4", "3 / 5", "1 / 1"];
          return (
            <li key={v.id}>
              <button
                type="button"
                className={styles.poster}
                onClick={(e) => open(v, e.currentTarget)}
                aria-label={`Play video: ${v.title}`}
              >
                <span className={styles.sprockets} aria-hidden="true" />

                <span
                  className={styles.posterMedia}
                  style={
                    {
                      "--poster-ratio": ratios[i % ratios.length],
                    } as React.CSSProperties
                  }
                >
                  {v.src ? (
                    <video
                      className={styles.posterImg}
                      src={v.src}
                      muted
                      playsInline
                      preload="metadata"
                      aria-hidden="true"
                      tabIndex={-1}
                    />
                  ) : (
                    <span className={styles.posterImg} />
                  )}
                </span>

                <span className={styles.play} aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="22" height="22">
                    <path d="M8 5v14l11-7z" fill="currentColor" />
                  </svg>
                </span>

                <span className={styles.posterTitle}>
                  <Copy value={v.title} />
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {onBackToPhotos && (
        <button type="button" className={styles.textLink} onClick={onBackToPhotos}>
          <span aria-hidden="true">←</span> Back to the photos
        </button>
      )}

      <dialog
        ref={dialogRef}
        className={styles.lightbox}
        onClose={onDialogClose}
        onClick={(e) => e.target === e.currentTarget && close()}
        aria-label={active ? active.title : "Video"}
      >
        <div className={styles.lightboxInner}>
          <button type="button" className={styles.close} onClick={close} aria-label="Close video">
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
          {active && !failed && (
            <video
              ref={videoRef}
              key={active.id}
              className={styles.video}
              src={active.src ?? undefined}
              poster={active.poster ?? undefined}
              controls
              playsInline
              preload="none"
              aria-label={active.description}
              onPlay={() => {
                music.setDucked(true);
                onPlayed();
              }}
              onPause={() => music.setDucked(false)}
              onEnded={() => music.setDucked(false)}
              onError={() => setFailed(true)}
            />
          )}
          {active && failed && (
            <div className={styles.videoFailed}>
              <p>This video could not be played.</p>
            </div>
          )}
          {active && (
            <p className={styles.videoDesc}>
              <Copy value={active.description} />
            </p>
          )}
        </div>
      </dialog>
    </div>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path
        d={dir === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
