import emailjs from "@emailjs/browser";
import { useEffect, useId, useRef, useState } from "react";

import { Button, NextButton } from "@/components/Button";
import { Copy } from "@/components/Copy";
import { Starfield } from "@/components/Starfield";
import copy from "@/content/copy.json";
import { useExperience } from "@/experience/ExperienceContext";
import { validateWish, WISH_MAX_LENGTH } from "@/lib/rules";
import { read, write, type StorageMode } from "@/lib/storage";
import c from "./common.module.css";
import styles from "./Chapter6.module.css";

const t = copy.chapter6;
type Chapter6Progress = {
  part: "form" | "stars";
  explored: boolean[];
  openedOrder: number[];
  showFinal: boolean;
};

const getChapter6Progress = (mode: StorageMode): Chapter6Progress => {
  const defaults: Chapter6Progress = {
    part: "form",
    explored: t.stars.map(() => false),
    openedOrder: [],
    showFinal: false,
  };

  const raw = read(mode, "chapter6Progress");
  if (!raw) return defaults;

  try {
    const saved = JSON.parse(raw) as Partial<Chapter6Progress>;

    const explored = Array.isArray(saved.explored)
      ? t.stars.map((_, i) => saved.explored?.[i] === true)
      : defaults.explored;

    const openedOrder = Array.isArray(saved.openedOrder)
      ? [...new Set(saved.openedOrder)].filter(
          (i): i is number =>
            Number.isInteger(i) && i >= 0 && i < t.stars.length && explored[i] === true,
        )
      : [];

    return {
      part: saved.part === "stars" || saved.part === "form" ? saved.part : defaults.part,
      explored,
      openedOrder,
      showFinal: saved.showFinal === true && explored.every(Boolean),
    };
  } catch {
    return defaults;
  }
};
type SendStatus = "idle" | "sending" | "sent" | "failed";

export function Chapter6Wishes() {
  const { mode, setBackOverride } = useExperience();
  const [progress] = useState(() => getChapter6Progress(mode));

  const [part, setPart] = useState<"form" | "stars">(progress.part);
  const [saved] = useState<string | null>(() => read(mode, "wish"));
  const [hasSaved, setHasSaved] = useState(() => !!read(mode, "wish"));
  const [text, setText] = useState(() => read(mode, "draft") ?? saved ?? "");
  const [status, setStatus] = useState<SendStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const [explored, setExplored] = useState<boolean[]>(progress.explored);
  const [openedOrder, setOpenedOrder] = useState<number[]>(progress.openedOrder);
  const [showFinal, setShowFinal] = useState(progress.showFinal);

  // Back from the constellation returns to the wish form (D-19).
  useEffect(() => {
    setBackOverride(part === "stars" ? () => setPart("form") : null);
    return () => setBackOverride(null);
  }, [part, setBackOverride]);

  useEffect(() => {
    const progress: Chapter6Progress = {
      part,
      explored,
      openedOrder,
      showFinal,
    };

    write(mode, "chapter6Progress", JSON.stringify(progress));
  }, [mode, part, explored, openedOrder, showFinal]);

  const onChange = (value: string) => {
    const capped = value.slice(0, WISH_MAX_LENGTH);
    setText(capped);
    write(mode, "draft", capped);
    if (error) setError(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const checked = validateWish(text);
    if (!checked.ok) {
      setError(
        checked.reason === "too_long"
          ? `Please keep it under ${WISH_MAX_LENGTH} characters.`
          : "Please write your wish first.",
      );
      return;
    }
    // The browser keeps her latest wish regardless of the send result.
    write(mode, "wish", checked.wish);
    write(mode, "draft", checked.wish);
    setHasSaved(true);
    setStatus("sending");

    // Logs never include the wish text or the keys: only lengths, presence and status codes.
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
    console.info("[wish] saved locally, sending email", {
      length: checked.wish.length,
      configured: { serviceId: !!serviceId, templateId: !!templateId, publicKey: !!publicKey },
    });
    if (!serviceId || !templateId || !publicKey) {
      console.warn("[wish] EmailJS env vars are missing; check .env and restart the dev server.");
    }

    const startedAt = performance.now();
    try {
      const res = await emailjs.send(
        serviceId,
        templateId,
        {
          name: "Eli",
          time: new Date().toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            dateStyle: "medium",
            timeStyle: "short",
          }),
          message: checked.wish,
          email: "christianjabarson@gmail.com",
        },
        { publicKey },
      );
      console.info("[wish] email sent", {
        status: res.status,
        text: res.text,
        ms: Math.round(performance.now() - startedAt),
      });
      setStatus("sent");
    } catch (err) {
      // EmailJS rejects with { status, text } for server answers, a plain string for bad inputs,
      // and a TypeError when the request never completes (blocked, offline, CORS).
      // Log those only, never the payload.
      const e = err as { status?: number; text?: string } | null;
      console.error("[wish] email could not be sent", err, {
        status: e?.status,
        text: e?.text,
        thrown:
          typeof err === "string"
            ? err
            : err instanceof Error
              ? `${err.name}: ${err.message}`
              : undefined,
        ms: Math.round(performance.now() - startedAt),
      });
      setStatus("failed");
    }
    console.info("[wish] continuing to the constellation");

    // Continue to the constellation even if email delivery fails.
    setPart("stars");
  };

  return (
    <section
      className={`${c.stage} ${part === "form" ? styles.dusk : styles.night}`}
      aria-labelledby="ch6-title"
    >
      <Starfield count={part === "form" ? 40 : 90} seed={66} />
      <div className={`${c.inner} ${styles.inner}`}>
        <p className={c.eyebrow}>{t.eyebrow}</p>
        {part === "form" ? (
          <WishForm
            text={text}
            onChange={onChange}
            onSubmit={submit}
            sending={status === "sending"}
            error={error}
            canOpenStars={hasSaved && status !== "sending"}
            onOpenStars={() => setPart("stars")}
          />
        ) : (
          <Constellation
            status={status}
            explored={explored}
            setExplored={setExplored}
            openedOrder={openedOrder}
            setOpenedOrder={setOpenedOrder}
            showFinal={showFinal}
            setShowFinal={setShowFinal}
          />
        )}
      </div>
    </section>
  );
}

function WishForm({
  text,
  onChange,
  onSubmit,
  sending,
  error,
  canOpenStars,
  onOpenStars,
}: {
  text: string;
  onChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  sending: boolean;
  error: string | null;
  canOpenStars: boolean;
  onOpenStars: () => void;
}) {
  const id = useId();
  const atLimit = text.length >= WISH_MAX_LENGTH;
  return (
    <form className={`${styles.form} ${c.fadeIn}`} onSubmit={onSubmit} noValidate>
      <h1 id="ch6-title" className={styles.prompt}>
        <span className={styles.promptOne}>{t.promptOne}</span>
        <span className={styles.promptTwo}>{t.promptTwo}</span>
      </h1>

      <label htmlFor={`${id}-wish`} className="visually-hidden">
        Your wish
      </label>
      <div className={styles.paper}>
        <textarea
          id={`${id}-wish`}
          className={styles.textarea}
          value={text}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t.fieldPlaceholder}
          maxLength={WISH_MAX_LENGTH}
          rows={7}
          aria-invalid={!!error}
          aria-describedby={`${id}-count ${error ? `${id}-error` : ""}`}
        />
      </div>
      <div className={styles.meta}>
        <p id={`${id}-error`} className={styles.error} role="alert">
          {error}
        </p>
        <p id={`${id}-count`} className={`${styles.count} ${atLimit ? styles.limit : ""}`}>
          {text.length} / {WISH_MAX_LENGTH}
          {atLimit && <span className="visually-hidden"> — limit reached</span>}
        </p>
      </div>
      <p className="visually-hidden" aria-live="polite">
        {atLimit ? `You have reached the ${WISH_MAX_LENGTH} character limit.` : ""}
      </p>

      <div className={styles.formActions}>
        <Button type="submit" disabled={sending} aria-busy={sending}>
          {sending ? "Sending…" : t.submit}
        </Button>
        {canOpenStars && (
          <Button variant="ghost" onClick={onOpenStars}>
            {t.openStars}
          </Button>
        )}
      </div>
    </form>
  );
}

/** Five star positions on a gentle arc (percent of the sky box). */
const POS = [
  { x: 16, y: 62 },
  { x: 34, y: 30 },
  { x: 54, y: 52 },
  { x: 72, y: 22 },
  { x: 86, y: 56 },
];

function Constellation({
  status,
  explored,
  setExplored,
  openedOrder,
  setOpenedOrder,
  showFinal,
  setShowFinal,
}: {
  status: SendStatus;
  explored: boolean[];
  setExplored: React.Dispatch<React.SetStateAction<boolean[]>>;
  openedOrder: number[];
  setOpenedOrder: React.Dispatch<React.SetStateAction<number[]>>;
  showFinal: boolean;
  setShowFinal: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { goNext } = useExperience();
  const [selected, setSelected] = useState<number | null>(null);

  const allOpen = explored.every(Boolean);
  const count = explored.filter(Boolean).length;

  const openStar = (i: number) => {
    setSelected(i);
    setExplored((e) => e.map((v, j) => (j === i ? true : v)));

    setOpenedOrder((order) => [i, ...order.filter((index) => index !== i)]);
  };

  return (
    <div className={`${styles.constellation} ${c.fadeIn}`}>
      {status === "sent" && (
        <p className={styles.sendNote} role="status">
          <Copy value={t.sentText} />
        </p>
      )}

      {status === "failed" && (
        <p className={styles.sendNote} role="status">
          <Copy value={t.failedText} />
        </p>
      )}

      <div className={`${styles.sky} ${allOpen ? styles.joined : ""}`}>
        <svg
          className={styles.lines}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <polyline points={POS.map((p) => `${p.x},${p.y}`).join(" ")} pathLength={1} />
        </svg>

        {t.stars.map((s, i) => {
          const p = POS[i]!;
          const isOpen = explored[i] ?? false;

          return (
            <button
              key={s.id}
              type="button"
              className={`${styles.star} ${isOpen ? styles.opened : ""} ${selected === i ? styles.current : ""}`}
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                animationDelay: `${i * 0.4}s`,
              }}
              onClick={() => openStar(i)}
              aria-pressed={selected === i}
              aria-label={`${s.theme}${isOpen ? " (opened)" : ""}`}
            >
              <svg viewBox="0 0 40 40" aria-hidden="true">
                <path d="M20 2l4.6 13.4L38 20l-13.4 4.6L20 38l-4.6-13.4L2 20l13.4-4.6z" />
              </svg>

              {isOpen && (
                <span className={styles.tick} aria-hidden="true">
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>

      <p className={c.hint}>
        {allOpen
          ? "Your five wishes are all here ✨"
          : `${t.starsHint}\n${count} of ${t.stars.length} opened`}
      </p>

      <div className={styles.panel} aria-live="polite">
        {openedOrder.map((i) => {
          const star = t.stars[i];
          if (!star) return null;
          return (
            <div key={star.id} className={`${styles.wishCard} ${c.fadeIn}`}>
              <h2 className={styles.wishTheme}>{star.theme}</h2>
              <p className={styles.wishText}>
                <Copy value={star.message} />
              </p>
            </div>
          );
        })}

        {showFinal && (
          <div className={`${styles.wishCard} ${styles.finalCard} ${c.fadeIn}`}>
            <p className={styles.wishText}>
              <Copy value={t.finalMessage} />
            </p>
          </div>
        )}
      </div>

      <div className={c.footer}>
        {allOpen && !showFinal && (
          <Button onClick={() => setShowFinal(true)}>One Last Wish ❤️</Button>
        )}

        {showFinal && <NextButton onClick={goNext} />}
      </div>
    </div>
  );
}
